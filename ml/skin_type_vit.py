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
    features: "dict[str, float | bool] | None" = None,
    vit_weight: float = 0.65,
    rule_weight: float = 0.35,
) -> "dict":
    """
    Ensemble blend of ViT model + rule-based skin type inference.

    Adaptive weighting strategy:
    - EfficientNet confidence >= 0.75 → rule_weight=0.80, vit_weight=0.20
    - EfficientNet confidence >= 0.60 → rule_weight=0.65, vit_weight=0.35
    - EfficientNet confidence >= 0.50 → rule_weight=0.50, vit_weight=0.50
    - EfficientNet confidence <  0.50 → rule_weight=0.35, vit_weight=0.65
    
    Args:
        image_rgb: np.ndarray of shape (224, 224, 3), dtype uint8 or float32
        condition_probs: Dictionary with EfficientNet condition probabilities
            Expected keys: acne, pores, wrinkles, blackheads, dark_spots
        features: Optional calibrated feature flags/metrics for rule engine
        vit_weight: Default ViT weight (used when EfficientNet confidence < 0.50)
        rule_weight: Default rule weight (used when EfficientNet confidence < 0.50)
    
    Returns:
        Dictionary containing:
            - skin_type: Predicted skin type
            - confidence: Confidence score (0.0 to 1.0)
            - scores: Blended scores for each type
            - explanation: Human-readable explanation
            - source: Ensemble weighting source marker
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

    # ── Step 2: Rule-based prediction (single source of truth) ────────────
    rule_output = infer_skin_type(canonical_conditions, features=features)

    # ── Step 3: ViT prediction ────────────────────────────────
    vit_result = infer_skin_type_vit(image_rgb)
    vit_scores = vit_result
    rule_scores = rule_output["scores"]

    # ── Step 4: Resolve rule_type and confidences ────────────────────────
    rule_type_raw = str(rule_output.get("skin_type", "Normal")).strip().lower()
    rule_type = rule_type_raw if rule_type_raw in rule_scores else "normal"
    rule_conf = float(rule_scores.get(rule_type, 0.0))

    vit_type = max(vit_scores, key=lambda k: float(vit_scores.get(k, 0.0)))
    vit_conf = float(max(vit_scores.values())) if vit_scores else 0.0

    # ── Step 4a: FINAL_LOCK when rule engine is confident (≥ 0.70) ────────
    # Below that threshold, blend ViT + rule scores weighted by their
    # respective confidences so ViT can correct low-confidence Normal bias.
    _LOCK_THRESHOLD = 0.70

    if rule_conf >= _LOCK_THRESHOLD:
        # Rule engine wins outright — high-confidence lock.
        final_type_key = rule_type
        final_conf     = rule_conf
        final_scores   = {k: float(rule_scores.get(k, 0.0)) for k in ("oily", "dry", "normal", "combination")}
        blend_active   = False
        w_rule, w_vit  = 1.0, 0.0

    else:
        # Confidence-weighted blend: each model votes in proportion to how
        # confident it is.  ViT outputs oily/dry/normal only; combination
        # inherits its weight exclusively from the rule engine.
        total_weight = rule_conf + vit_conf
        if total_weight < 1e-6:
            # Both near-zero — fall back to rule engine output as-is.
            final_type_key = rule_type
            final_conf     = rule_conf
            final_scores   = {k: float(rule_scores.get(k, 0.0)) for k in ("oily", "dry", "normal", "combination")}
            blend_active   = False
            w_rule, w_vit  = 1.0, 0.0
        else:
            w_rule = rule_conf / total_weight
            w_vit  = vit_conf  / total_weight

            blended: dict[str, float] = {}
            for k in ("oily", "dry", "normal", "combination"):
                r_s = float(rule_scores.get(k, 0.0))
                # ViT has no "combination" label — treat its contribution as 0
                v_s = float(vit_scores.get(k, 0.0))
                blended[k] = w_rule * r_s + w_vit * v_s

            # Re-normalise so scores still sum to 1.0
            total_blended = sum(blended.values())
            if total_blended > 0:
                blended = {k: v / total_blended for k, v in blended.items()}

            final_type_key = max(blended, key=blended.__getitem__)
            final_conf     = float(blended[final_type_key])
            final_scores   = blended
            blend_active   = True

    # ── Step 5: Build response ────────────────────────────────────────────
    if final_conf < 0.30:
        skin_type   = "Uncertain - Retake image"
        explanation = (
            f"Low ensemble confidence ({final_conf*100:.0f}%) "
            f"— retake in better lighting."
        )
    else:
        skin_type   = _DISPLAY.get(final_type_key, final_type_key.capitalize())
        explanation = _EXPLANATIONS.get(
            final_type_key, f"Ensemble classified as {skin_type}."
        )

    logger.info(
        {
            "FINAL_LOCK":   not blend_active,
            "blend_active": blend_active,
            "rule_type":    rule_type,
            "vit_type":     vit_type,
            "final_type":   final_type_key,
            "rule_conf":    round(rule_conf, 4),
            "vit_conf":     round(vit_conf, 4),
            "w_rule":       round(w_rule, 3),
            "w_vit":        round(w_vit, 3),
        }
    )

    logger.info(
        "Ensemble done: %s (%.4f) | scores=%s | source=%s",
        skin_type,
        final_conf,
        {k: round(v, 2) for k, v in final_scores.items()},
        "rule_lock" if not blend_active else "conf_blend",
    )

    return {
        "skin_type":   skin_type,
        "confidence":  round(final_conf, 4),
        "scores":      {k: round(v, 4) for k, v in final_scores.items()},
        "explanation": explanation,
        "source":      "ensemble(rule_lock)" if not blend_active else "ensemble(conf_blend)",
    }



