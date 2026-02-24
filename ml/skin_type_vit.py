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

# Map from HuggingFace label → canonical skin type key (lowercase, matches scores dict)
# dima806/skin_types_image_detection uses: dry, normal, oily
_LABEL_MAP: Dict[str, str] = {
    "dry": "dry",
    "normal": "normal",
    "oily": "oily",
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

    if _model is not None:
        return _extractor, _model

    with _lock:
        if _model is not None:
            return _extractor, _model

        if not _MODEL_DIR.exists():
            raise FileNotFoundError(
                f"ViT model not found. Run: python -m ml.download_models"
            )

        try:
            from transformers import AutoImageProcessor, AutoModelForImageClassification
            import torch  # noqa: F401 — imported here so the error is clear
        except ImportError as exc:
            raise ImportError(
                "Required packages missing. Run: pip install transformers torch Pillow"
            ) from exc

        from transformers import AutoImageProcessor, AutoModelForImageClassification

        _extractor = AutoImageProcessor.from_pretrained(str(_MODEL_DIR))
        _m = AutoModelForImageClassification.from_pretrained(str(_MODEL_DIR))
        _m.eval()
        _model = _m

    return _extractor, _model


def infer_skin_type_vit(image_rgb: np.ndarray) -> Dict[str, Any]:
    """
    Infer skin type from a 224×224 RGB numpy array using the local ViT model.

    Args:
        image_rgb: np.ndarray of shape (224, 224, 3), dtype uint8 or float32.

    Returns:
        {
            "skin_type":  "Oily" | "Dry" | "Normal" | "Combination",
            "confidence": float,          # 0.0 – 1.0
            "scores": {                   # per-type softmax scores
                "oily":   float,
                "dry":    float,
                "normal": float,
            },
            "explanation": str,
        }

    Raises:
        FileNotFoundError: if the model folder does not exist.
    """
    import torch
    import torch.nn.functional as F
    from PIL import Image

    extractor, model = _ensure_model()

    # Convert numpy array → PIL Image (extractor expects PIL or list of PIL)
    if image_rgb.dtype != np.uint8:
        image_rgb = np.clip(image_rgb, 0, 255).astype(np.uint8)
    pil_image = Image.fromarray(image_rgb)

    # Preprocess
    inputs = extractor(images=pil_image, return_tensors="pt")

    # Inference
    with torch.no_grad():
        logits = model(**inputs).logits  # shape: (1, num_labels)

    probs = F.softmax(logits, dim=-1).squeeze(0)  # shape: (num_labels,)

    try:
        # Build id2label from model config
        id2label: Dict[int, str] = model.config.id2label  # e.g. {0: "dry", 1: "normal", 2: "oily"}

        # Map to canonical names and collect scores
        scores: Dict[str, float] = {"oily": 0.0, "dry": 0.0, "normal": 0.0}
        for idx, raw_label in id2label.items():
            canonical = _LABEL_MAP.get(raw_label.lower(), raw_label.lower())
            prob_val = float(probs[idx].item())
            if canonical in scores:
                scores[canonical] += prob_val
            # If the model has unexpected labels, they are silently absorbed

        # Determine winner
        best_key = max(scores, key=scores.__getitem__)
        confidence = scores[best_key]

        # Low-confidence fallback
        if confidence < 0.30:
            skin_type = "Uncertain - Retake image"
            explanation = (
                f"Low confidence ({confidence * 100:.0f}%) — retake in better lighting."
            )
        else:
            skin_type = _DISPLAY.get(best_key, best_key.capitalize())
            explanation = _EXPLANATIONS.get(best_key, f"Classified as {skin_type}.")

        import logging
        logger = logging.getLogger("ml.skin_type_vit")
        logger.info("Skin type prediction: %s (%.2f) | scores=%s", skin_type, confidence, scores)

    except Exception as exc:
        import logging
        logger = logging.getLogger("ml.skin_type_vit")
        logger.error("ViT Inference failed: %s", exc)
        raise

    return {
        "skin_type": skin_type,
        "confidence": round(confidence, 4),
        "scores": {k: round(v, 4) for k, v in scores.items()},
        "explanation": explanation,
    }
