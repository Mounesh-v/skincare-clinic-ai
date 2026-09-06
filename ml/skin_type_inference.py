"""Production rule engine for skin type inference from condition probabilities."""

from __future__ import annotations

import logging
from typing import Any, Dict, Mapping

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Minimum signal strength to classify as Oily or Dry.
# Lowered from 0.20 → 0.15 so moderate EfficientNet signals are not swallowed
# into the Normal bucket — critical when model confidence is spread across
# all 5 condition classes (typical for CPU-only inference).
# ---------------------------------------------------------------------------
_OIL_MIN = 0.15
_DRY_MIN = 0.15

# ---------------------------------------------------------------------------
# Signal amplification factor.
# EfficientNet trained on 5 conditions outputs ~0.20 per class when uncertain.
# Amplifying by 1.8× before computing oil/dryness composites rescales the
# effective range so a moderate 30% prediction behaves like a meaningful signal
# rather than noise.  Values are clipped to [0, 1] after amplification.
# ---------------------------------------------------------------------------
_SIGNAL_AMP = 1.8


def infer_skin_type(
    condition_scores: Dict[str, float],
    features: Mapping[str, Any] | None = None,  # kept for interface compatibility
) -> Dict[str, Any]:
    """Infer skin type from EfficientNet condition probabilities.

    Weights are clinically grounded:
      Oil     = acne × 0.45  + pores × 0.35 + blackheads × 0.20
      Dryness = wrinkles × 0.60 + dark_spots × 0.40

    Signal amplification (×1.8, clipped) is applied first so that moderate
    EfficientNet outputs (e.g. 25–35%) register as meaningful signals.

    Decision (in priority order):
      oil > 0.35 AND dryness > 0.35  →  Combination
      oil > dryness AND oil ≥ 0.15   →  Oily
      dryness > oil AND dry ≥ 0.15   →  Dry
      otherwise                       →  Normal
    """
    # ── Raw scores ────────────────────────────────────────────────────────────
    acne       = max(0.0, min(1.0, float(condition_scores.get("acne", 0.0))))
    pores      = max(0.0, min(1.0, float(condition_scores.get("pores", 0.0))))
    blackheads = max(0.0, min(1.0, float(condition_scores.get("blackheads", 0.0))))
    wrinkles   = max(0.0, min(1.0, float(condition_scores.get("wrinkles", 0.0))))
    dark_spots = max(
        0.0,
        min(1.0, float(condition_scores.get("dark_spots", condition_scores.get("dark spots", 0.0)))),
    )

    # ── Signal amplification — rescale moderate scores before composite ───────
    # Multiply each condition probability by _SIGNAL_AMP and re-clip to [0, 1].
    # This makes a 28% score behave as ~50% in the composite formulas, which
    # prevents the rule engine from always collapsing to "Normal" when
    # EfficientNet distributes probability nearly uniformly across all classes.
    acne_a       = min(1.0, acne       * _SIGNAL_AMP)
    pores_a      = min(1.0, pores      * _SIGNAL_AMP)
    blackheads_a = min(1.0, blackheads * _SIGNAL_AMP)
    wrinkles_a   = min(1.0, wrinkles   * _SIGNAL_AMP)
    dark_spots_a = min(1.0, dark_spots * _SIGNAL_AMP)

    # ── Primary signals (amplified) ───────────────────────────────────────────
    oil     = acne_a * 0.45 + pores_a * 0.35 + blackheads_a * 0.20
    dryness = wrinkles_a * 0.60 + dark_spots_a * 0.40

    # Keep un-amplified versions for logging and score construction
    oil_raw     = acne * 0.45 + pores * 0.35 + blackheads * 0.20
    dryness_raw = wrinkles * 0.60 + dark_spots * 0.40

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
    # Use un-amplified oil_raw/dryness_raw for score construction so the
    # ensemble blending weights are not artificially inflated.
    skin_key = skin_type.lower()
    if skin_key == "combination":
        avg = (oil_raw + dryness_raw) * 0.5
        raw_scores: Dict[str, float] = {
            "oily":        oil_raw * 0.5,
            "dry":         dryness_raw * 0.5,
            "combination": avg,
            "normal":      max(0.0, 1.0 - avg),
        }
    elif skin_key == "oily":
        raw_scores = {
            "oily":        oil_raw,
            "dry":         dryness_raw,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - oil_raw),
        }
    elif skin_key == "dry":
        raw_scores = {
            "oily":        oil_raw,
            "dry":         dryness_raw,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - dryness_raw),
        }
    else:  # normal
        raw_scores = {
            "oily":        oil_raw,
            "dry":         dryness_raw,
            "combination": 0.0,
            "normal":      max(0.0, 1.0 - max(oil_raw, dryness_raw)),
        }

    total = sum(raw_scores.values())
    scores: Dict[str, float] = (
        {k: round(v / total, 4) for k, v in raw_scores.items()}
        if total > 0
        else {"oily": 0.0, "dry": 0.0, "normal": 1.0, "combination": 0.0}
    )

    # ── Dermatologist-style explanation ───────────────────────────────────────
    oil_pct = round(oil_raw * 100)
    dry_pct = round(dryness_raw * 100)

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
            "decision_path": "rule_engine_v4_amplified",
            "skin_type": skin_type,
            "oil_raw":  round(oil_raw, 4),
            "oil_amp":  round(oil, 4),
            "dryness_raw": round(dryness_raw, 4),
            "dryness_amp": round(dryness, 4),
            "mixed_zone": round(mixed_zone, 4),
            "confidence": round(confidence, 4),
            "scores": scores,
        }
    )

    return {
        "skin_type": skin_type,
        "confidence": round(confidence, 4),
        "scores": scores,
        "oil": round(oil_raw, 4),
        "dryness": round(dryness_raw, 4),
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
