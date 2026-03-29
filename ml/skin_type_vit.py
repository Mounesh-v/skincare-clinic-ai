"""
ViT-based skin type inference module.

Drop-in replacement for ml/skin_type_inference.py.
Loads the fine-tuned ViT model from local disk only — no API calls.

Usage:
    from ml.skin_type_vit import infer_skin_type_vit
    result = infer_skin_type_vit(image_rgb_224x224)
"""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Any, Dict

import numpy as np

# ---------------------------------------------------------------------------
# Model path
# ---------------------------------------------------------------------------
_MODEL_DIR = Path(__file__).resolve().parent / "models" / "vit_skin_type"

# ---------------------------------------------------------------------------
# Thread-safe lazy loader
# ---------------------------------------------------------------------------
_lock = threading.Lock()
_extractor = None
_model = None
_device = None
_warmed = False

# Map from HuggingFace label → canonical skin type key (lowercase, matches scores dict)
# dima806/skin_types_image_detection uses: dry, normal, oily
_LABEL_MAP: Dict[str, str] = {
    "dry": "dry",
    "normal": "normal",
    "oily": "oily",
    "combination": "combination",
}

# Display names (title-cased) for each skin type key
_DISPLAY: Dict[str, str] = {
    "dry": "Dry",
    "normal": "Normal",
    "oily": "Oily",
    "combination": "Combination",
}

# Explanation templates
_EXPLANATIONS: Dict[str, str] = {
    "dry": "Reduced sebum and fine lines suggest dry skin.",
    "normal": "Balanced sebum and texture indicate normal skin.",
    "oily": "Enlarged pores and excess sebum detected.",
    "combination": "Mixed oily and dry zones detected.",
}


def _ensure_model():
    """Load model and extractor from local disk (once, thread-safe)."""
    global _extractor, _model

    # Fast path: model already loaded.
    if _model is not None:
        return _extractor, _model

    # Lazy-load synchronously if startup preload has not happened yet.
    preload_vit_model()
    return _extractor, _model


def preload_vit_model() -> None:
    """Load model once at startup (call from a background thread)."""
    global _extractor, _model, _device, _warmed

    if _model is not None:
        return

    with _lock:
        if _model is not None:
            return

        if not _MODEL_DIR.exists():
            raise FileNotFoundError(
                f"ViT model not found. Run: python -m tools.training.download_models"
            )

        try:
            from transformers import AutoImageProcessor, AutoModelForImageClassification
            import torch
        except ImportError as exc:
            raise ImportError(
                "Required packages missing. Run: pip install transformers torch Pillow"
            ) from exc

        from transformers import AutoImageProcessor, AutoModelForImageClassification
        from .config import CONFIG

        _extractor = AutoImageProcessor.from_pretrained(str(_MODEL_DIR))
        _m = AutoModelForImageClassification.from_pretrained(str(_MODEL_DIR))
        preferred_device = CONFIG.default_device
        if preferred_device.startswith("cuda") and not torch.cuda.is_available():
            preferred_device = "cpu"
        _device = torch.device(preferred_device)
        _m.to(_device)
        _m.eval()
        _model = _m
        if not _warmed and _extractor is not None:
            from PIL import Image

            dummy = Image.fromarray(np.zeros((224, 224, 3), dtype=np.uint8))
            inputs = _extractor(images=dummy, return_tensors="pt")
            inputs = {k: v.to(_device) for k, v in inputs.items()}
            with torch.no_grad():
                _model(**inputs)
            _warmed = True


def normalize_skin_tone(img_rgb: np.ndarray) -> np.ndarray:
    import cv2

    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    l_norm = clahe.apply(l)
    normalized = cv2.merge([l_norm, a, b])
    return cv2.cvtColor(normalized, cv2.COLOR_LAB2RGB)


def infer_skin_type_vit(image_rgb: np.ndarray) -> Dict[str, Any]:
    """
    Infer skin type from a 224×224 RGB numpy array using the local ViT model.

    Args:
        image_rgb: np.ndarray of shape (224, 224, 3), dtype uint8 or float32.

    Returns:
        {
            "oily":        float,
            "dry":         float,
            "normal":      float,
            "combination": float,
        }

    Raises:
        FileNotFoundError: if the model folder does not exist.
    """
    import torch
    import torch.nn.functional as F
    from PIL import Image

    extractor, model = _ensure_model()
    assert extractor is not None  # guaranteed by _ensure_model(); narrows type for Pylance
    assert model is not None
    assert _device is not None

    # Convert numpy array → PIL Image (extractor expects PIL or list of PIL)
    if image_rgb.dtype != np.uint8:
        image_rgb = np.clip(image_rgb, 0, 255).astype(np.uint8)
    image_rgb = normalize_skin_tone(image_rgb)
    pil_image = Image.fromarray(image_rgb)

    # Preprocess
    inputs = extractor(images=pil_image, return_tensors="pt")
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    # Inference
    with torch.no_grad():
        logits = model(**inputs).logits  # shape: (1, num_labels)

    # Temperature scaling (T > 1 softens distribution, reduces overconfident "dry" bias)
    _TEMPERATURE = 1.2
    scaled_logits = logits / _TEMPERATURE
    probs = F.softmax(scaled_logits, dim=-1).squeeze(0)  # shape: (num_labels,)

    try:
        # Build id2label from model config
        id2label: Dict[int, str] = model.config.id2label  # e.g. {0: "dry", 1: "normal", 2: "oily"}

        # Map to canonical names and collect scores
        scores: Dict[str, float] = {"oily": 0.0, "dry": 0.0, "normal": 0.0, "combination": 0.0}
        for idx, raw_label in id2label.items():
            canonical = _LABEL_MAP.get(raw_label.lower(), raw_label.lower())
            prob_val = float(probs[idx].item())
            if canonical in scores:
                scores[canonical] += prob_val
            # If the model has unexpected labels, they are silently absorbed

        # Determine winner
        best_key = max(scores, key=scores.__getitem__)
        confidence = scores[best_key]

        import logging
        logger = logging.getLogger("ml.skin_type_vit")

        # Log top-3 predictions for every inference call — helps diagnose bias
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top3 = [(k, round(v * 100, 1)) for k, v in sorted_scores[:3]]
        logger.info(
            "ViT top-3 predictions: %s | raw_logits_max=%.3f | temperature=%.1f",
            top3,
            float(logits.max().item()),
            _TEMPERATURE,
        )

    except Exception as exc:
        import logging
        logger = logging.getLogger("ml.skin_type_vit")
        logger.error("ViT Inference failed: %s", exc)
        raise

    return {k: round(v, 4) for k, v in scores.items()}



