"""
Smoke-test for the fixed rule engine + ensemble.

Feature keys used here MUST match the production flags set by analyzer.py:
  t_zone_shine_high, cheek_shine_high, texture_rough, dryness_index,
  edge_density_high, brightness_high, specular_highlight

Run: python test_ensemble.py
"""
import logging, json, numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-20s  %(message)s",
)

from ml.skin_type_inference import infer_skin_type

SEP = "-" * 64


def run_rule(label, conditions, features=None, expect=None):
    result = infer_skin_type(conditions, features=features)
    status = ""
    if expect:
        status = "PASS" if result["skin_type"].lower() == expect.lower() else "FAIL"
    print(f"\n{SEP}")
    print(f"[{status}] {label}")
    print(f"  Conditions : {conditions}")
    print(f"  Features   : {features}")
    print(f"  skin_type  : {result['skin_type']}  (conf={result['confidence']:.3f})")
    print(f"  scores     : {result['scores']}")
    return result


def run_ensemble(label, conditions, features=None, expect=None):
    try:
        from ml.skin_type_vit import infer_skin_type_ensemble
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        result = infer_skin_type_ensemble(dummy_img, conditions, features=features)
        status = ""
        if expect:
            status = "PASS" if result["skin_type"].lower() == expect.lower() else "FAIL"
        print(f"\n{SEP}")
        print(f"[{status}] ENSEMBLE: {label}")
        print(f"  skin_type  : {result['skin_type']}  (conf={result['confidence']:.3f})")
        print(f"  scores     : {result['scores']}")
        print(f"  source     : {result['source']}")
        return result
    except FileNotFoundError:
        print(f"  [SKIP] ViT model not on disk")
        return None


print("\n" + "=" * 64)
print("  RULE ENGINE TESTS")
print("=" * 64)

# Case 1: High wrinkles only ΓÇö aging normal person, NO dry features ΓåÆ Normal
run_rule(
    "High wrinkles only (no dry features) ΓÇö expect Normal",
    conditions={"acne": 0.10, "pores": 0.15, "wrinkles": 0.75, "blackheads": 0.10, "dark_spots": 0.10},
    features={"t_zone_shine_high": False, "cheek_shine_high": False,
              "texture_rough": False, "dryness_index": 0.20},
    expect="Normal",
)

# Case 2: High oily (acne + pores + blackheads) ΓåÆ Oily
run_rule(
    "High oily (acne/pores/blackheads) ΓÇö expect Oily",
    conditions={"acne": 0.75, "pores": 0.80, "wrinkles": 0.05, "blackheads": 0.65, "dark_spots": 0.10},
    features={"t_zone_shine_high": True, "cheek_shine_high": True,
              "texture_rough": False, "dryness_index": 0.10},
    expect="Oily",
)

# Case 3: Wrinkles + dark spots + texture_rough + dryness ΓåÆ Dry
run_rule(
    "Wrinkles + dark spots + texture_rough ΓåÆ expect Dry",
    conditions={"acne": 0.05, "pores": 0.05, "wrinkles": 0.75, "blackheads": 0.05, "dark_spots": 0.55},
    features={"t_zone_shine_high": False, "cheek_shine_high": False,
              "texture_rough": True, "dryness_index": 0.65},
    expect="Dry",
)

# Case 4: Balanced low everything ΓåÆ Normal
run_rule(
    "Balanced low conditions ΓÇö expect Normal",
    conditions={"acne": 0.05, "pores": 0.05, "wrinkles": 0.05, "blackheads": 0.05, "dark_spots": 0.05},
    features={"t_zone_shine_high": False, "cheek_shine_high": False,
              "texture_rough": False, "dryness_index": 0.15},
    expect="Normal",
)

# Case 5: Mixed oily T-zone + dry signal ΓåÆ Combination
run_rule(
    "Mixed oily + dry signals ΓÇö expect Combination",
    conditions={"acne": 0.50, "pores": 0.55, "wrinkles": 0.40, "blackheads": 0.35, "dark_spots": 0.30},
    features={"t_zone_shine_high": True, "cheek_shine_high": False,
              "texture_rough": True, "dryness_index": 0.40},
    expect="Combination",
)

# Case 6: REAL CASE — Imran Farhat photo (wrinkles 0.93, no dark_spots)
# Rule engine gave Dry (0.41) despite Normal (0.58) being higher — gap was 0.17, should stay Normal
run_rule(
    "Real case: wrinkles=0.93 only (Imran Farhat) — expect Normal",
    conditions={"acne": 0.0, "pores": 0.018, "wrinkles": 0.926, "blackheads": 0.021, "dark_spots": 0.0},
    features={"t_zone_shine_high": False, "cheek_shine_high": False,
              "texture_rough": True, "dryness_index": 0.65},
    expect="Normal",
)

print("\n" + "=" * 64)
print("  ENSEMBLE TESTS (requires ViT model on disk)")
print("=" * 64)

run_ensemble(
    "High wrinkles only ΓåÆ final must be Normal",
    conditions={"acne": 0.10, "pores": 0.15, "wrinkles": 0.75, "blackheads": 0.10, "dark_spots": 0.10},
    features={"t_zone_shine_high": False, "cheek_shine_high": False,
              "texture_rough": False, "dryness_index": 0.20},
    expect="Normal",
)

run_ensemble(
    "High oily ΓåÆ final must be Oily",
    conditions={"acne": 0.75, "pores": 0.80, "wrinkles": 0.05, "blackheads": 0.65, "dark_spots": 0.10},
    features={"t_zone_shine_high": True, "cheek_shine_high": True,
              "texture_rough": False, "dryness_index": 0.10},
    expect="Oily",
)

print(f"\n{SEP}")
print("DONE ΓÇö check [PASS]/[FAIL] status above.")
print(f"{SEP}\n")
