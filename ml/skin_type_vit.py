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
            "skin_type":  "Oily" | "Dry" | "Normal" | "Combination",
            "confidence": float,          # 0.0 – 1.0
            "scores": {                   # per-type softmax scores
                "oily":        float,
                "dry":         float,
                "normal":      float,
                "combination": float,
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

    probs = F.softmax(logits, dim=-1).squeeze(0)  # shape: (num_labels,)

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


# IMPROVEMENT: Ensemble blends the ViT vision signal with rule-based heuristics
# from skin_type_inference.  Empirically reduces hard-misclassification of
# "combination" skin (which the ViT model cannot output on its own) and smooths
# confidence on ambiguous or low-quality images.
def infer_skin_type_ensemble(
    image_rgb: "np.ndarray",
    condition_probs: "dict[str, float]",
    vit_weight: float = 0.80,
    rule_weight: float = 0.20,
) -> "dict":
    """Blend ViT model scores with rule-based scores from skin_type_inference.

    The ViT model (``dima806/skin_types_image_detection``) predicts oily / dry /
    normal from the pixel content, while the rule-based module converts EfficientNet
    condition probabilities (acne, blackheads, pores, wrinkles, dark_spots) into
    skin-type scores.  The weighted blend produces more stable predictions,
    especially for ``combination`` skin that the ViT cannot detect directly.

    Args:
        image_rgb: RGB uint8 numpy array, same format expected by
            :func:`infer_skin_type_vit`.
        condition_probs: Dict mapping condition label keys to their EfficientNet
            probability scores, e.g. ``{"acne": 0.82, "pores": 0.65, ...}``.
        vit_weight: Relative weight for the ViT model scores (default 0.65).
        rule_weight: Relative weight for the rule-based scores (default 0.35).

    Returns:
        Same schema as :func:`infer_skin_type_vit`, with an extra ``"source"``
        key set to ``\"ensemble\"``::

            {
                "skin_type":  str,
                "confidence": float,
                "scores":     {"oily": float, "dry": float,
                               "normal": float, "combination": float},
                "explanation": str,
                "source":     "ensemble",
            }
    """
    from .skin_type_inference import infer_skin_type

    # --- ViT branch -----------------------------------------------------------
    vit_result = infer_skin_type_vit(image_rgb)
    vit_scores: dict = vit_result["scores"]  # {"oily": x, "dry": y, "normal": z}

    # --- Rule-based branch ----------------------------------------------------
    rule_result = infer_skin_type(condition_probs)
    rule_scores: dict = rule_result["scores"]  # adds "combination" key

    top_condition = max(condition_probs, key=lambda key: condition_probs[key]) if condition_probs else ""
    top_confidence = float(condition_probs.get(top_condition, 0.0)) if condition_probs else 0.0
    if (
        top_condition == "wrinkles"
        and top_confidence > 0.85
        and len(condition_probs) == 1
    ):
        rule_weight = 0.10
        vit_weight = 0.90

    # --- Blend ----------------------------------------------------------------
    blended: dict = {}
    for key in ("oily", "dry", "normal", "combination"):
        blended[key] = (
            vit_weight * vit_scores.get(key, 0.0)
            + rule_weight * rule_scores.get(key, 0.0)
        )

    # Normalise to a valid probability distribution
    total = sum(blended.values()) or 1.0
    blended = {k: v / total for k, v in blended.items()}

    best_key = max(blended, key=blended.__getitem__)
    confidence = blended[best_key]

    return {
        "skin_type": _DISPLAY.get(best_key, best_key.capitalize()),
        "confidence": round(confidence, 4),
        "scores": {k: round(v, 4) for k, v in blended.items()},
        "explanation": _EXPLANATIONS.get(
            best_key, f"Ensemble classified as {best_key}."
        ),
        "source": "ensemble",
    }
