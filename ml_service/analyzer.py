"""Core inference helper for the skin analysis service."""
from __future__ import annotations

import base64
import datetime as dt
import json
import logging
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Mapping, Tuple
from uuid import uuid4

import numpy as np
import torch

from ml.config import CONFIG
from ml.model_utils import inference_model, load_class_map, to_tensor
from ml.preprocessing import decode_image_payload, detect_face_with_retry, preprocess_array
from ml.skin_type_vit import infer_skin_type_vit, preload_vit_model

from .recommendations import build_personalized_plan

LOGGER = logging.getLogger(__name__)
_DATA_URL_PATTERN = re.compile(r"^data:(?P<mime>[^;]+);base64,(?P<payload>.+)$")

# MIME allowlist for uploaded images
_ALLOWED_MIMES = frozenset({"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"})

# Known image magic bytes (file signatures)
_MAGIC_SIGNATURES: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff",      "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"RIFF",              "image/webp"),  # RIFF....WEBP
    (b"GIF8",              "image/gif"),
    (b"BM",               "image/bmp"),
]
# Maximum decoded (raw bytes) image size: 8 MB
_MAX_DECODED_BYTES = 8 * 1024 * 1024

global_condition_model: torch.nn.Module | None = None
global_vit_model: Any = None
_MODEL_LOCK = threading.Lock()


def _to_ms(start: float, end: float) -> int:
    return int((end - start) * 1000)


@dataclass
class PredictionPayload:
    label_key: str
    label_name: str
    probability: float
    probabilities: Dict[str, float]
    top_predictions: List[Dict[str, Any]]


class SkinAnalyzerService:
    """Wraps the PyTorch model and feature engineering helpers."""

    def __init__(self) -> None:
        self._idx_to_label, _, self._display_labels = load_class_map()
        requested_device = CONFIG.default_device
        if requested_device.startswith("cuda") and not torch.cuda.is_available():
            requested_device = "cpu"
        self._device = torch.device(requested_device)
        # Semaphore: only 1 ViT inference at a time to prevent OOM
        self._vit_sem = threading.Semaphore(1)
        self._cpu_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="ml-cpu")
        self._io_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="dataset-io")
        self._dataset_root = Path(__file__).resolve().parents[1] / "ml" / "data" / "user_collected"
        self._dataset_log_path = self._dataset_root / "dataset_log.csv"
        self._prepare_dataset_dirs()

    def load_models(self) -> None:
        LOGGER.info("Loading analysis models at startup...")
        self._ensure_model()
        preload_vit_model()
        global global_vit_model
        global_vit_model = "preloaded"
        # Warmup pass to avoid first-request latency spikes.
        dummy = np.zeros((CONFIG.image_size, CONFIG.image_size, 3), dtype=np.uint8)
        _ = self._run_prediction(dummy)
        with self._vit_sem:
            _ = infer_skin_type_vit(dummy)
        LOGGER.info("Startup model preload complete.")

    def _prepare_dataset_dirs(self) -> None:
        self._dataset_root.mkdir(parents=True, exist_ok=True)
        for label in self._idx_to_label.values():
            (self._dataset_root / self._label_to_dir_name(label)).mkdir(parents=True, exist_ok=True)
        if not self._dataset_log_path.exists():
            self._dataset_log_path.write_text(
                "image_path,predicted_label,confidence,timestamp\n",
                encoding="utf-8",
            )

    def _ensure_model(self) -> torch.nn.Module:
        global global_condition_model
        if global_condition_model is not None:
            return global_condition_model
        with _MODEL_LOCK:
            if global_condition_model is None:
                weights = CONFIG.model_v2s_weights
                if not weights.exists():
                    raise FileNotFoundError(
                        f"Model weights not found at {weights}. Run training or copy the checkpoint first."
                    )
                LOGGER.info("Loading skin classifier weights from %s", weights)
                model = inference_model(len(self._idx_to_label), weights)
                model.to(self._device)
                model.eval()
                global_condition_model = model
        return global_condition_model

    @staticmethod
    def _decode_image_bytes(image_data: str) -> bytes:
        if not image_data:
            raise ValueError("image_data is required")
        match = _DATA_URL_PATTERN.match(image_data)
        mime_type: str | None = None
        if match:
            mime_type = match.group("mime").lower().split(";")[0].strip()
            if mime_type not in _ALLOWED_MIMES:
                raise ValueError(
                    f"Unsupported image type '{mime_type}'. "
                    f"Accepted: {', '.join(sorted(_ALLOWED_MIMES))}."
                )
            payload = match.group("payload")
        else:
            payload = image_data
        try:
            raw = base64.b64decode(payload)
        except Exception as exc:
            raise ValueError("Unable to decode image data payload") from exc

        # Decoded size cap
        if len(raw) > _MAX_DECODED_BYTES:
            raise ValueError(
                f"Decoded image exceeds {_MAX_DECODED_BYTES // (1024*1024)} MB limit."
            )

        # Magic-byte verification — reject files that don't match a known image signature
        matched_sig = any(raw[:len(sig)] == sig for sig, _ in _MAGIC_SIGNATURES)
        # Special-case WebP: RIFF....WEBP
        if not matched_sig:
            raise ValueError(
                "Image signature not recognised. Upload a valid JPEG, PNG, WebP, GIF, or BMP file."
            )
        # Extra WebP check: bytes 8-12 must be b'WEBP'
        if raw[:4] == b"RIFF" and raw[8:12] != b"WEBP":
            raise ValueError(
                "File has a RIFF header but is not a valid WebP image."
            )
        return raw

    def _run_prediction(self, image_rgb: np.ndarray) -> PredictionPayload:
        model = self._ensure_model()
        tensor = to_tensor(image_rgb).to(self._device)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        best_idx = int(np.argmax(probs))
        label_key = self._idx_to_label[best_idx]
        label_name = self._display_labels.get(label_key, label_key.title())
        probability = float(probs[best_idx])
        probabilities = {
            self._idx_to_label[idx]: float(prob)
            for idx, prob in enumerate(probs)
        }
        sorted_idx = np.argsort(probs)[::-1][: min(3, probs.shape[0])]
        top_predictions = [
            {
                "label": self._idx_to_label[int(idx)],
                "display": self._display_labels.get(self._idx_to_label[int(idx)], self._idx_to_label[int(idx)].title()),
                "probability": float(probs[int(idx)]),
            }
            for idx in sorted_idx
        ]
        LOGGER.info(
            "Prediction: %s (%.2f) | top=%s",
            label_name,
            probability,
            [(entry["label"], round(entry["probability"], 3)) for entry in top_predictions],
        )
        # Entropy log — detect constant-confidence bias
        entropy = -float(sum(p * np.log2(p) for p in probs if p > 1e-9))
        if entropy < 0.01:
            LOGGER.warning(
                "BIAS ALERT: Near-zero entropy (%.4f) for prediction %s — model may be overfit or input degenerate.",
                entropy, label_name,
            )
        else:
            LOGGER.info("Prediction entropy: %.4f bits", entropy)
        return PredictionPayload(
            label_key=label_key,
            label_name=label_name,
            probability=probability,
            probabilities=probabilities,
            top_predictions=top_predictions,
        )

    @staticmethod
    def _crop_debug(payload: Dict[str, Any]) -> None:
        LOGGER.info(
            "Crop debug [%s]: shape=%s face_score=%.2f mean=%.2f min=%s max=%s rect=%s",
            payload.get("tag"),
            payload.get("crop_shape"),
            payload.get("face_score"),
            payload.get("mean"),
            payload.get("min"),
            payload.get("max"),
            payload.get("detection"),
        )

    @staticmethod
    def _label_to_dir_name(label: str) -> str:
        return label.strip().lower().replace(" ", "_")

    @staticmethod
    def _guess_extension(raw: bytes) -> str:
        if raw.startswith(b"\xff\xd8\xff"):
            return ".jpg"
        if raw.startswith(b"\x89PNG"):
            return ".png"
        if raw.startswith(b"RIFF") and raw[8:12] == b"WEBP":
            return ".webp"
        if raw.startswith(b"GIF8"):
            return ".gif"
        if raw.startswith(b"BM"):
            return ".bmp"
        return ".jpg"

    def _append_dataset_entry(self, image_path: Path, label: str, confidence: float, timestamp: str) -> None:
        line = f"{image_path.as_posix()},{label},{confidence:.4f},{timestamp}\n"
        with self._dataset_log_path.open("a", encoding="utf-8") as file:
            file.write(line)

    def _persist_user_sample(self, raw_bytes: bytes, prediction: PredictionPayload) -> None:
        timestamp = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
        label_dir = self._dataset_root / self._label_to_dir_name(prediction.label_key)
        label_dir.mkdir(parents=True, exist_ok=True)
        ext = self._guess_extension(raw_bytes)
        filename = f"{dt.datetime.utcnow().strftime('%Y%m%dT%H%M%S')}_{uuid4().hex[:8]}{ext}"
        image_path = label_dir / filename
        image_path.write_bytes(raw_bytes)
        self._append_dataset_entry(image_path, prediction.label_key, prediction.probability, timestamp)

    def _persist_user_sample_async(self, raw_bytes: bytes, prediction: PredictionPayload) -> None:
        self._io_executor.submit(self._persist_user_sample, raw_bytes, prediction)

    def analyze_request(self, payload: Mapping[str, Any]) -> Dict[str, Any]:
        t0 = time.perf_counter()
        if not isinstance(payload, Mapping):
            raise ValueError("Request body must be a JSON object")
        image_data = payload.get("image_data")
        if not isinstance(image_data, str):
            raise ValueError("image_data must be a base64-encoded string")
        answers = payload.get("answers") or {}
        lead = payload.get("lead") or {}

        t_decode_start = time.perf_counter()
        raw_bytes = self._decode_image_bytes(image_data)
        image_rgb = decode_image_payload(raw_bytes)
        t_decode_end = time.perf_counter()

        t_face_start = time.perf_counter()
        try:
            face_detection = self._cpu_executor.submit(detect_face_with_retry, image_rgb, True).result()
        except ValueError as exc:
            raise ValueError(str(exc))
        t_face_end = time.perf_counter()

        t_pre_start = time.perf_counter()
        processed, face_score = self._cpu_executor.submit(
            preprocess_array,
            image_rgb,
            detection=face_detection,
            enforce_face=True,
            debug_hook=self._crop_debug,
            debug_tag=lead.get("name") or "anonymous",
        ).result()
        t_pre_end = time.perf_counter()

        # Hard face-score guard — catches slipthrough from 50%-threshold retry
        if face_score < 0.35:
            raise ValueError(
                f"Face confidence too low ({face_score:.2f}). "
                "Please retake the photo with your face centred, well-lit, and filling the frame."
            )

        t_eff_start = time.perf_counter()
        prediction = self._run_prediction(processed)
        t_eff_end = time.perf_counter()
        
        # Infer skin type from the preprocessed image using ViT
        # Semaphore ensures only one ViT inference runs at a time (CPU memory safety)
        t_vit_start = time.perf_counter()
        with self._vit_sem:
            LOGGER.info("Running ViT skin type inference...")
            skin_type_result = infer_skin_type_vit(processed)
            LOGGER.info("ViT done: %s", skin_type_result.get("skin_type"))
        t_vit_end = time.perf_counter()

        t_ens_start = time.perf_counter()
        plan = build_personalized_plan(prediction.label_key, answers)

        detected_conditions = [
            {
                "label": entry["label"],
                "display": entry["display"],
                "probability": entry["probability"],
            }
            for entry in prediction.top_predictions
        ]

        response = {
            "skin_type": skin_type_result["skin_type"],
            "confidence": skin_type_result["confidence"],
            "detected_conditions": detected_conditions,
            "explanation": skin_type_result["explanation"],
            "recommendations": plan["recommendations"],
        }
        t_ens_end = time.perf_counter()
        total_end = time.perf_counter()

        self._persist_user_sample_async(raw_bytes, prediction)

        LOGGER.info(
            "[PIPELINE]\n"
            "decode_ms=%d\n"
            "preprocess_ms=%d\n"
            "face_detect_ms=%d\n"
            "efficientnet_ms=%d\n"
            "vit_ms=%d\n"
            "ensemble_ms=%d\n"
            "total_ms=%d",
            _to_ms(t_decode_start, t_decode_end),
            _to_ms(t_pre_start, t_pre_end),
            _to_ms(t_face_start, t_face_end),
            _to_ms(t_eff_start, t_eff_end),
            _to_ms(t_vit_start, t_vit_end),
            _to_ms(t_ens_start, t_ens_end),
            _to_ms(t0, total_end),
        )

        LOGGER.info(
            "analyze_request complete | skin_type=%s confidence=%.2f face_score=%.2f elapsed_ms=%d",
            skin_type_result["skin_type"],
            skin_type_result["confidence"],
            face_score,
            _to_ms(t0, total_end),
        )
        return response

    @staticmethod
    def serialize_payload(payload: Dict[str, Any]) -> str:
        return json.dumps(payload, indent=2, ensure_ascii=False)
