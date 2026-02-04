"""TensorFlow-based skin type predictor with MediaPipe preprocessing."""

from __future__ import annotations

import io
from pathlib import Path
from typing import TYPE_CHECKING, Dict, List, Optional, Set, Tuple, Union

import numpy as np

try:  # Optional dependency for feature statistics
    from PIL import Image, ImageFilter
except Exception:  # pragma: no cover - pillow optional
    Image = None  # type: ignore[assignment]
    ImageFilter = None  # type: ignore[assignment]

try:  # Optional dependency for ML inference
    import tensorflow as tf  # type: ignore[import]
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input  # type: ignore[import]
except ImportError as tensorflow_error:  # pragma: no cover - tensorflow optional
    tf = None  # type: ignore[assignment]
    preprocess_input = None  # type: ignore[assignment]
    print(f"[SkinTypePredictor] TensorFlow unavailable: {tensorflow_error}")

from .preprocessing import (
    CANONICAL_LABELS,
    DISPLAY_LABELS,
    TARGET_IMAGE_SIZE,
    preprocess_image_bytes,
)

if TYPE_CHECKING:
    import tensorflow as tf_typing  # type: ignore[import]
    from PIL import Image as PILImage

CONFIDENCE_THRESHOLD = 0.6
MIN_FACE_SCORE = 0.25


def _softmax(logits: np.ndarray) -> np.ndarray:
    exp = np.exp(logits - np.max(logits))
    return exp / np.sum(exp)


class SkinTypePredictor:
    """Load a SavedModel classifier and expose a predict interface."""

    def __init__(self, weights_dir: Optional[Path] = None, confidence_threshold: float = CONFIDENCE_THRESHOLD) -> None:
        self.weights_dir = Path(weights_dir) if weights_dir else None
        self.confidence_threshold = confidence_threshold
        self._model: Optional["tf_typing.keras.Model"] = None
        self.available = False
        self._label_lookup = {idx: DISPLAY_LABELS[label] for idx, label in enumerate(CANONICAL_LABELS)}
        self._load_model()

    def predict(self, image_bytes: bytes) -> Dict[str, object]:
        pil_image = self._ensure_pillow_image(image_bytes)
        feature_stats = self._compute_feature_stats(pil_image) if pil_image is not None else {}

        try:
            tensor, face_score = self._preprocess_for_model(image_bytes)
        except ValueError as face_error:
            raise ValueError("No_face_detected") from face_error

        if face_score < MIN_FACE_SCORE:
            raise ValueError("No_face_detected")

        notes_messages: List[str] = []

        if self.available and self._model is not None and tf is not None:
            probabilities = self._run_model(tensor)
            top_idx = int(np.argmax(probabilities))
            top_score = float(probabilities[top_idx])
            predicted_label = self._label_lookup[top_idx]
            low_confidence = top_score < self.confidence_threshold
            if low_confidence:
                notes_messages.append("Low confidence, retake image")
        else:
            predicted_label, top_score, probabilities, fallback_note = self._fallback_prediction(feature_stats)
            low_confidence = top_score < self.confidence_threshold
            if fallback_note:
                notes_messages.append(fallback_note)
            if low_confidence:
                notes_messages.insert(0, "Low confidence, retake image")

        notes = " | ".join(notes_messages) if notes_messages else None

        feature_insights = self._build_feature_insights(feature_stats)
        probability_payload = self._format_probabilities(probabilities)

        return {
            "predicted_skin_type": predicted_label,
            "confidence": float(round(top_score, 4)),
            "probabilities": probability_payload,
            "feature_insights": feature_insights,
            "notes": notes,
            "low_confidence": low_confidence,
            "face_score": float(round(face_score, 3)),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _load_model(self) -> None:
        if tf is None:
            print("[SkinTypePredictor] TensorFlow unavailable; running in heuristic mode")
            return

        if self.weights_dir is None:
            print("[SkinTypePredictor] No weights directory supplied; running in heuristic mode")
            return

        candidate = self._resolve_saved_model_path(self.weights_dir)
        if candidate is None:
            print(f"[SkinTypePredictor] SavedModel not found under {self.weights_dir}; running in heuristic mode")
            return

        try:
            self._model = tf.keras.models.load_model(candidate)
            self.available = True
        except Exception as load_error:  # pragma: no cover - defensive
            print(f"[SkinTypePredictor] Failed to load model: {load_error}")
            self._model = None
            self.available = False

    def _preprocess_for_model(self, image_bytes: bytes) -> Tuple[np.ndarray, float]:
        image, face_score = preprocess_image_bytes(
            image_bytes,
            target_size=TARGET_IMAGE_SIZE,
            enforce_face=True,
            min_face_score=MIN_FACE_SCORE,
        )
        if tf is not None and preprocess_input is not None:
            tensor = preprocess_input(image)
        else:
            tensor = image.astype(np.float32)
        return tensor, face_score

    def _run_model(self, tensor: np.ndarray) -> np.ndarray:
        assert tf is not None and self._model is not None  # Guarded by caller
        batched = np.expand_dims(tensor, axis=0)
        preds = self._model.predict(batched, verbose=0)
        if preds.ndim == 2:
            probabilities = preds[0]
        else:
            probabilities = preds
        probabilities = np.asarray(probabilities, dtype=np.float32)
        if probabilities.shape[-1] != len(CANONICAL_LABELS):
            probabilities = _softmax(probabilities)
        return probabilities

    @staticmethod
    def _resolve_saved_model_path(base_path: Path) -> Optional[Path]:
        search_roots: List[Path] = []
        origin = base_path
        if origin.is_file():
            search_roots.append(origin.parent)
        search_roots.extend(
            [
                origin,
                origin / "saved_model",
                origin / "artifacts",
                origin / "artifacts" / "saved_model",
            ]
        )

        visited: Set[Path] = set()
        for root in search_roots:
            candidate = root.resolve()
            if candidate in visited:
                continue
            visited.add(candidate)
            if candidate.is_file() and candidate.name == "saved_model.pb":
                return candidate.parent
            if candidate.is_dir() and (candidate / "saved_model.pb").exists():
                return candidate
        return None

    def _fallback_prediction(self, feature_stats: Dict[str, float]) -> Tuple[str, float, List[Tuple[str, float]], Optional[str]]:
        brightness = feature_stats.get("brightness", 0.5)
        contrast = feature_stats.get("texture_contrast", 0.2)

        if brightness < 0.35 and contrast < 0.15:
            label = "Dry"
        elif brightness > 0.6 and contrast > 0.2:
            label = "Oily"
        elif contrast > 0.28:
            label = "Combination"
        else:
            label = "Normal"

        confidence = 0.55
        probs = []
        for canonical in CANONICAL_LABELS:
            display = DISPLAY_LABELS[canonical]
            score = confidence if display == label else (1.0 - confidence) / (len(CANONICAL_LABELS) - 1)
            probs.append((display, score))
        notes = "Running heuristic fallback. Train/export the TensorFlow model for higher accuracy."
        return label, confidence, probs, notes

    @staticmethod
    def _ensure_pillow_image(image_bytes: bytes) -> Optional["PILImage.Image"]:
        if Image is None:
            return None
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")

    @staticmethod
    def _compute_feature_stats(image: "PILImage.Image") -> Dict[str, float]:
        grayscale = image.convert("L")
        histogram = grayscale.histogram()
        total_pixels = float(sum(histogram)) or 1.0
        brightness = sum(i * hist for i, hist in enumerate(histogram)) / (255.0 * total_pixels)

        if ImageFilter is not None and Image is not None:
            blurred = grayscale.filter(ImageFilter.GaussianBlur(3))
            contrast_map = Image.blend(grayscale, blurred, alpha=0.5)
        else:
            contrast_map = grayscale
        contrast_hist = contrast_map.histogram()
        texture_contrast = np.var(contrast_hist) / 1e6

        resized = grayscale.resize((32, 32))
        row_means = []
        for y in range(32):
            row_slice = resized.crop((0, y, 32, y + 1))
            row_array = np.asarray(row_slice, dtype=np.float32)
            row_means.append(float(np.mean(row_array) / 255.0))
        lighting_variability = float(np.var(row_means))

        return {
            "brightness": float(brightness),
            "texture_contrast": float(min(texture_contrast, 1.0)),
            "lighting_variability": float(min(lighting_variability, 0.5)),
        }

    @staticmethod
    def _build_feature_insights(stats: Dict[str, float]) -> List[Dict[str, Union[float, str]]]:
        if not stats:
            return []
        return [
            {"label": "Brightness", "value": round(stats.get("brightness", 0.0) * 100, 2), "unit": ""},
            {"label": "Texture Contrast", "value": round(stats.get("texture_contrast", 0.0) * 100, 2), "unit": ""},
            {"label": "Lighting Variability", "value": round(stats.get("lighting_variability", 0.0) * 100, 2), "unit": ""},
        ]

    def _format_probabilities(self, probabilities: List[Tuple[str, float]] | np.ndarray) -> List[Dict[str, Union[float, str]]]:
        if isinstance(probabilities, np.ndarray):
            entries: List[Tuple[str, float]] = []
            for idx, score in enumerate(probabilities.tolist()):
                label = self._label_lookup.get(idx, DISPLAY_LABELS[CANONICAL_LABELS[idx]])
                entries.append((label, float(score)))
        else:
            entries = probabilities
        return [{"label": label, "score": float(round(score, 4))} for label, score in entries]


def load_predictor(weights_dir: Path) -> SkinTypePredictor:
    return SkinTypePredictor(weights_dir=weights_dir)
