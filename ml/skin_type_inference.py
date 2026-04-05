"""Production rule engine for skin type inference from condition probabilities."""

from __future__ import annotations

import logging
from typing import Any, Dict, Mapping

logger = logging.getLogger(__name__)

# Minimum signal strength required to classify as Oily or Dry.
# Below this, both signals are too weak → Normal.
_OIL_MIN  = 0.20
_DRY_MIN  = 0.20


def infer_skin_type(
    condition_scores: Dict[str, float],
    features: Mapping[str, Any] | None = None,  # kept for interface compatibility
) -> Dict[str, Any]:
    """Infer skin type from EfficientNet condition probabilities.

    Weights are clinically grounded:
      Oil     = acne × 0.40  + pores × 0.40 + blackheads × 0.20
      Dryness = wrinkles × 0.65 + dark_spots × 0.35

    Decision (in priority order):
      oil > 0.35 AND dryness > 0.35  →  Combination
      oil > dryness AND oil ≥ 0.20   →  Oily
      dryness > oil AND dry ≥ 0.20   →  Dry
      otherwise                       →  Normal
    """
    acne = max(0.0, min(1.0, float(condition_scores.get("acne", 0.0))))
    pores = max(0.0, min(1.0, float(condition_scores.get("pores", 0.0))))
    blackheads = max(0.0, min(1.0, float(condition_scores.get("blackheads", 0.0))))
    wrinkles = max(0.0, min(1.0, float(condition_scores.get("wrinkles", 0.0))))
    dark_spots = max(
        0.0,
        min(1.0, float(condition_scores.get("dark_spots", condition_scores.get("dark spots", 0.0)))),
    )

    # ── Primary signals ───────────────────────────────────────────────────────
    oil     = acne * 0.40 + pores * 0.40 + blackheads * 0.20
    dryness = wrinkles * 0.65 + dark_spots * 0.35

    # Mixed-zone: clinically meaningful (non-zero) for combination skin
    mixed_zone = min(oil, dryness)

    # ── Classification ────────────────────────────────────────────────────────
    if oil > 0.35 and dryness > 0.35:
        skin_type = "Combination"
    elif oil > dryness and oil >= _OIL_MIN:
        skin_type = "Oily"
    elif dryness > oil and dryness >= _DRY_MIN:
        skin_type = "Dry"
    else:
        skin_type = "Normal"

    # ── Confidence (signal-strength stabilised) ───────────────────────────────
    if skin_type == "Combination":
        conf_raw = (oil + dryness) / 2.0
    else:
        conf_raw = abs(oil - dryness)

    confidence = max(0.0, min(1.0, 0.6 * conf_raw + 0.4 * max(oil, dryness)))

    # ── Ensemble-compatible scores (must sum to 1) ────────────────────────────
    # Scores are constructed so the winning skin type carries the largest
    # relative weight, enabling correct rule_conf weighting in the ensemble.
    skin_key = skin_type.lower()
    if skin_key == "combination":
        avg = (oil + dryness) * 0.5
        raw_scores: Dict[str, float] = {
            "oily":        oil * 0.5,
            "dry":         dryness * 0.5,
            "combination": avg,
            "normal":      max(0.0, 1.0 - avg),
        }
    elif skin_key == "oily":
        raw_scores = {
            "oily":        oil,
            "dry":         dryness,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - oil),
        }
    elif skin_key == "dry":
        raw_scores = {
            "oily":        oil,
            "dry":         dryness,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - dryness),
        }
    else:  # normal
        raw_scores = {
            "oily":        oil,
            "dry":         dryness,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - max(oil, dryness)),
        }

    total = sum(raw_scores.values())
    scores: Dict[str, float] = (
        {k: round(v / total, 4) for k, v in raw_scores.items()}
        if total > 0
        else {"oily": 0.0, "dry": 0.0, "normal": 1.0, "combination": 0.0}
    )

    # ── Dermatologist-style explanation ───────────────────────────────────────
    oil_pct = round(oil * 100)
    dry_pct = round(dryness * 100)

    if skin_type == "Combination":
        explanation = (
            f"Elevated pore and acne signals ({oil_pct}% oil index) indicate oiliness in the T-zone, "
            f"while wrinkle and dark-spot signals ({dry_pct}% dryness index) indicate dryness in the "
            f"cheeks \u2192 combination skin."
        )
    elif skin_type == "Oily":
        explanation = (
            f"Strong acne and pore signals drive a high oil index ({oil_pct}%), "
            f"with low dryness ({dry_pct}%) confirming excess sebum across the face \u2192 oily skin."
        )
    elif skin_type == "Dry":
        explanation = (
            f"Wrinkle and dark-spot signals produce a high dryness index ({dry_pct}%), "
            f"while the oil index is low ({oil_pct}%), indicating impaired barrier function "
            f"\u2192 dry skin."
        )
    else:
        explanation = (
            f"Both oil ({oil_pct}%) and dryness ({dry_pct}%) signals are low and balanced, "
            f"reflecting a well-regulated sebum-barrier equilibrium \u2192 normal skin."
        )

    logger.info(
        {
            "decision_path": "rule_engine_v3",
            "skin_type": skin_type,
            "oil": round(oil, 4),
            "dryness": round(dryness, 4),
            "mixed_zone": round(mixed_zone, 4),
            "confidence": round(confidence, 4),
            "scores": scores,
        }
    )

    return {
        "skin_type": skin_type,
        "confidence": round(confidence, 4),
        "scores": scores,
        "oil": round(oil, 4),
        "dryness": round(dryness, 4),
        "mixed_zone": round(mixed_zone, 4),
        "explanation": explanation,
        "detected_conditions": {
            "acne":       round(acne, 4),
            "blackheads": round(blackheads, 4),
            "dark_spots": round(dark_spots, 4),
            "pores":      round(pores, 4),
            "wrinkles":   round(wrinkles, 4),
        },
    }
