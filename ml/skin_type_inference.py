"""Rule-based skin type inference from condition probabilities."""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def _generate_explanation(skin_type: str, normalized: Dict[str, float]) -> str:
    """
    Generate a human-readable explanation for the predicted skin type.
    
    Args:
        skin_type: The determined skin type (lowercase key)
        normalized: Dictionary of normalized condition scores
    
    Returns:
        Human-readable explanation string
    """
    if skin_type == "oily":
        high_oily_conditions = []
        if normalized.get("pores", 0) >= 0.6:
            high_oily_conditions.append("enlarged pores")
        if normalized.get("acne", 0) >= 0.6:
            high_oily_conditions.append("acne")
        if normalized.get("blackheads", 0) >= 0.6:
            high_oily_conditions.append("blackheads")
        
        if high_oily_conditions:
            return f"Your skin shows {', '.join(high_oily_conditions)} — typical of oily skin with excess sebum."
        return "Detected oily skin characteristics — excess sebum and enlarged pores."
    
    elif skin_type == "dry":
        if normalized.get("wrinkles", 0) >= 0.75:
            return f"Strong dry skin indicators: fine lines and wrinkles detected ({normalized['wrinkles']:.0%}). Moisture is lacking."
        return "Detected dry skin characteristics — reduced moisture and fine texture."
    
    elif skin_type == "normal":
        return "Your skin shows balanced sebum and condition levels — normal skin type."
    
    elif skin_type == "combination":
        return f"Mixed characteristics detected: oily zones (pores/acne) and dry areas (wrinkles). Combination skin type."
    
    else:
        return f"Skin type classified as {skin_type}."


def infer_skin_type(condition_scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Infer skin type from EfficientNet condition probabilities.
    
    Priority order:
    1. Dominant condition shortcut (>= 0.88 confidence)
    2. Weighted scoring for oily/dry/normal/combination
    3. Confidence + ambiguity checks
    
    Args:
        condition_scores: Dictionary with condition detection probabilities
            Expected keys: acne, pores, wrinkles, blackheads, dark_spots
            Values should be between 0.0 and 1.0
    
    Returns schema:
        {
            "skin_type": str,
            "confidence": float,
            "scores": {"oily": float, "dry": float, "normal": float, "combination": float},
            "detected_conditions": dict,
            "explanation": str,
        }
    """

    # STEP 0 — Normalize inputs, handle both "dark spots" and "dark_spots"
    normalized = {
        "acne":       max(0.0, min(1.0, condition_scores.get("acne",       0.0))),
        "pores":      max(0.0, min(1.0, condition_scores.get("pores",      0.0))),
        "wrinkles":   max(0.0, min(1.0, condition_scores.get("wrinkles",   0.0))),
        "blackheads": max(0.0, min(1.0, condition_scores.get("blackheads", 0.0))),
        "dark_spots": max(0.0, min(1.0, condition_scores.get("dark_spots",
                          condition_scores.get("dark spots", 0.0)))),
    }

    # STEP 1 — Dominant condition shortcut (>= 0.88)
    # When one condition is extremely confident, skip all math
    # and return directly. This PREVENTS ViT from overriding.
    CONDITION_TO_SKIN_TYPE = {
        "wrinkles":   "dry",
        "pores":      "oily",
        "acne":       "oily",
        "blackheads": "oily",
        "dark_spots": "normal",
    }

    dominant_key   = max(normalized, key=normalized.__getitem__)
    dominant_score = normalized[dominant_key]

    if dominant_score >= 0.88:
        mapped = CONDITION_TO_SKIN_TYPE.get(dominant_key, "normal")
        shortcut_scores = {
            "oily": 0.04, "dry": 0.04,
            "normal": 0.04, "combination": 0.04,
        }
        shortcut_scores[mapped] = round(dominant_score, 2)
        total = sum(shortcut_scores.values())
        shortcut_scores = {k: round(v / total, 4) for k, v in shortcut_scores.items()}
        return {
            "skin_type":           mapped.capitalize(),
            "confidence":          round(dominant_score, 2),
            "scores":              shortcut_scores,
            "detected_conditions": {k: round(v, 2) for k, v in normalized.items()},
            "explanation": (
                f"Dominant condition '{dominant_key.replace('_', ' ')}' "
                f"({dominant_score:.0%} confidence) strongly indicates "
                f"{mapped} skin."
            ),
        }

    # STEP 2 — OILY score
    score_oily = (
        normalized["pores"]      * 0.40 +
        normalized["acne"]       * 0.35 +
        normalized["blackheads"] * 0.25
    )
    if normalized["wrinkles"] < 0.35:
        score_oily *= 1.15
    if normalized["wrinkles"] >= 0.75:
        suppression = max(0.30, 1.0 - (normalized["wrinkles"] - 0.75) * 2.0)
        score_oily *= suppression
    score_oily = min(score_oily, 1.0)

    # STEP 3 — DRY score with exponential wrinkle boost
    wrinkle_val = normalized["wrinkles"]
    if wrinkle_val >= 0.80:
        wrinkle_component = wrinkle_val ** 0.7
    elif wrinkle_val >= 0.75:
        wrinkle_component = wrinkle_val ** 0.85
    else:
        wrinkle_component = wrinkle_val

    score_dry = (
        wrinkle_component          * 0.55 +
        (1 - normalized["pores"]) * 0.28 +
        (1 - normalized["acne"])  * 0.17
    )
    score_dry = min(score_dry, 1.0)

    # STEP 4 — NORMAL score
    balanced_count = sum(
        1 for v in normalized.values()
        if 0.30 <= v <= 0.60
    )
    score_normal = balanced_count / len(normalized)

    # STEP 5 — COMBINATION score
    oily_indicators = (
        normalized["pores"]      * 0.50 +
        normalized["acne"]       * 0.30 +
        normalized["blackheads"] * 0.20
    )
    dry_indicators = (
        normalized["wrinkles"]        * 0.50 +
        (1 - normalized["pores"])     * 0.30 +
        normalized["dark_spots"]      * 0.20
    )
    is_combination = all([
        oily_indicators >= 0.50,
        dry_indicators  >= 0.45,
        oily_indicators < 0.80,
        dry_indicators  < 0.80,
    ])
    if is_combination:
        base    = (oily_indicators + dry_indicators) / 2.0
        penalty = abs(oily_indicators - dry_indicators)
        if penalty > 0.30:
            base *= 0.85
        score_combination = min(base, 1.0)
    else:
        score_combination = 0.0

    # STEP 6 — Decision
    all_scores = {
        "oily":        score_oily,
        "dry":         score_dry,
        "normal":      score_normal,
        "combination": score_combination,
    }
    sorted_scores = sorted(all_scores.values(), reverse=True)
    max_type      = max(all_scores, key=all_scores.__getitem__)
    max_score     = all_scores[max_type]
    second_score  = sorted_scores[1] if len(sorted_scores) > 1 else 0.0

    if max_score < 0.40:
        skin_type   = "Uncertain - Retake image"
        explanation = (
            f"Low confidence across all types (max: {max_score:.2f}). "
            "Please retake in better lighting."
        )
    elif (max_score - second_score) < 0.15:
        top_two     = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)[:2]
        skin_type   = "Mixed characteristics"
        explanation = (
            f"Similar scores for {top_two[0][0]} ({top_two[0][1]:.2f}) "
            f"and {top_two[1][0]} ({top_two[1][1]:.2f})"
        )
    else:
        skin_type   = max_type.capitalize()
        explanation = _generate_explanation(max_type, normalized)

    return {
        "skin_type":           skin_type,
        "confidence":          round(max_score, 2),
        "scores":              {k: round(v, 2) for k, v in all_scores.items()},
        "detected_conditions": {k: round(v, 2) for k, v in normalized.items()},
        "explanation":         explanation,
    }


if __name__ == "__main__":
    print("=" * 80)
    print("SKIN TYPE INFERENCE - TEST CASES")
    print("=" * 80)
    
    # TEST 1 — Wrinkles dominant → MUST return Dry
    t1 = {"wrinkles": 0.923, "acne": 0.021,
          "blackheads": 0.021, "pores": 0.018, "dark_spots": 0.017}
    r1 = infer_skin_type(t1)
    assert r1["skin_type"] == "Dry",  f"FAIL T1: got {r1['skin_type']}"
    assert r1["confidence"] >= 0.88,  f"FAIL T1 conf: {r1['confidence']}"
    print(f"✅ T1 PASS — Wrinkles dominant → {r1['skin_type']} ({r1['confidence']})")

    # TEST 2 — Pores dominant → MUST return Oily
    t2 = {"pores": 0.91, "acne": 0.04,
          "blackheads": 0.02, "wrinkles": 0.02, "dark_spots": 0.01}
    r2 = infer_skin_type(t2)
    assert r2["skin_type"] == "Oily",  f"FAIL T2: got {r2['skin_type']}"
    assert r2["confidence"] >= 0.88,   f"FAIL T2 conf: {r2['confidence']}"
    print(f"✅ T2 PASS — Pores dominant → {r2['skin_type']} ({r2['confidence']})")

    # TEST 3 — Balanced → MUST return Normal or Mixed
    t3 = {"acne": 0.45, "pores": 0.50,
          "wrinkles": 0.40, "blackheads": 0.35, "dark_spots": 0.55}
    r3 = infer_skin_type(t3)
    assert r3["skin_type"] in ["Normal", "Mixed characteristics"], \
        f"FAIL T3: got {r3['skin_type']}"
    print(f"✅ T3 PASS — Balanced → {r3['skin_type']} ({r3['confidence']})")

    # TEST 4 — Combination (high pores + high wrinkles)
    t4 = {"acne": 0.55, "pores": 0.72,
          "wrinkles": 0.68, "blackheads": 0.45, "dark_spots": 0.50}
    r4 = infer_skin_type(t4)
    assert r4["skin_type"] in ["Combination", "Mixed characteristics"], \
        f"FAIL T4: got {r4['skin_type']}"
    print(f"✅ T4 PASS — Combination → {r4['skin_type']} ({r4['confidence']})")

    # TEST 5 — Low confidence → MUST return Uncertain
    t5 = {"acne": 0.20, "pores": 0.22,
          "wrinkles": 0.18, "blackheads": 0.15, "dark_spots": 0.10}
    r5 = infer_skin_type(t5)
    assert "Uncertain" in r5["skin_type"],  f"FAIL T5: got {r5['skin_type']}"
    print(f"✅ T5 PASS — Low confidence → {r5['skin_type']}")

    print("\n" + "=" * 80)
    print("✅ ALL 5 TESTS PASSED")
    print("=" * 80)
