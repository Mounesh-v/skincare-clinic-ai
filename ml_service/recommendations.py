"""Recommendation and narrative helpers for the ML service."""
from __future__ import annotations

import copy
from typing import Any, Dict, Iterable, List, Mapping

ARCHETYPE_LIBRARY: Dict[str, Dict[str, Any]] = {
    "dry": {
        "stage_label": "Stage 2 · Barrier Rehab",
        "root_causes": [
            "Compromised lipid barrier",
            "Low natural moisturizing factor",
            "Seasonal dehydration",
        ],
        "plan_focus": [
            "Layer slow-release humectants under an occlusive seal",
            "Repair barrier damage with ceramide-rich creams",
            "Protect against temperature swings and plane cabins",
        ],
        "lifestyle": [
            {"title": "Humidify Your Nights", "detail": "Run a bedside humidifier to keep ambient humidity near 45%."},
            {"title": "Warm Water Ritual", "detail": "Swap hot showers for lukewarm water to prevent lipid loss."},
        ],
        "recommendations": [
            {
                "title": "Creamy barrier cleanser",
                "summary": "Non-foaming cleanser with oat lipids to cleanse without stripping.",
                "category": "cleanser",
                "priority": "High",
            },
            {
                "title": "Ceramide sleep mask",
                "summary": "Overnight mask locking in hyaluronic acid and peptides.",
                "category": "treatment",
                "priority": "High",
            },
            {
                "title": "Copper peptide mist",
                "summary": "On-the-go mist to calm inflammation during the day.",
                "category": "treatment",
                "priority": "Medium",
            },
        ],
        "timeline": [
            {"month": 1, "title": "Reset", "description": "Stop exfoliation, flood with hydration."},
            {"month": 2, "title": "Repair", "description": "Rebuild barrier with ceramides and omegas."},
            {"month": 3, "title": "Fortify", "description": "Introduce gentle actives and SPF layering."},
            {"month": 4, "title": "Maintain", "description": "Lock routine; add weekly hydrating mask."},
        ],
        "matched_case": {
            "name": "Maya",
            "headline": "Maya rehabbed her barrier in 12 weeks",
            "story": "Travel-heavy schedule dried Maya's skin. Layering lipids nightly restored bounce.",
            "snapshots": [
                {"month": 1, "label": "Week 2", "summary": "Redness calmed after humidifier habit."},
                {"month": 2, "label": "Week 6", "summary": "Texture smoother, flaking reduced."},
                {"month": 3, "label": "Week 10", "summary": "Glow returned, hydration stable."},
            ],
        },
    },
    "oily": {
        "stage_label": "Stage 1 · Oil Calibration",
        "root_causes": [
            "Overactive sebaceous glands",
            "Clogged follicles from pollution",
            "High-glycemic snacking",
        ],
        "plan_focus": [
            "Rebalance sebum with lightweight hydrators",
            "Clear congestion using gentle exfoliation cadence",
            "Stabilize blood sugar spikes that flare oil",
        ],
        "lifestyle": [
            {"title": "Balanced Breakfast", "detail": "Start with protein + fiber to blunt insulin spikes."},
            {"title": "Micro-mist Breaks", "detail": "Carry a balancing mist to reset shine midday."},
        ],
        "recommendations": [
            {
                "title": "Gel-based daily cleanser",
                "summary": "2% salicylic acid + green tea keeps pores clear without stripping.",
                "category": "cleanser",
                "priority": "High",
            },
            {
                "title": "Niacinamide + zinc serum",
                "summary": "Regulates oil flow and tightens pores over 6 weeks.",
                "category": "serum",
                "priority": "High",
            },
            {
                "title": "Mattifying SPF",
                "summary": "Weightless protection that doubles as primer.",
                "category": "sunscreen",
                "priority": "Medium",
            },
        ],
        "timeline": [
            {"month": 1, "title": "Detox", "description": "Deep cleanse and purge congestion."},
            {"month": 2, "title": "Stabilize", "description": "Control shine, heal active breakouts."},
            {"month": 3, "title": "Refine", "description": "Fade marks, keep pores invisible."},
        ],
        "matched_case": {
            "name": "Kabir",
            "headline": "Kabir cut midday shine in half",
            "story": "Desk job stress spiked oil. Switching to gel textures balanced him out.",
            "snapshots": [
                {"month": 1, "label": "Month 1", "summary": "Purging phase, fewer cystic bumps."},
                {"month": 2, "label": "Month 2", "summary": "Sebum normalized, tone even."},
                {"month": 3, "label": "Month 3", "summary": "Marks faded, only maintenance."},
            ],
        },
    },
    "normal": {
        "stage_label": "Stage 0 · Balance & Glow",
        "root_causes": [
            "Occasional dehydration from screens",
            "Mild environmental stress",
            "Emerging pigmentation",
        ],
        "plan_focus": [
            "Maintain balance with smart cycling of actives",
            "Boost antioxidant reserves each morning",
            "Protect collagen with consistent SPF layering",
        ],
        "lifestyle": [
            {"title": "Screen-time Cutoff", "detail": "Blue-light filters after 9pm to aid melatonin."},
            {"title": "Outdoor Flush", "detail": "10-minute daylight break for circadian rhythm."},
        ],
        "recommendations": [
            {
                "title": "Enzyme cleanser",
                "summary": "Papaya enzymes keep glow without manual exfoliation.",
                "category": "cleanser",
                "priority": "Medium",
            },
            {
                "title": "Vitamin C + peptide serum",
                "summary": "Guards against dullness, firms over time.",
                "category": "serum",
                "priority": "High",
            },
            {
                "title": "Feather-light moisturiser",
                "summary": "Water cream that supports barrier in humid climates.",
                "category": "moisturizer",
                "priority": "Medium",
            },
        ],
        "timeline": [
            {"month": 1, "title": "Protect", "description": "Fortify routine basics."},
            {"month": 2, "title": "Enhance", "description": "Introduce targeted brightening."},
            {"month": 3, "title": "Elevate", "description": "Cycle in gentle resurfacing."},
        ],
        "matched_case": {
            "name": "Sara",
            "headline": "Sara kept her glow through night shifts",
            "story": "Rotational shifts dulled Sara's complexion; antioxidant stacking fixed it.",
            "snapshots": [
                {"month": 1, "label": "Month 1", "summary": "Tone brightened, texture smoother."},
                {"month": 2, "label": "Month 2", "summary": "Spots fading, glow consistent."},
                {"month": 3, "label": "Month 3", "summary": "Skin stable even on hectic weeks."},
            ],
        },
    },
}


def _dedupe(sequence: Iterable[str]) -> List[str]:
    seen: set[str] = set()
    ordered: List[str] = []
    for item in sequence:
        if not item:
            continue
        if item not in seen:
            seen.add(item)
            ordered.append(item)
    return ordered


def _copy_entries(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [dict(item) for item in entries]


def _clone_archetype(label: str) -> Dict[str, Any]:
    base = ARCHETYPE_LIBRARY.get(label, ARCHETYPE_LIBRARY["normal"])
    cloned = {
        "stage_label": base["stage_label"],
        "root_causes": list(base["root_causes"]),
        "plan_focus": list(base["plan_focus"]),
        "lifestyle": _copy_entries(base["lifestyle"]),
        "recommendations": _copy_entries(base["recommendations"]),
        "timeline": _copy_entries(base["timeline"]),
        "matched_case": copy.deepcopy(base["matched_case"]),
    }
    return cloned


def _answer_matches(answer: str | None, *expected: str) -> bool:
    if not answer:
        return False
    return answer in expected


def _augment_root_causes(causes: List[str], answers: Mapping[str, str | None]) -> List[str]:
    extras: List[str] = []
    if _answer_matches(answers.get("stress"), "high", "very-high"):
        extras.append("Stress hormones driving flare-ups")
    if _answer_matches(answers.get("sleep"), "less-5", "5-6"):
        extras.append("Limited sleep slowing nightly repair")
    if _answer_matches(answers.get("water"), "less-2", "2-4"):
        extras.append("Low hydration reducing plumpness")
    if _answer_matches(answers.get("diet"), "average", "unhealthy"):
        extras.append("Processed foods lowering antioxidant reserves")
    if answers.get("main_concern") == "pigmentation":
        extras.append("Lingering UV damage causing pigmentation")
    if answers.get("main_concern") == "acne":
        extras.append("Clogged pores from excess oil and bacteria")
    if _answer_matches(answers.get("sensitivity"), "actives", "sun"):
        extras.append("Reactive barrier from aggressive actives")
    return _dedupe(causes + extras)


def _augment_recommendations(recs: List[Dict[str, Any]], answers: Mapping[str, str | None]) -> List[Dict[str, Any]]:
    output = _copy_entries(recs)
    concern = answers.get("main_concern")
    if concern == "acne":
        output.append({
            "title": "Targeted blemish serum",
            "summary": "Encapsulated adapalene to keep pores compact.",
            "category": "treatment",
            "priority": "High",
        })
    if concern == "pigmentation":
        output.append({
            "title": "Tranexamic acid booster",
            "summary": "Fades spots without sensitising the barrier.",
            "category": "serum",
            "priority": "Medium",
        })
    if _answer_matches(answers.get("stress"), "high", "very-high"):
        output.append({
            "title": "Ashwagandha adaptogen blend",
            "summary": "Balances cortisol to reduce inflammatory flares.",
            "category": "lifestyle",
            "priority": "Medium",
        })
    return output


def _augment_plan_focus(plan_focus: List[str], answers: Mapping[str, str | None]) -> List[str]:
    extras: List[str] = []
    if _answer_matches(answers.get("sleep"), "less-5", "5-6"):
        extras.append("Establish blue-light cut off 60 minutes before bed")
    if _answer_matches(answers.get("water"), "less-2", "2-4"):
        extras.append("Stack electrolytes with every litre of water")
    if _answer_matches(answers.get("stress"), "high", "very-high"):
        extras.append("Schedule micro-breaks for breathwork between meetings")
    return _dedupe(plan_focus + extras)


def _augment_lifestyle(lifestyle: List[Dict[str, Any]], answers: Mapping[str, str | None]) -> List[Dict[str, Any]]:
    habits = _copy_entries(lifestyle)
    if _answer_matches(answers.get("diet"), "average", "unhealthy"):
        habits.append({"title": "Colourful Plate", "detail": "Aim for 3 colours per meal to raise antioxidant intake."})
    if _answer_matches(answers.get("sleep"), "less-5", "5-6"):
        habits.append({"title": "Sleep Wind-down", "detail": "Magnesium glycinate + breathing ritual 30 minutes pre-bed."})
    if _answer_matches(answers.get("stress"), "high", "very-high"):
        habits.append({"title": "Box Breathing Alarm", "detail": "3 daily reminders for 4-7-8 breathing."})
    return habits


def _augment_timeline(timeline: List[Dict[str, Any]], answers: Mapping[str, str | None]) -> List[Dict[str, Any]]:
    custom = _copy_entries(timeline)
    if _answer_matches(answers.get("main_concern"), "wrinkles", "dullness"):
        custom.append({"month": len(custom) + 1, "title": "Glow Boost", "description": "Introduce weekly gentle peel for luminosity."})
    return custom


def build_personalized_plan(label: str, answers: Mapping[str, str | None] | None) -> Dict[str, Any]:
    answers = answers or {}
    plan = _clone_archetype(label)
    plan["root_causes"] = _augment_root_causes(plan["root_causes"], answers)
    plan["plan_focus"] = _augment_plan_focus(plan["plan_focus"], answers)
    plan["lifestyle"] = _augment_lifestyle(plan["lifestyle"], answers)
    plan["recommendations"] = _augment_recommendations(plan["recommendations"], answers)
    plan["timeline"] = _augment_timeline(plan["timeline"], answers)
    return plan
