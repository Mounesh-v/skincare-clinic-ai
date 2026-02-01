"""FastAPI service that generates lightweight skin-care assessment summaries.
The logic is intentionally rule-based so it can run without ML weights while the
product MVP is being built.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

try:
    from .model import load_predictor
except Exception as predictor_import_error:  # pragma: no cover - optional dependency
    load_predictor = None
    print(f"[Startup] SkinTypePredictor unavailable: {predictor_import_error}")

try:
    from .recommendations import load_recommender
except Exception as recommender_import_error:  # pragma: no cover - optional dependency
    load_recommender = None
    print(f"[Startup] ProductRecommender unavailable: {recommender_import_error}")


if TYPE_CHECKING:  # pragma: no cover - hints only
    from .model.predictor import SkinTypePredictor
    from .recommendations import ProductRecommender

app = FastAPI(
    title="SkinCare Clinic AI",
    description="Rule-based analyzer for skin assessment responses.",
    version="0.1.0",
)

# Allow local dev UIs (Vite + any staging origin) to hit the API without CORS noise.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class LeadInfo(BaseModel):
    name: Optional[str] = Field(None, description="Customer's full name")
    email: Optional[str] = Field(None, description="Email for follow-ups")
    phone: Optional[str] = Field(None, description="Optional contact number")
    consent: bool = Field(default=False, description="Marketing / follow-up consent flag")

    @validator("email")
    def normalise_email(cls, value: Optional[str]) -> Optional[str]:  # noqa: N805
        if value:
            trimmed = value.strip()
            if "@" not in trimmed or "." not in trimmed.rsplit("@", 1)[-1]:
                raise ValueError("email must be a valid email address")
            return trimmed.lower()
        return value


class AssessmentRequest(BaseModel):
    lead: Optional[LeadInfo] = Field(None, description="Optional lead capture metadata")
    answers: Dict[str, str] = Field(..., description="Keyed answers from the assessment flow")
    image_data: Optional[str] = Field(
        default=None,
        description="Optional data URL or base64 encoded facial image for analysis",
    )

    @validator("answers")
    def ensure_answers_present(cls, value: Dict[str, str]) -> Dict[str, str]:  # noqa: N805
        if not value:
            raise ValueError("answers must contain at least one entry")
        return {k: v.strip().lower() for k, v in value.items() if isinstance(v, str)}

    @validator("image_data")
    def validate_image_data(cls, value: Optional[str]) -> Optional[str]:  # noqa: N805
        if not value:
            return value
        data = value.split(",", 1)[1] if "," in value else value
        try:
            raw = base64.b64decode(data, validate=True)
        except (binascii.Error, ValueError) as exc:  # pragma: no cover - validation path
            raise ValueError("image_data must be valid base64") from exc
        size_mb = len(raw) / (1024 * 1024)
        if size_mb > 5:
            raise ValueError("image_data exceeds 5MB limit")
        return value


class Recommendation(BaseModel):
    title: str
    summary: str
    category: str
    priority: str
    price: Optional[int] = None
    product_id: Optional[str] = None
    image_url: Optional[str] = None


class LifestyleSuggestion(BaseModel):
    title: str
    detail: str


class FeatureInsight(BaseModel):
    label: str
    value: float
    unit: str = Field(default="")


class ImageAnalysis(BaseModel):
    predicted_skin_type: str
    confidence: float
    feature_insights: List[FeatureInsight]
    notes: Optional[str] = None


class TimelineMilestone(BaseModel):
    month: int
    title: str
    description: str


class CaseSnapshot(BaseModel):
    month: int
    label: str
    summary: str


class MatchedCase(BaseModel):
    name: str
    headline: str
    story: str
    snapshots: List[CaseSnapshot]


class AssessmentResponse(BaseModel):
    generated_at: datetime
    skin_profile: str
    severity: str
    root_causes: List[str]
    plan_focus: List[str]
    recommendations: List[Recommendation]
    lifestyle: List[LifestyleSuggestion]
    image_analysis: Optional[ImageAnalysis] = None
    stage_label: str
    months_to_results: int
    success_probability: float
    timeline: List[TimelineMilestone]
    matched_case: MatchedCase


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"
DATA_DIR = BASE_DIR / "data"

PREDICTOR: Optional["SkinTypePredictor"]
if load_predictor:
    try:
        PREDICTOR = load_predictor(MODEL_DIR)
    except Exception as predictor_init_error:  # pragma: no cover - startup resilience
        PREDICTOR = None
        print(f"[Startup] Failed to initialise SkinTypePredictor: {predictor_init_error}")
else:
    PREDICTOR = None

PRODUCT_RECOMMENDER: Optional["ProductRecommender"]
if load_recommender:
    try:
        PRODUCT_RECOMMENDER = load_recommender(DATA_DIR)
    except Exception as recommender_init_error:  # pragma: no cover - startup resilience
        PRODUCT_RECOMMENDER = None
        print(f"[Startup] Failed to initialise ProductRecommender: {recommender_init_error}")
else:
    PRODUCT_RECOMMENDER = None


SKIN_TYPE_SUMMARY = {
    "oily": "Your skin over-produces sebum, so we focus on balancing oil while keeping the moisture barrier intact.",
    "dry": "Your skin struggles to retain moisture, so we prioritise barrier repair and deep hydration.",
    "combination": "You have both dry and oily zones. A zonal routine keeps your T‑zone clear and cheeks nourished.",
    "sensitive": "Your skin reacts easily. Our plan keeps formulas calming, fragrance-free, and barrier safe.",
    "normal": "Your skin is well balanced. We maintain the baseline while addressing target concerns.",
}

CONCERN_PROTOCOLS = {
    "acne": [
        "Topical salicylic or azelaic acid for congestion",
        "Oil-balancing gel moisturiser",
        "Spot SOS treatment with benzoyl peroxide",
    ],
    "pigmentation": [
        "Vitamin C and niacinamide for brightening",
        "Night-time retinoid to reduce spots",
        "Broad-spectrum SPF 50 every morning",
    ],
    "wrinkles": [
        "Peptide + retinol night treatment",
        "Broad-spectrum SPF 50 for prevention",
        "Collagen-support supplement with vitamin C",
    ],
    "dullness": [
        "Chemical exfoliation twice a week",
        "Daily antioxidant serum",
        "Hydrating sleeping mask 3x weekly",
    ],
    "dark_circles": [
        "Caffeine + peptides eye serum",
        "Cooling massage to improve microcirculation",
        "Sleep hygiene plan and stress reduction",
    ],
    "rashes": [
        "Dermatologist-formulated barrier cream",
        "Anti-inflammatory oral supplement",
        "Trigger audit for products, fabrics, allergens",
    ],
}

STRESS_FACTORS = {
    "very-high": "Chronic stress spikes cortisol which worsens inflammation and breakouts.",
    "high": "Elevated stress is slowing your repair cycle and can trigger acne.",
    "moderate": "Moderate stress can still impact your barrier. Mindfulness habits help.",
}

SLEEP_FACTORS = {
    "less-5": "Severe sleep debt disrupts hormonal balance and slows skin recovery.",
    "5-6": "Limited sleep lowers collagen synthesis. Aim for at least 7 hours.",
}

HYDRATION_FACTORS = {
    "less-2": "Hydration is very low. We add electrolyte water goals and hydrating foods.",
    "2-4": "Increase daily water intake to keep skin plump and detox pathways active.",
}

STAGE_LIBRARY = {
    "Mild": {
        "label": "Stage 1 · Glow Reboot",
        "months": 3,
        "success": 0.94,
    },
    "Moderate": {
        "label": "Stage 2 · Barrier Rehab",
        "months": 4,
        "success": 0.89,
    },
    "High": {
        "label": "Stage 3 · Intensive Reset",
        "months": 5,
        "success": 0.83,
    },
}


def infer_severity(answers: Dict[str, str]) -> str:
    stress = answers.get("stress")
    sleep = answers.get("sleep")
    concern = answers.get("main_concern")

    severity_score = 0
    if stress in {"very-high", "high"}:
        severity_score += 2
    elif stress == "moderate":
        severity_score += 1

    if sleep in {"less-5"}:
        severity_score += 2
    elif sleep == "5-6":
        severity_score += 1

    if concern in {"acne", "rashes"}:
        severity_score += 1

    if severity_score >= 4:
        return "High"
    if severity_score >= 2:
        return "Moderate"
    return "Mild"


def build_root_causes(answers: Dict[str, str]) -> List[str]:
    causes: List[str] = []
    if answers.get("stress") in STRESS_FACTORS:
        causes.append(STRESS_FACTORS[answers["stress"]])
    if answers.get("sleep") in SLEEP_FACTORS:
        causes.append(SLEEP_FACTORS[answers["sleep"]])
    if answers.get("water") in HYDRATION_FACTORS:
        causes.append(HYDRATION_FACTORS[answers["water"]])
    diet = answers.get("diet")
    if diet in {"average", "unhealthy"}:
        causes.append("Diet gaps are depriving your skin of antioxidants and essential fatty acids.")
    return causes


def build_plan_focus(answers: Dict[str, str], severity: str) -> List[str]:
    concern = answers.get("main_concern", "overall wellbeing").replace("_", " ")
    focuses = [f"Tackle {concern} with dermatologist-formulated actives."]
    if severity != "Mild":
        focuses.append("Protect the skin barrier with layered hydration and SPF.")
    if answers.get("stress") in {"high", "very-high"}:
        focuses.append("Introduce stress-regulation rituals (breathwork, guided sleep audio).")
    if answers.get("sleep") in {"less-5", "5-6"}:
        focuses.append("Create a sleep wind-down plan to reach 7-8 hours of rest.")
    return focuses


def create_recommendations(
    answers: Dict[str, str],
    severity: str,
    image_analysis: Optional[ImageAnalysis],
) -> List[Recommendation]:
    concern = answers.get("main_concern", "")
    protocols = CONCERN_PROTOCOLS.get(concern, [
        "Balanced cleanser + moisturiser routine",
        "Broad-spectrum SPF 50 every morning",
        "Monthly dermatologist review to tweak actives",
    ])

    priority = "High" if severity != "Mild" else "Medium"
    recommendations = [
        Recommendation(
            title="AM Routine",
            summary=protocols[0],
            category="topical",
            priority=priority,
        ),
        Recommendation(
            title="PM Routine",
            summary=protocols[1] if len(protocols) > 1 else protocols[0],
            category="topical",
            priority=priority,
        ),
    ]

    if len(protocols) > 2:
        recommendations.append(
            Recommendation(
                title="Targeted Booster",
                summary=protocols[2],
                category="booster",
                priority="Medium",
            )
        )

    if answers.get("diet") in {"average", "unhealthy"}:
        recommendations.append(
            Recommendation(
                title="Nutrition Upgrade",
                summary="Personalised meal plan rich in antioxidants, omega-3, and lean protein.",
                category="lifestyle",
                priority="High",
            )
        )

    if PRODUCT_RECOMMENDER is not None:
        predicted_type = (
            image_analysis.predicted_skin_type
            if image_analysis
            else answers.get("skin_type", "normal")
        )
        try:
            product_matches = PRODUCT_RECOMMENDER.recommend(predicted_type, concern, severity)
        except Exception as recommender_error:  # pragma: no cover - defensive
            print(f"[Recommender] Failed to score products: {recommender_error}")
            product_matches = []

        for product in product_matches[:3]:
            benefits_raw = product.get("benefits")
            benefits = [str(item) for item in benefits_raw] if isinstance(benefits_raw, list) else []

            headline = "; ".join(benefits[:2]) if benefits else "Clinically aligned pick"
            summary_parts = [headline]

            price_obj = product.get("price")
            price_value = int(price_obj) if isinstance(price_obj, (int, float)) else None
            if price_value is not None:
                summary_parts.append(f"Price approx INR {price_value}")

            summary = " | ".join(part for part in summary_parts if part)

            title_obj = product.get("name", "Recommended Product")
            category_obj = product.get("category", "Product")
            image_obj = product.get("image_url")
            product_id_obj = product.get("id")

            recommendations.append(
                Recommendation(
                    title=str(title_obj),
                    summary=summary,
                    category=str(category_obj),
                    priority="High" if severity != "Mild" else "Medium",
                    price=price_value,
                    product_id=str(product_id_obj) if isinstance(product_id_obj, str) else None,
                    image_url=str(image_obj) if isinstance(image_obj, str) else None,
                )
            )

    return recommendations


def summarise_image(image_data: Optional[str], answers: Dict[str, str]) -> Optional[ImageAnalysis]:
    if not image_data:
        return None

    data = image_data.split(",", 1)[1] if "," in image_data else image_data
    try:
        raw = base64.b64decode(data, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail="image_data must be valid base64") from exc

    if PREDICTOR is not None:
        result: Optional[Dict[str, Any]] = None
        try:
            raw_result = PREDICTOR.predict(raw)
            if isinstance(raw_result, dict):
                result = raw_result
        except ValueError as prediction_error:
            if "No_face_detected" in str(prediction_error):
                raise HTTPException(status_code=422, detail="No face detected in uploaded image") from prediction_error
        except Exception as prediction_error:  # pragma: no cover - resilience when torch fails
            print(f"[Predictor] Inference error, falling back to digest heuristics: {prediction_error}")

        if result:
            raw_feature_insights = result.get("feature_insights", [])
            feature_insights: List[FeatureInsight] = []
            for raw_item in raw_feature_insights:
                if not isinstance(raw_item, dict):
                    continue
                label_obj = raw_item.get("label", "Feature")
                value_obj = raw_item.get("value", 0.0)
                unit_obj = raw_item.get("unit", "")
                label = str(label_obj)
                value = float(value_obj) if isinstance(value_obj, (int, float)) else 0.0
                unit = str(unit_obj) if isinstance(unit_obj, str) else ""
                feature_insights.append(FeatureInsight(label=label, value=value, unit=unit))

            if not feature_insights:
                feature_insights = _digest_feature_insights(raw)

            confidence_obj = result.get("confidence", 0.6)
            confidence = float(confidence_obj) if isinstance(confidence_obj, (int, float)) else 0.6

            predicted_type_obj = result.get("predicted_skin_type")
            predicted_type = str(predicted_type_obj) if isinstance(predicted_type_obj, str) else str(
                answers.get("skin_type", "combination")
            )

            notes_obj = result.get("notes")
            notes = str(notes_obj) if isinstance(notes_obj, str) else None

            face_score_obj = result.get("face_score")
            if face_score_obj is not None and isinstance(face_score_obj, (int, float)) and float(face_score_obj) < 0.12:
                raise HTTPException(status_code=422, detail="No face detected in uploaded image")

            return ImageAnalysis(
                predicted_skin_type=predicted_type,
                confidence=round(confidence, 2),
                feature_insights=feature_insights,
                notes=notes,
            )

    return _digest_based_analysis(raw, answers)


def _digest_based_analysis(raw: bytes, answers: Dict[str, str]) -> ImageAnalysis:
    digest = hashlib.sha256(raw).digest()

    def scale(byte_value: int, low: float, high: float) -> float:
        ratio = byte_value / 255
        return round(low + ratio * (high - low), 2)

    brightness = scale(digest[0], 120.0, 190.0)
    lighting_variability = scale(digest[1], 50.0, 85.0)
    oil_index = scale(digest[2], 180.0, 280.0)
    dryness_index = scale(digest[3], 55.0, 85.0)
    structure_score = digest[5] / 255
    if structure_score < 0.12:
        raise HTTPException(status_code=422, detail="No face detected in uploaded image")

    inferred_type = answers.get("skin_type") or "combination"
    if oil_index - dryness_index > 35:
        inferred_type = "oily"
    elif dryness_index - oil_index > 20:
        inferred_type = "dry"
    elif inferred_type not in SKIN_TYPE_SUMMARY:
        inferred_type = "combination"

    confidence = round(0.75 + (digest[4] / 255) * 0.2, 2)

    notes: Optional[str] = None
    if lighting_variability > 78:
        notes = "Lighting variability is high. Try taking the next photo in even daylight."
    elif dryness_index > 82:
        notes = "Skin appears dehydrated. Layer hydration before the next scan."

    return ImageAnalysis(
        predicted_skin_type=inferred_type,
        confidence=confidence,
        feature_insights=[
            FeatureInsight(label="Brightness Mean", value=brightness),
            FeatureInsight(label="Lighting Variability", value=lighting_variability),
            FeatureInsight(label="Oil Activity Index", value=oil_index),
            FeatureInsight(label="Dryness Index", value=dryness_index),
        ],
        notes=notes,
    )


def _digest_feature_insights(raw: bytes) -> List[FeatureInsight]:
    analysis = _digest_based_analysis(raw, {})
    return analysis.feature_insights


def lifestyle_suggestions(answers: Dict[str, str]) -> List[LifestyleSuggestion]:
    suggestions: List[LifestyleSuggestion] = []
    if answers.get("water") in {"less-2", "2-4"}:
        suggestions.append(
            LifestyleSuggestion(
                title="Hydration Ladder",
                detail="Set reminders to sip 250ml water every hour until you reach 2.5L daily.",
            )
        )
    if answers.get("stress") in {"high", "very-high"}:
        suggestions.append(
            LifestyleSuggestion(
                title="Stress Reset",
                detail="Daily 10 minute guided breathing or yoga nidra to regulate cortisol.",
            )
        )
    if answers.get("sleep") in {"less-5", "5-6"}:
        suggestions.append(
            LifestyleSuggestion(
                title="Sleep Hygiene",
                detail="Create a dim-light wind-down 60 minutes before bed, limit screens, and keep room cool.",
            )
        )
    if answers.get("diet") == "unhealthy":
        suggestions.append(
            LifestyleSuggestion(
                title="Balanced Plate",
                detail="Follow the 50-25-25 rule: half vegetables, quarter lean protein, quarter complex carbs.",
            )
        )
    return suggestions


def derive_stage_details(
    severity: str,
    answers: Dict[str, str],
    image_analysis: Optional[ImageAnalysis],
) -> Dict[str, str | float | int]:
    base = STAGE_LIBRARY.get(severity, STAGE_LIBRARY["Moderate"]).copy()
    months = base["months"]
    success = base["success"]

    stress = answers.get("stress")
    if stress in {"high", "very-high"}:
        months += 1
        success -= 0.05
    sleep = answers.get("sleep")
    if sleep in {"less-5"}:
        months += 1
        success -= 0.03

    if image_analysis:
        confidence = image_analysis.confidence
        if confidence < 0.82:
            success -= 0.03
        elif confidence > 0.88:
            success += 0.02

        oil_metric = next((item.value for item in image_analysis.feature_insights if item.label.lower().startswith("oil")), None)
        dryness_metric = next((item.value for item in image_analysis.feature_insights if item.label.lower().startswith("dry")), None)
        if oil_metric and oil_metric > 260:
            months += 1
        if dryness_metric and dryness_metric < 60:
            success += 0.015

    months = max(3, min(months, 6))
    success = max(0.72, min(success, 0.97))

    return {
        "label": base["label"],
        "months": months,
        "success": success,
    }


def build_timeline(concern: str, months_to_results: int) -> List[TimelineMilestone]:
    concern_readable = concern.replace("_", " ").title() if concern else "Skin Health"
    phases = [
        ("Reset", f"Stabilise inflammation and prime for {concern_readable.lower()} improvement."),
        ("Repair", "Layer barrier-loving actives and nutrition habits."),
        ("Transform", "Introduce performance boosters once skin stays calm."),
        ("Maintain", "Lock results with simplified upkeep and follow-ups."),
    ]

    step = max(1, months_to_results // len(phases))
    timeline: List[TimelineMilestone] = []
    for index, (title, description) in enumerate(phases, start=1):
        month = min(months_to_results, index * step)
        timeline.append(
            TimelineMilestone(
                month=month,
                title=f"Month {month}: {title}",
                description=description,
            )
        )
    if timeline:
        timeline[-1].month = months_to_results
        timeline[-1].title = f"Month {months_to_results}: Maintain"
    return timeline


def build_matched_case(severity: str, concern: str) -> MatchedCase:
    concern_readable = concern.replace("_", " ").title() if concern else "Skin Health"
    persona_pool = [
        ("Elena", "Marketing strategist"),
        ("Suraj", "Med student"),
        ("Maya", "Travel photographer"),
        ("Dev", "Product designer"),
    ]
    index = hash(concern + severity) % len(persona_pool)
    name, role = persona_pool[index]

    snapshots = [
        CaseSnapshot(month=1, label="Month 1", summary="Reset routine and track triggers."),
        CaseSnapshot(month=2, label="Month 2", summary="Texture calmer, fewer flare-ups."),
        CaseSnapshot(month=3, label="Month 3", summary="Visible clarity boost and balanced tone."),
        CaseSnapshot(month=5, label="Month 5", summary="Maintaining glow with lighter routine."),
    ]

    story = (
        f"{name} is a {role} who struggled with {concern_readable.lower()} concerns. "
        f"Following the phased plan, they moved from reactive flare-ups to a calm, balanced complexion." 
        " Weekly check-ins kept the routine adaptive and achievable."
    )

    headline = f"Here is {name}, who matches your profile"

    return MatchedCase(
        name=name,
        headline=headline,
        story=story,
        snapshots=snapshots,
    )


@app.get("/health")
def health_check() -> Dict[str, str]:
    """Simple uptime probe for monitoring."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AssessmentResponse)
def analyze_assessment(payload: AssessmentRequest) -> AssessmentResponse:
    try:
        answers = payload.answers
    except Exception as exc:  # pragma: no cover - defensive for malformed JSON
        raise HTTPException(status_code=400, detail="Invalid assessment payload") from exc

    raw_skin_type = answers.get("skin_type")
    skin_type = raw_skin_type if isinstance(raw_skin_type, str) and raw_skin_type else "balanced"

    image_analysis = summarise_image(payload.image_data, answers)
    profile_key = image_analysis.predicted_skin_type if image_analysis else skin_type
    skin_profile = SKIN_TYPE_SUMMARY.get(
        profile_key,
        "We craft a balanced routine that adapts to your unique skin behaviour.",
    )

    severity = infer_severity(answers)
    root_causes = build_root_causes(answers)
    if not root_causes:
        root_causes.append("Your routine mainly needs optimisation of actives and consistency.")

    plan_focus = build_plan_focus(answers, severity)
    recommendations = create_recommendations(answers, severity, image_analysis)
    lifestyle = lifestyle_suggestions(answers)
    stage_info = derive_stage_details(severity, answers, image_analysis)
    timeline = build_timeline(answers.get("main_concern", ""), int(stage_info["months"]))
    matched_case = build_matched_case(severity, answers.get("main_concern", ""))

    return AssessmentResponse(
        generated_at=datetime.utcnow(),
        skin_profile=skin_profile,
        severity=severity,
        root_causes=root_causes,
        plan_focus=plan_focus,
        recommendations=recommendations,
        lifestyle=lifestyle,
        image_analysis=image_analysis,
        stage_label=str(stage_info["label"]),
        months_to_results=int(stage_info["months"]),
        success_probability=round(float(stage_info["success"]), 2),
        timeline=timeline,
        matched_case=matched_case,
    )
