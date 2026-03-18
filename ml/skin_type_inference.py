"""
Skin Type Inference Module

Converts skin condition classifier outputs (acne, pores, wrinkles, blackheads, dark_spots)
into skin type classifications (oily, dry, normal, combination).

This module works purely on model output probabilities without requiring PyTorch or training data.
"""

from typing import Dict, Any


CONDITION_TO_TYPE = {
    "blackheads": {"oily": 0.85, "dry": 0.05, "normal": 0.10, "combination": 0.65},
    "pores": {"oily": 0.75, "dry": 0.05, "normal": 0.20, "combination": 0.65},
    "acne": {"oily": 0.65, "dry": 0.10, "normal": 0.15, "combination": 0.80},
    "wrinkles": {"oily": 0.10, "dry": 0.55, "normal": 0.40, "combination": 0.20},
    "dark_spots": {"oily": 0.05, "dry": 0.70, "normal": 0.50, "combination": 0.15},
}


def infer_skin_type(condition_scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Infer skin type from condition classifier probabilities.
    
    Args:
        condition_scores: Dictionary with condition probabilities
            Expected keys: acne, pores, wrinkles, blackheads, dark_spots
            Values should be between 0.0 and 1.0
    
    Returns:
        Dictionary containing:
            - skin_type: Predicted skin type (Oily/Dry/Normal/Combination)
            - confidence: Confidence score (0.0 to 1.0)
            - scores: Individual scores for each skin type
            - detected_conditions: Input condition scores
            - explanation: Human-readable explanation
    
    Example:
        >>> scores = {"acne": 0.82, "pores": 0.76, "wrinkles": 0.10, "blackheads": 0.65, "dark_spots": 0.45}
        >>> result = infer_skin_type(scores)
        >>> print(result["skin_type"])
        'Oily'
    """
    
    # Step 1: Normalize missing keys to 0.0 and clip values
    normalized = {
        "acne": max(0.0, min(1.0, condition_scores.get("acne", 0.0))),
        "pores": max(0.0, min(1.0, condition_scores.get("pores", 0.0))),
        "wrinkles": max(0.0, min(1.0, condition_scores.get("wrinkles", 0.0))),
        "blackheads": max(0.0, min(1.0, condition_scores.get("blackheads", 0.0))),
        "dark_spots": max(
            0.0,
            min(
                1.0,
                max(
                    condition_scores.get("dark_spots", 0.0),
                    condition_scores.get("dark spots", 0.0),
                ),
            ),
        ),
    }

    # Step 2: Aggregate skin-type scores from condition-to-type mapping.
    all_scores = {"oily": 0.0, "dry": 0.0, "normal": 0.0, "combination": 0.0}
    for condition, confidence in normalized.items():
        weight_map = CONDITION_TO_TYPE.get(condition)
        if weight_map is None:
            continue
        for skin_type in all_scores:
            all_scores[skin_type] += confidence * float(weight_map[skin_type])

    # Step 3: Normalize to a valid distribution.
    total = sum(all_scores.values())
    if total > 0:
        all_scores = {k: v / total for k, v in all_scores.items()}
    
    # Step 7: Decision logic
    max_type = max(all_scores, key=all_scores.get)
    max_score = all_scores[max_type]
    
    # Sort scores to find second highest
    sorted_scores = sorted(all_scores.values(), reverse=True)
    second_score = sorted_scores[1] if len(sorted_scores) > 1 else 0.0
    
    #Handle uncertainty - ONLY if all skin type scores are very low
    if max_score < 0.40:
        skin_type = "Uncertain - Retake image"
        explanation = f"Low confidence across all types (max: {max_score:.2f}). Please retake image in better lighting."
    
    # Handle mixed characteristics
    elif (max_score - second_score) < 0.15:
        skin_type = "Mixed characteristics"
        top_two = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)[:2]
        explanation = f"Similar scores for {top_two[0][0]} ({top_two[0][1]:.2f}) and {top_two[1][0]} ({top_two[1][1]:.2f})"
    
    # Clear winner
    else:
        skin_type = max_type.capitalize()
        explanation = _generate_explanation(max_type, normalized)
    
    return {
        "skin_type": skin_type,
        "confidence": round(max_score, 2),
        "scores": {k: round(v, 2) for k, v in all_scores.items()},
        "detected_conditions": {k: round(v, 2) for k, v in normalized.items()},
        "explanation": explanation
    }


def _generate_explanation(skin_type: str, conditions: Dict[str, float]) -> str:
    """Generate human-readable explanation for skin type classification."""
    
    if skin_type == "oily":
        high_factors = []
        if conditions["pores"] > 0.60:
            high_factors.append(f"pores ({conditions['pores']:.2f})")
        if conditions["acne"] > 0.60:
            high_factors.append(f"acne ({conditions['acne']:.2f})")
        if conditions["blackheads"] > 0.60:
            high_factors.append(f"blackheads ({conditions['blackheads']:.2f})")
        
        return f"High {', '.join(high_factors)} indicate oily skin"
    
    elif skin_type == "dry":
        factors = []
        if conditions["wrinkles"] > 0.50:
            factors.append(f"high wrinkles ({conditions['wrinkles']:.2f})")
        if conditions["pores"] < 0.40:
            factors.append(f"low pores ({conditions['pores']:.2f})")
        
        return f"{', '.join(factors).capitalize()} indicate dry skin"
    
    elif skin_type == "combination":
        return f"Mixed oily zones (pores: {conditions['pores']:.2f}) and dry zones (wrinkles: {conditions['wrinkles']:.2f})"
    
    elif skin_type == "normal":
        return "Balanced condition levels indicate normal skin"
    
    return f"Classified as {skin_type}"


# Example integration:
# from predict import predict_conditions
# condition_result = predict_conditions(image_path)
# skin_type = infer_skin_type(condition_result)


if __name__ == "__main__":
    print("=" * 70)
    print("SKIN TYPE INFERENCE - TEST CASES")
    print("=" * 70)
    
    # Test Case 1: OILY skin (high pores, high acne, low wrinkles)
    print("\n[TEST 1] OILY SKIN")
    print("-" * 70)
    test_oily = {
        "acne": 0.82,
        "pores": 0.76,
        "wrinkles": 0.10,
        "blackheads": 0.65,
        "dark_spots": 0.45
    }
    result = infer_skin_type(test_oily)
    print(f"Input: {test_oily}")
    print(f"Skin Type: {result['skin_type']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Scores: {result['scores']}")
    print(f"Explanation: {result['explanation']}")
    
    # Test Case 2: DRY skin (low pores, low acne, high wrinkles)
    print("\n[TEST 2] DRY SKIN")
    print("-" * 70)
    test_dry = {
        "acne": 0.15,
        "pores": 0.20,
        "wrinkles": 0.85,
        "blackheads": 0.10,
        "dark_spots": 0.30
    }
    result = infer_skin_type(test_dry)
    print(f"Input: {test_dry}")
    print(f"Skin Type: {result['skin_type']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Scores: {result['scores']}")
    print(f"Explanation: {result['explanation']}")
    
    # Test Case 3: NORMAL skin (all balanced 0.30-0.60)
    print("\n[TEST 3] NORMAL SKIN")
    print("-" * 70)
    test_normal = {
        "acne": 0.45,
        "pores": 0.50,
        "wrinkles": 0.40,
        "blackheads": 0.35,
        "dark_spots": 0.55
    }
    result = infer_skin_type(test_normal)
    print(f"Input: {test_normal}")
    print(f"Skin Type: {result['skin_type']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Scores: {result['scores']}")
    print(f"Explanation: {result['explanation']}")
    
    # Test Case 4: COMBINATION skin (high pores + high wrinkles)
    print("\n[TEST 4] COMBINATION SKIN")
    print("-" * 70)
    test_combination = {
        "acne": 0.55,
        "pores": 0.72,
        "wrinkles": 0.68,
        "blackheads": 0.45,
        "dark_spots": 0.50
    }
    result = infer_skin_type(test_combination)
    print(f"Input: {test_combination}")
    print(f"Skin Type: {result['skin_type']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Scores: {result['scores']}")
    print(f"Explanation: {result['explanation']}")
    
    # Test Case 5: UNCERTAIN (all low scores)
    print("\n[TEST 5] UNCERTAIN (Low Confidence)")
    print("-" * 70)
    test_uncertain = {
        "acne": 0.25,
        "pores": 0.30,
        "wrinkles": 0.20,
        "blackheads": 0.15,
        "dark_spots": 0.10
    }
    result = infer_skin_type(test_uncertain)
    print(f"Input: {test_uncertain}")
    print(f"Skin Type: {result['skin_type']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Scores: {result['scores']}")
    print(f"Explanation: {result['explanation']}")
    
    print("\n" + "=" * 70)
    print("✅ ALL TEST CASES COMPLETED")
    print("=" * 70)
