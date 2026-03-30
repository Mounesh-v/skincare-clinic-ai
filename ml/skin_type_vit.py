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

    try:
        # Build id2label from model config
        id2label: Dict[int, str] = model.config.id2label

        # Step 1: Extract logits to dict mapped by canonical class names.
        # ViT output is limited to oily/dry/normal.
        raw_logits = logits.squeeze(0).tolist()
        logits_dict = {"oily": 0.0, "dry": 0.0, "normal": 0.0}
        
        for idx, raw_label in id2label.items():
            canonical = _LABEL_MAP.get(raw_label.lower(), raw_label.lower())
            if canonical in logits_dict:
                logits_dict[canonical] += raw_logits[idx]

        # Step 2: Apply bias correction (CRITICAL)
        # We manually tune the raw logits before softmax to natively suppress
        # the model's heavy bias towards Oily skin.
        logits_dict["oily"] -= 0.25
        logits_dict["normal"] += 0.15

        # Step 3: Convert back to list preserving a fixed ordering
        order = ["oily", "dry", "normal"]
        adjusted_logits = [logits_dict[k] for k in order]

        # Step 4: Apply temperature scaling and softmax
        # Temperature (T=1.2) softens distribution slightly for stable prediction spreads
        _TEMPERATURE = 1.2
        scaled_logits = torch.tensor(adjusted_logits) / _TEMPERATURE
        probs = F.softmax(scaled_logits, dim=-1).tolist()

        # Step 5: Normalize and assign scores
        total = sum(probs)
        scores = {k: v / total for k, v in zip(order, probs)}

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


def infer_skin_type_ensemble(
    image_rgb: "np.ndarray",
    condition_probs: "dict[str, float]",
    vit_weight: float = 0.65,
    rule_weight: float = 0.35,
) -> "dict":
    """
    Ensemble blend of ViT model + rule-based skin type inference.

    Adaptive weighting strategy:
    - EfficientNet confidence >= 0.88 → rule_shortcut, skip ViT entirely
    - EfficientNet confidence >= 0.75 → rule_weight=0.80, vit_weight=0.20
    - EfficientNet confidence >= 0.60 → rule_weight=0.65, vit_weight=0.35
    - EfficientNet confidence >= 0.50 → rule_weight=0.50, vit_weight=0.50
    - EfficientNet confidence <  0.50 → rule_weight=0.35, vit_weight=0.65

    This ensures high-confidence EfficientNet predictions
    are never overridden by ViT.
    
    Args:
        image_rgb: np.ndarray of shape (224, 224, 3), dtype uint8 or float32
        condition_probs: Dictionary with EfficientNet condition probabilities
            Expected keys: acne, pores, wrinkles, blackheads, dark_spots
        vit_weight: Default ViT weight (used when EfficientNet confidence < 0.50)
        rule_weight: Default rule weight (used when EfficientNet confidence < 0.50)
    
    Returns:
        Dictionary containing:
            - skin_type: Predicted skin type
            - confidence: Confidence score (0.0 to 1.0)
            - scores: Blended scores for each type
            - explanation: Human-readable explanation
            - source: Indicates whether shortcut or ensemble was used
    """
    import logging
    logger = logging.getLogger("ml.skin_type_vit")

    from .skin_type_inference import infer_skin_type

    # ── Step 1: Canonicalize condition keys and handle dark spots variants ──
    canonical_conditions: dict[str, float] = {
        "acne": 0.0,
        "pores": 0.0,
        "wrinkles": 0.0,
        "blackheads": 0.0,
        "dark_spots": 0.0,
    }
    for key, value in (condition_probs or {}).items():
        norm_key = str(key).strip().lower().replace(" ", "_")
        if norm_key == "darkspots":
            norm_key = "dark_spots"
        if norm_key in canonical_conditions:
            canonical_conditions[norm_key] = float(value)

    max_conf = max(canonical_conditions.values()) if canonical_conditions else 0.0
    max_key  = max(canonical_conditions, key=lambda k: canonical_conditions.get(k, 0.0)) if canonical_conditions else ""

    # ── Step 2: Rule-based prediction ────────────────────────
    rule_result = infer_skin_type(canonical_conditions)

    # ── Step 3: If dominant condition is very strong, skip ViT ──
    if max_conf >= 0.88:
        logger.info(
            "Ensemble: rule_shortcut triggered | condition=%s (%.2f) → %s",
            max_key, max_conf, rule_result["skin_type"],
        )
        return {
            "skin_type":   rule_result["skin_type"],
            "confidence":  round(rule_result["confidence"], 4),
            "scores":      {k: round(v, 4) for k, v in rule_result["scores"].items()},
            "explanation": rule_result["explanation"],
            "source":      "rule_shortcut",
        }

    # ── Step 4: Adaptive weights based on EfficientNet conf ──
    if max_conf >= 0.75:
        eff_vit  = 0.20
        eff_rule = 0.80
    elif max_conf >= 0.60:
        eff_vit  = 0.35
        eff_rule = 0.65
    elif max_conf >= 0.50:
        eff_vit  = 0.50
        eff_rule = 0.50
    else:
        eff_vit  = vit_weight   # default 0.65
        eff_rule = rule_weight  # default 0.35

    # ── Step 5: ViT prediction ────────────────────────────────
    vit_result  = infer_skin_type_vit(image_rgb)
    vit_scores  = vit_result
    rule_scores = rule_result["scores"]

    # ── Step 6: Blend ─────────────────────────────────────────
    blended: dict[str, float] = {}
    for key in ("oily", "dry", "normal"):
        blended[key] = (
            eff_vit  * vit_scores.get(key, 0.0)
            + eff_rule * rule_scores.get(key, 0.0)
        )
    blended["combination"] = rule_scores.get("combination", 0.0) * eff_rule

    # ── Step 7: Normalise ─────────────────────────────────────
    total   = sum(blended.values()) or 1.0
    blended = {k: v / total for k, v in blended.items()}

    best_key   = max(blended, key=blended.__getitem__)
    confidence = blended[best_key]

    # ── Step 8: Build response ────────────────────────────────
    if confidence < 0.30:
        skin_type   = "Uncertain - Retake image"
        explanation = (
            f"Low ensemble confidence ({confidence*100:.0f}%) "
            f"— retake in better lighting."
        )
    else:
        skin_type   = _DISPLAY.get(best_key, best_key.capitalize())
        explanation = _EXPLANATIONS.get(
            best_key, f"Ensemble classified as {skin_type}."
        )

    logger.info(
        "Ensemble done: %s (%.4f) | weights=vit:%.2f/rule:%.2f "
        "| dominant_condition=%s(%.2f) | scores=%s",
        skin_type, confidence,
        eff_vit, eff_rule,
        max_key, max_conf,
        {k: round(v, 2) for k, v in blended.items()},
    )

    return {
        "skin_type":   skin_type,
        "confidence":  round(confidence, 4),
        "scores":      {k: round(v, 4) for k, v in blended.items()},
        "explanation": explanation,
        "source":      f"ensemble(vit={eff_vit:.2f}/rule={eff_rule:.2f})",
    }



