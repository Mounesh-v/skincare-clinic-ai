"""Core inference helper for the skin analysis service."""
from __future__ import annotations

import base64
import datetime as dt
import json
import logging
import re
import threading
from dataclasses import dataclass
from typing import Any, Dict, List, Mapping, Tuple

import cv2
import numpy as np
import torch

from ml.config import CONFIG
from ml.model_utils import inference_model, load_class_map, to_tensor
from ml.preprocessing import preprocess_image_bytes
from ml.skin_type_vit import infer_skin_type_vit, preload_vit_model

from .recommendations import build_personalized_plan

LOGGER = logging.getLogger(__name__)
_DATA_URL_PATTERN = re.compile(r"^data:(?P<mime>[^;]+);base64,(?P<payload>.+)$")


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
        self._device = torch.device(CONFIG.default_device)
        self._model: torch.nn.Module | None = None
        self._lock = threading.Lock()
        # Semaphore: only 1 ViT inference at a time to prevent OOM
        self._vit_sem = threading.Semaphore(1)
        # Warm up models in background
        threading.Thread(target=self._warmup, daemon=True).start()

    def _warmup(self) -> None:
        try:
            LOGGER.info("Warming up models...")
            self._ensure_model()
            # Pre-load ViT weights into memory (no dummy inference needed)
            preload_vit_model()
            LOGGER.info("Models warmed up.")
        except Exception as exc:
            LOGGER.error("Warmup failed: %s", exc)

    def _ensure_model(self) -> torch.nn.Module:
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is None:
                weights = CONFIG.models_dir / "skin_classifier.pt"
                if not weights.exists():
                    raise FileNotFoundError(
                        f"Model weights not found at {weights}. Run training or copy the checkpoint first."
                    )
                LOGGER.info("Loading skin classifier weights from %s", weights)
                model = inference_model(len(self._idx_to_label), weights)
                model.to(self._device)
                self._model = model
        return self._model

    @staticmethod
    def _decode_image_bytes(image_data: str) -> bytes:
        if not image_data:
            raise ValueError("image_data is required")
        match = _DATA_URL_PATTERN.match(image_data)
        payload = match.group("payload") if match else image_data
        try:
            return base64.b64decode(payload)
        except Exception as exc:  # pragma: no cover - defensive
            raise ValueError("Unable to decode image data payload") from exc

    @staticmethod
    def _feature_insights(image: np.ndarray) -> list[dict[str, Any]]:
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        brightness_mean = float(gray.mean())
        brightness_std = float(gray.std())
        oil_index = float(hsv[:, :, 1].mean())
        texture = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        return [
            {"label": "Brightness Mean", "value": round(brightness_mean, 2), "unit": ""},
            {"label": "Brightness Variability", "value": round(brightness_std, 2), "unit": ""},
            {"label": "Oil Activity Index", "value": round(oil_index, 2), "unit": ""},
            {"label": "Texture Energy", "value": round(texture, 2), "unit": ""},
        ]

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
    def _severity(prob: float) -> Tuple[str, int]:
        if prob >= 0.8:
            return "Low", 2
        if prob >= 0.55:
            return "Moderate", 4
        return "High", 6

    def analyze_request(self, payload: Mapping[str, Any]) -> Dict[str, Any]:
        if not isinstance(payload, Mapping):
            raise ValueError("Request body must be a JSON object")
        image_data = payload.get("image_data")
        if not isinstance(image_data, str):
            raise ValueError("image_data must be a base64-encoded string")
        answers = payload.get("answers") or {}
        lead = payload.get("lead") or {}
        raw_bytes = self._decode_image_bytes(image_data)
        try:
            processed, face_score = preprocess_image_bytes(
                raw_bytes,
                enforce_face=True,
                debug_hook=self._crop_debug,
                debug_tag=lead.get("name") or "anonymous",
            )
        except ValueError as exc:
            raise ValueError(str(exc))
        prediction = self._run_prediction(processed)
        
        # Infer skin type from the preprocessed image using ViT
        # Semaphore ensures only one ViT inference runs at a time (CPU memory safety)
        with self._vit_sem:
            LOGGER.info("Running ViT skin type inference...")
            skin_type_result = infer_skin_type_vit(processed)
            LOGGER.info("ViT done: %s", skin_type_result.get("skin_type"))
        
        plan = build_personalized_plan(prediction.label_key, answers)
        severity_label, months_to_results = self._severity(prediction.probability)
        success_probability = round(0.5 + prediction.probability * 0.4, 2)
        feature_insights = self._feature_insights(processed)
        image_notes = self._compose_image_notes(face_score, answers)
        
        # Structure response with skin_type as PRIMARY result
        response = {
            # PRIMARY RESULT: Skin Type (Oily/Dry/Normal/Combination)
            "skin_type": skin_type_result["skin_type"],
            "confidence": skin_type_result["confidence"],
            "skin_type_scores": skin_type_result["scores"],
            "explanation": skin_type_result["explanation"],
            
            # SECONDARY: Detected conditions (internal use, recommendations)
            "conditions_detected": {
                "primary": prediction.label_key,
                "label": prediction.label_name,
                "confidence": prediction.probability,
                "all_conditions": prediction.probabilities,
                "top_predictions": prediction.top_predictions,
            },
            
            # User info
            "lead": {
                "name": lead.get("name", "Guest"),
                "age": lead.get("age"),
                "gender": lead.get("gender"),
            },
            
            # Image quality metrics
            "image_analysis": {
                "face_score": face_score,
                "feature_insights": feature_insights,
                "notes": image_notes,
            },
            
            # Recommendations and plan (uses condition for context)
            "severity": severity_label,
            "stage_label": plan["stage_label"],
            "root_causes": plan["root_causes"],
            "plan_focus": plan["plan_focus"],
            "lifestyle": plan["lifestyle"],
            "recommendations": plan["recommendations"],
            "timeline": plan["timeline"],
            "matched_case": plan["matched_case"],
            "months_to_results": months_to_results,
            "success_probability": success_probability,
            "created_at": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        }
        return response

    @staticmethod
    def _compose_image_notes(face_score: float, answers: Mapping[str, Any]) -> str:
        if face_score >= 0.6:
            base = "Great lighting and framing."
        elif face_score >= 0.3:
            base = "Lighting ok, try facing a window next time."
        else:
            base = "Face confidence was low; retake in brighter light."
        if answers.get("stress") in {"high", "very-high"}:
            base += " Stress markers suggest extra soothing textures."
        return base

    @staticmethod
    def serialize_payload(payload: Dict[str, Any]) -> str:
        return json.dumps(payload, indent=2, ensure_ascii=False)
