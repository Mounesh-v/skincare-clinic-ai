"""
Skin Type Inference Module

Processes raw ViT model probabilities into final skin type classifications.
Enforces strict strict rules to prevent strong signals from being overridden.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def infer_skin_type(scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Infer skin type from ViT model probabilities.
    
    Args:
        scores: Dictionary with model probabilities
            Expected keys: oily, dry, normal, combination
            Values should be between 0.0 and 1.0 (will be normalized)
    
    Returns:
        Dictionary containing:
            - skin_type: Predicted skin type (Oily/Dry/Normal/Combination)
            - confidence: Confidence score (0.0 to 1.0)
            - scores: Individual normalized scores for each skin type
            - explanation: Human-readable explanation
    """
    
    # Ensure all keys exist and values are non-negative
    raw_scores = {
        "oily": max(0.0, scores.get("oily", 0.0)),
        "dry": max(0.0, scores.get("dry", 0.0)),
        "normal": max(0.0, scores.get("normal", 0.0)),
        "combination": max(0.0, scores.get("combination", 0.0)),
    }

    # Normalize to a valid distribution
    total = sum(raw_scores.values())
    if total > 0:
        normalized = {k: v / total for k, v in raw_scores.items()}
    else:
        normalized = {"oily": 0.25, "dry": 0.25, "normal": 0.25, "combination": 0.25}
    
    # Extract prediction metrics
    best_type = max(normalized, key=normalized.get)
    confidence = normalized[best_type]
    
    sorted_scores = sorted(normalized.values(), reverse=True)
    max_score = sorted_scores[0]
    second_score = sorted_scores[1]
    top2_gap = max_score - second_score

    # TASK 3: Prevent combination overuse (CRITICAL)
    # If the model strongly voted combination, but the individual 
    # oily/dry signals don't biologically support it, swap best_type.
    if best_type == "combination":
        if not (normalized["oily"] > 0.35 and normalized["dry"] > 0.25):
            # Demote combination and pick the next best underlying class
            best_type = max((k for k in normalized if k != "combination"), key=normalized.get)

    # --- FINAL DECISION PRIORITY ---
    # Order:
    # 1. Strong single class (oily/dry/normal)
    # 2. Combination (only if mixed signals)
    # 3. Uncertain
    
    # TASK 3: Fix WRONG combination bias 
    if best_type == "oily" and normalized["oily"] > 0.60:
        skin_type = "Oily"
        explanation = "Strong oily characteristics detected."
        
    elif best_type == "dry" and normalized["dry"] > 0.60:
        skin_type = "Dry"
        explanation = "Strong dry characteristics detected."
        
    # TASK 5: Fix normal detection
    elif normalized["normal"] > 0.40 and normalized["oily"] < 0.50 and normalized["dry"] < 0.40:
        skin_type = "Normal"
        explanation = "Balanced condition levels indicate normal skin."
        
    # TASK 4: Proper combination detection
    elif normalized["oily"] > 0.35 and normalized["dry"] > 0.25:
        skin_type = "Combination"
        explanation = "Mixed oily and dry zones detected."

    # TASK 2: Prediction stability smoothing (prevent arbitrary combination forcing)
    elif top2_gap < 0.08:
        # Keep best_type if the gap is very narrow; do NOT force combination
        skin_type = best_type.capitalize()
        explanation = f"Classified as {skin_type} by model (close margin with second best)."

    # TASK 2 & 8: Fallback safety and uncertainty threshold
    elif max_score < 0.45:
        skin_type = "Uncertain - Retake image"
        explanation = f"Low confidence ({max_score*100:.0f}%). Please retake image in better lighting."
        
    # TASK 7: Remove aggressive tie-breaking (Fallback)
    else:
        skin_type = best_type.capitalize()
        explanation = f"Classified as {skin_type} by model."
    
    # If the rule override selected a different class (e.g. Normal or Combination),
    # we return a confidence metric reflective of the signals that triggered it.
    if skin_type == "Combination" and best_type != "combination":
        final_confidence = max(normalized["oily"], normalized["dry"])
    elif skin_type == "Normal" and best_type != "normal":
        final_confidence = normalized["normal"]
    elif "Uncertain" in skin_type:
        final_confidence = max_score
    else:
        final_confidence = normalized.get(skin_type.lower(), max_score)
    
    # TASK 7: Add prediction logging (IMPORTANT)
    logger.info(
        "Skin Type Inference | final_type=%s | confidence=%.4f | top2_gap=%.4f | scores=%s",
        skin_type, final_confidence, top2_gap, normalized
    )
    
    return {
        "skin_type": skin_type,
        "confidence": round(final_confidence, 4),
        "scores": {k: round(v, 4) for k, v in normalized.items()},
        "explanation": explanation
    }


if __name__ == "__main__":
    print("=" * 70)
    print("SKIN TYPE INFERENCE - TEST CASES")
    print("=" * 70)
    
    # Test cases mapped from the EXPECTED RESULT spec
    tests = [
        ("Weak-all signals", {"oily": 0.30, "dry": 0.20, "normal": 0.45, "combination": 0.05}),
        ("Strong oily", {"oily": 0.70, "dry": 0.05, "normal": 0.15, "combination": 0.10}),
        ("Strong dry", {"oily": 0.05, "dry": 0.75, "normal": 0.10, "combination": 0.10}),
        ("Mixed oily+dry", {"oily": 0.45, "dry": 0.35, "normal": 0.10, "combination": 0.10}),
        ("Weak oily", {"oily": 0.45, "dry": 0.10, "normal": 0.35, "combination": 0.10}),
    ]
    
    for name, scores in tests:
        print(f"\n[TEST] {name}")
        print("-" * 70)
        result = infer_skin_type(scores)
        print(f"Input: {scores}")
        print(f"Skin Type: {result['skin_type']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Scores: {result['scores']}")
        print(f"Explanation: {result['explanation']}")
    
    print("\n" + "=" * 70)
    print("✅ ALL TEST CASES COMPLETED")
    print("=" * 70)
