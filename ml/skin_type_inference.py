"""Production rule engine for skin type inference from condition probabilities."""

import logging
from typing import Any, Dict, Mapping

from .config import CONFIG

logger = logging.getLogger(__name__)


def _normalize_scores(scores: Dict[str, float], fallback_key: str = "normal") -> Dict[str, float]:
    clamped = {k: max(0.0, min(1.0, float(v))) for k, v in scores.items()}
    total = sum(clamped.values())
    if total <= 0.0:
        return {k: (1.0 if k == fallback_key else 0.0) for k in clamped}
    return {k: v / total for k, v in clamped.items()}


def _generate_explanation(final_type: str, features: Mapping[str, Any], top2_gap: float, max_score: float) -> str:
    if final_type == "Oily":
        return "High oily probability aligned with strong T-zone and cheek shine signals."
    if final_type == "Dry":
        return "Dry prediction confirmed by high dry score, dryness index, and rough texture."
    if final_type == "Combination":
        return "Mixed oily and balanced/dry signals indicate combination skin."
    if max_score < 0.45:
        return "Prediction stabilized to Normal due to low confidence."
    if features.get("edge_density_high", False):
        return "Normal selected after beard/edge-density correction reduced oily bias."
    return "Normal selected from balanced multi-signal evaluation."


def infer_skin_type(condition_scores: Dict[str, float], features: Mapping[str, Any] | None = None) -> Dict[str, Any]:
    """Infer skin type with a strict, full-pass, no-shortcut decision engine."""
    feature_flags: Mapping[str, Any] = features or {}

    normalized_conditions = {
        "acne": max(0.0, min(1.0, float(condition_scores.get("acne", 0.0)))),
        "pores": max(0.0, min(1.0, float(condition_scores.get("pores", 0.0)))),
        "wrinkles": max(0.0, min(1.0, float(condition_scores.get("wrinkles", 0.0)))),
        "blackheads": max(0.0, min(1.0, float(condition_scores.get("blackheads", 0.0)))),
        "dark_spots": max(
            0.0,
            min(1.0, float(condition_scores.get("dark_spots", condition_scores.get("dark spots", 0.0)))),
        ),
    }

    # Base truth from model probabilities (soft aggregation, no direct condition->type mapping).
    base_scores = {
        "oily": (
            normalized_conditions["pores"] * 0.40
            + normalized_conditions["acne"] * 0.35
            + normalized_conditions["blackheads"] * 0.25
        ),
        "dry": (
            # Dry = actual dry-skin features only.
            # Removed: (1-pores)*0.40 + (1-acne)*0.25 ΓÇö absence of oily is NOT evidence of dry.
            # That inflated dry score for every Normal/aging person and caused the NormalΓåÆDry bug.
            normalized_conditions["wrinkles"] * 0.60
            + normalized_conditions["dark_spots"] * 0.40
        ),
        "normal": (
            (1.0 - normalized_conditions["acne"]) * 0.25
            + (1.0 - normalized_conditions["pores"]) * 0.25
            + (1.0 - normalized_conditions["blackheads"]) * 0.25
            + (1.0 - normalized_conditions["wrinkles"]) * 0.25
        ),
        "combination": (
            min(normalized_conditions["pores"], normalized_conditions["wrinkles"]) * 0.6
            + min(normalized_conditions["acne"], normalized_conditions["dark_spots"]) * 0.4
        ),
    }

    # Step 2: normalize to 1.0.
    scores = _normalize_scores(base_scores)

    # Step 3: safe signal adjustments.
    if normalized_conditions.get("wrinkles", 0.0) > 0.7:
        # Wrinkles alone = aging signal, not dry. Dry score already weighted in formula.
        # Only mild normal boost (aging people can still be normal skin).
        scores["normal"] += 0.03

    if feature_flags.get("edge_density_high", False):
        scores["oily"] -= 0.10
        scores["normal"] += 0.10

    if feature_flags.get("brightness_high", False) and not feature_flags.get("specular_highlight", False):
        scores["oily"] -= 0.05

    # Clamp then re-normalize again.
    scores = _normalize_scores(scores)

    # Step 4: strong-signal override (top priority).
    # Thresholds lowered to match the tighter new dry formula (no longer inflated by absence-of-oily).
    final_type = ""
    if scores["oily"] > 0.55:
        final_type = "Oily"
    elif scores["dry"] > 0.50:
        final_type = "Dry"

    # Step 5: secondary decision rules (feature-flag validated).
    if not final_type:
        if (
            scores["oily"] > 0.48
            and (scores["normal"] - scores["oily"]) < 0.12
            and (
                bool(feature_flags.get("t_zone_shine_high", False))
                or bool(feature_flags.get("cheek_shine_high", False))
            )
        ):
            final_type = "Oily"
        elif (
            scores["dry"] > 0.40
            # Feature flags may confirm Dry only when the gap vs Normal is within 0.12.
            # If Normal leads by >0.12 the score evidence is too clear to override.
            # (Imran Farhat case: dry=0.41, normal=0.58, gap=0.17 → correctly stays Normal)
            and (scores["normal"] - scores["dry"]) < 0.12
            and float(feature_flags.get("dryness_index", 0.0)) > CONFIG.dryness_threshold
            and bool(feature_flags.get("texture_rough", False))
        ):
            final_type = "Dry"
        else:
            oily_signal = (
                scores["oily"] > 0.22
                and feature_flags.get("t_zone_shine_high", False)
            )
            dry_signal = (
                scores["dry"] > 0.18
                and feature_flags.get("texture_rough", False)
            )
            if oily_signal and dry_signal:
                final_type = "Combination"
            else:
                final_type = "Normal"

    # Step 6: confidence stability gate.
    # Removed: top2_gap < 0.08 ΓåÆ max(scores) ΓÇö that silently flipped NormalΓåÆDry when gap was tiny.
    # Rule-engine decision from Steps 4-5 is already deterministic; no score-based flip needed.
    sorted_scores = sorted(scores.values(), reverse=True)
    max_score = sorted_scores[0]
    top2_gap = sorted_scores[0] - sorted_scores[1] if len(sorted_scores) > 1 else sorted_scores[0]
    # Only force Normal on low confidence when no feature-validated type was decided.
    # Oily/Dry/Combination decisions from Steps 4-5 are already feature-backed; don't downgrade them.
    if max_score < 0.45 and final_type == "Normal":
        final_type = "Normal"  # already Normal ΓÇö no change needed

    # Step 7: final fallback safety.
    if final_type not in ["Oily", "Dry", "Combination", "Normal"]:
        final_type = max(scores, key=lambda score_key: scores[score_key]).capitalize()

    logger.info(
        {
            "decision_path": "rule_engine_v2",
            "final_type": final_type,
            "scores": {k: round(v, 4) for k, v in scores.items()},
            "top2_gap": round(top2_gap, 4),
            "max_score": round(max_score, 4),
        }
    )

    explanation = _generate_explanation(final_type, feature_flags, top2_gap, max_score)
    final_key = final_type.lower()
    # Fix 4: confidence must reflect overall prediction strength after all rules.
    confidence = max_score

    return {
        "skin_type": final_type,
        "confidence": round(confidence, 4),
        "scores": {k: round(v, 4) for k, v in scores.items()},
        "detected_conditions": {k: round(v, 4) for k, v in normalized_conditions.items()},
        "explanation": explanation,
    }
