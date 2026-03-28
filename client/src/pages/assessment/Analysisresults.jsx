import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Shield,
  Clock,
  ArrowRight,
  X,
  MapPin,
  Star,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { getTopDoctors } from "../../data/doctors";
import Button from "../../components/common/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/common/Card";
// import { formatCurrency } from '../utils/formatters';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SKIN_TYPE_CONFIG = {
  oily: {
    label: "Oily",
    description: "Your skin produces excess sebum. T-zone appears shiny.",
    color: "#2196F3",
    tips: [
      "Use oil-free moisturizers",
      "Wash face twice daily",
      "Use salicylic acid cleanser",
      "Avoid heavy creams",
    ],
  },
  dry: {
    label: "Dry",
    description: "Your skin lacks moisture. May feel tight or flaky.",
    color: "#FF9800",
    tips: [
      "Use rich hydrating moisturizer",
      "Avoid hot showers",
      "Use gentle cream cleanser",
      "Apply hyaluronic acid serum",
    ],
  },
  normal: {
    label: "Normal",
    description: "Your skin is well balanced. Lucky you!",
    color: "#4CAF50",
    tips: [
      "Maintain current routine",
      "Use SPF daily",
      "Light moisturizer works fine",
      "Stay hydrated",
    ],
  },
  combination: {
    label: "Combination",
    description: "Oily T-zone with dry or normal cheeks.",
    color: "#9C27B0",
    tips: [
      "Use different products per zone",
      "Gel cleanser for T-zone",
      "Light moisturizer on cheeks",
      "Use balancing toner",
    ],
  },
};

const UNKNOWN_SKIN_TYPE_CONFIG = {
  label: "Unable to determine",
  description: "The model could not confidently determine your skin type.",
  color: "#64748B",
  tips: [
    "Retake your photo in natural lighting",
    "Keep your face centered and in focus",
    "Avoid heavy makeup for analysis",
    "Try again with a neutral expression",
  ],
};

const SCORE_KEYS = ["oily", "dry", "normal", "combination"];

const CAUSE_ICON_MAP = [
  { match: "stress", icon: "😰" },
  { match: "sleep", icon: "😴" },
  { match: "hydration", icon: "💧" },
  { match: "diet", icon: "🥗" },
  { match: "environment", icon: "🌤️" },
];

const DEFAULT_PLAN_FOCUS = [
  "Custom topical routine that balances oil and hydration.",
  "Barrier repair with ceramide-rich moisturisers.",
  "Monthly dermatologist follow-ups to tweak actives.",
];

const DEFAULT_LIFESTYLE = [
  {
    title: "Hydration Habit",
    detail: "Sip 2.5L water daily with electrolyte boosters.",
  },
  {
    title: "Stress Reset",
    detail: "10 minutes of guided breathing or yoga nidra daily.",
  },
  {
    title: "Sleep Ritual",
    detail: "Aim for 7-8 hours with a screen-free wind-down routine.",
  },
];

const DEFAULT_FEATURE_INSIGHTS = [
  { label: "Brightness Mean", value: 146.33, unit: "" },
  { label: "Lighting Variability", value: 63.24, unit: "" },
  { label: "Oil Activity Index", value: 241.15, unit: "" },
  { label: "Dryness Index", value: 62.14, unit: "" },
];

const pickCauseIcon = (text = "") => {
  const lower = text.toLowerCase();
  const match = CAUSE_ICON_MAP.find((item) => lower.includes(item.match));
  return match?.icon ?? "✨";
};

const normalizeSkinTypeKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const getSkinTypePresentation = (value = "") => {
  const normalizedKey = normalizeSkinTypeKey(value);
  const config = SKIN_TYPE_CONFIG[normalizedKey];
  if (!config) {
    return {
      key: "unknown",
      config: UNKNOWN_SKIN_TYPE_CONFIG,
    };
  }
  return {
    key: normalizedKey,
    config,
  };
};

const normalizeScores = (scores) => {
  const base = {
    oily: 0,
    dry: 0,
    normal: 0,
    combination: 0,
  };

  if (!scores || typeof scores !== "object") {
    return base;
  }

  const normalized = { ...base };
  for (const [rawKey, rawValue] of Object.entries(scores)) {
    const key = String(rawKey || "")
      .trim()
      .toLowerCase();
    if (!SCORE_KEYS.includes(key)) {
      continue;
    }
    const num = typeof rawValue === "number" ? rawValue : Number(rawValue);
    normalized[key] = Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 0;
  }

  return normalized;
};

const getAnalysisPayload = (analysis) => {
  if (!analysis || typeof analysis !== "object") {
    return {};
  }

  if (analysis.analysis && typeof analysis.analysis === "object") {
    return analysis.analysis;
  }

  return analysis;
};

/**
 * Traya-Inspired Results/Analysis Page
 * Shows personalized skin analysis and treatment recommendations
 */
const SkinAnalysisResults = ({ assessmentData }) => {
  const navigate = useNavigate();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const submittedImage = assessmentData?.image ?? null;

  // Default analysis used until backend response is available
  const defaultAnalysis = {
    skinType: "Combination",
    predictedSkinType: "Combination",
    predictedSkinTypeKey: "combination",
    predictedSkinTypeConfig: SKIN_TYPE_CONFIG.combination,
    predictionScores: {
      oily: 0,
      dry: 0,
      normal: 0,
      combination: 1,
    },
    predictionConfidence: null,
    severity: "Moderate",
    stageLabel: "Stage 2 · Barrier Rehab",
    monthsToResults: 4,
    successProbability: 0.89,
    rootCauses: [
      {
        id: 1,
        cause: "Stress & Sleep Deprivation",
        impact: "High",
        icon: "😰",
      },
      { id: 2, cause: "Poor Hydration", impact: "Medium", icon: "💧" },
      { id: 3, cause: "Diet & Nutrition Gaps", impact: "Medium", icon: "🥗" },
      { id: 4, cause: "Environmental Factors", impact: "Low", icon: "🌤️" },
    ],
    recommendations: [
      {
        title: "Custom medicated cream",
        summary: "Custom medicated cream for acne control",
        category: "Treatment",
        priority: "High",
        price: null,
      },
      {
        title: "Hydrating serum",
        summary: "Hydrating serum for moisture balance",
        category: "Serum",
        priority: "High",
        price: null,
      },
      {
        title: "Vitamin C supplement",
        summary: "Vitamin C supplement for skin health",
        category: "Supplement",
        priority: "Medium",
        price: null,
      },
      {
        title: "Personalized diet plan",
        summary: "Personalized diet plan tailored to your needs",
        category: "Lifestyle",
        priority: "Medium",
        price: null,
      },
      {
        title: "Stress management techniques",
        summary: "Guided stress management techniques",
        category: "Lifestyle",
        priority: "Medium",
        price: null,
      },
    ],
    estimatedTimeline: "3-6 months",
    successRate: "93%",
    planFocus: DEFAULT_PLAN_FOCUS,
    lifestyle: DEFAULT_LIFESTYLE,
    featureInsights: DEFAULT_FEATURE_INSIGHTS,
    imageNotes:
      "Lighting looks consistent. Keep using natural light for future scans.",
    timeline: [
      {
        month: 1,
        title: "Month 1: Reset",
        description: "Stabilise inflammation and reset your routine.",
      },
      {
        month: 2,
        title: "Month 2: Repair",
        description: "Rebuild barrier strength with hydrating actives.",
      },
      {
        month: 3,
        title: "Month 3: Transform",
        description: "Introduce glow-boosting formulas as skin calms.",
      },
      {
        month: 4,
        title: "Month 4: Maintain",
        description: "Lock in results with simplified upkeep.",
      },
    ],
    matchedCase: {
      name: "Maya",
      headline: "Here is Maya, who matches your profile",
      story:
        "Maya balanced a hectic travel schedule with a calming routine and saw visible clarity by month 3.",
      snapshots: [
        {
          month: 1,
          label: "Month 1",
          summary: "Reset routine and track triggers.",
        },
        {
          month: 2,
          label: "Month 2",
          summary: "Texture calmer, fewer flare-ups.",
        },
        {
          month: 3,
          label: "Month 3",
          summary: "Balanced oil control and glow returns.",
        },
        {
          month: 4,
          label: "Month 4",
          summary: "Maintaining glow with lighter routine.",
        },
      ],
    },
  };

  const computedAnalysis = useMemo(() => {
    if (!assessmentData?.analysis) {
      return null;
    }

    const analysis = getAnalysisPayload(assessmentData.analysis);

    // Get skin type from backend response only.
    const skinTypeValue =
      analysis.skin_type ??
      analysis.skinType ??
      analysis.type ??
      analysis.predicted_type ??
      analysis.predictedSkinType ??
      "";
    const { key: predictedSkinTypeKey, config: predictedSkinTypeConfig } =
      getSkinTypePresentation(skinTypeValue);
    const predictedSkinType = predictedSkinTypeConfig.label;
    const skinTypeLabel = predictedSkinType;
    const predictionScores = normalizeScores(
      analysis.scores ?? analysis.skin_scores ?? analysis.type_scores,
    );
    const confidenceSource =
      analysis.confidence ??
      analysis.prediction_confidence ??
      analysis.imageConfidence;
    const confidenceRaw =
      typeof confidenceSource === "number"
        ? confidenceSource
        : Number(confidenceSource);
    const predictionConfidence = Number.isFinite(confidenceRaw)
      ? Math.max(0, Math.min(1, confidenceRaw))
      : null;

    // Detected conditions from EfficientNet (top-3)
    const detectedConditions = Array.isArray(analysis.detected_conditions)
      ? analysis.detected_conditions.slice(0, 3).map((c) => ({
          label: c.label ?? "",
          display:
            c.display ??
            (c.label ?? "")
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
          probability:
            typeof c.probability === "number"
              ? c.probability
              : Number(c.probability ?? 0),
        }))
      : [];

    // ── New XAI fields from backend ────────────────────────────────────────
    // confidence_level: 'Low' | 'Moderate' | 'Strong'
    const confidenceLevel =
      analysis.confidence_level ??
      (predictionConfidence === null
        ? "Low"
        : predictionConfidence >= 0.6
          ? "Strong"
          : predictionConfidence >= 0.4
            ? "Moderate"
            : "Low");

    // top_predictions: [{type, score}, {type, score}]
    const topPredictions = Array.isArray(analysis.top_predictions)
      ? analysis.top_predictions.slice(0, 2).map((p) => ({
          type: p.type ?? "",
          score: typeof p.score === "number" ? p.score : Number(p.score ?? 0),
        }))
      : Object.entries(analysis.scores ?? {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([k, v]) => ({
            type: k.charAt(0).toUpperCase() + k.slice(1),
            score: typeof v === "number" ? v : Number(v ?? 0),
          }));

    // condition_contributions: [{condition, score, points_to, contribution}]
    const conditionContributions = Array.isArray(
      analysis.condition_contributions,
    )
      ? analysis.condition_contributions
      : [];

    // enriched_explanation: richer explanation string from backend
    const enrichedExplanation =
      analysis.enriched_explanation ?? analysis.explanation ?? null;

    // Image analysis data (for feature insights,quality metrics)
    const imageAnalysis = analysis.image_analysis ?? null;

    const rootCauses = (analysis.root_causes ?? []).map((cause, index) => ({
      id: index + 1,
      cause,
      impact: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
      icon: pickCauseIcon(cause),
    }));

    const recommendations = (analysis.recommendations ?? [])
      .map((item) => {
        if (!item) {
          return null;
        }
        if (typeof item === "string") {
          return {
            title: item,
            summary: item,
            category: "general",
            priority: "Medium",
          };
        }
        if (typeof item === "object") {
          return {
            title: item.title ?? item.summary ?? "Recommended Product",
            summary: item.summary ?? item.title ?? "",
            category: item.category ?? "general",
            priority: item.priority ?? "Medium",
            price: item.price ?? null,
          };
        }
        return null;
      })
      .filter(Boolean);

    const severity = analysis.severity ?? "Moderate";

    const estimatedTimeline = (() => {
      if (severity === "High") {
        return "4-6 months";
      }
      if (severity === "Moderate") {
        return "3-4 months";
      }
      return "6-8 weeks";
    })();

    const planFocus = analysis.plan_focus?.length
      ? analysis.plan_focus
      : DEFAULT_PLAN_FOCUS;
    const lifestyle = analysis.lifestyle?.length
      ? analysis.lifestyle
      : DEFAULT_LIFESTYLE;
    const featureInsights = (imageAnalysis?.feature_insights ?? []).map(
      (item) => ({
        label: item.label,
        value:
          typeof item.value === "number"
            ? Number(item.value.toFixed(2))
            : item.value,
        unit: item.unit ?? "",
      }),
    );
    const imageNotes = imageAnalysis?.notes ?? null;
    const stageLabel = analysis.stage_label ?? defaultAnalysis.stageLabel;
    const monthsToResults =
      typeof analysis.months_to_results === "number"
        ? analysis.months_to_results
        : defaultAnalysis.monthsToResults;
    const successProbability =
      typeof analysis.success_probability === "number"
        ? analysis.success_probability
        : defaultAnalysis.successProbability;
    const timeline = (analysis.timeline ?? []).map((item, index) => ({
      month: item.month ?? index + 1,
      title: item.title ?? `Month ${index + 1}`,
      description: item.description ?? "",
    }));
    const matchedCaseRaw = analysis.matched_case ?? null;
    const matchedCase = matchedCaseRaw
      ? {
          name: matchedCaseRaw.name ?? defaultAnalysis.matchedCase.name,
          headline:
            matchedCaseRaw.headline ?? defaultAnalysis.matchedCase.headline,
          story: matchedCaseRaw.story ?? defaultAnalysis.matchedCase.story,
          snapshots: (matchedCaseRaw.snapshots ?? []).map(
            (snap, snapIndex) => ({
              month: snap.month ?? snapIndex + 1,
              label: snap.label ?? `Month ${snapIndex + 1}`,
              summary: snap.summary ?? "",
            }),
          ),
        }
      : defaultAnalysis.matchedCase;

    return {
      skinType: skinTypeLabel,
      predictedSkinType,
      predictedSkinTypeKey,
      predictedSkinTypeConfig,
      predictionScores,
      predictionConfidence,
      confidenceLevel,
      topPredictions,
      conditionContributions,
      enrichedExplanation,
      severity,
      detectedConditions,
      rootCauses: rootCauses.length ? rootCauses : defaultAnalysis.rootCauses,
      recommendations: recommendations.length
        ? recommendations
        : defaultAnalysis.recommendations,
      estimatedTimeline,
      successProbability,
      successRate: `${Math.round(successProbability * 100)}%`,
      planFocus,
      lifestyle,
      featureInsights: featureInsights.length
        ? featureInsights
        : DEFAULT_FEATURE_INSIGHTS,
      imageNotes: imageNotes ?? defaultAnalysis.imageNotes,
      stageLabel,
      monthsToResults,
      timeline: timeline.length ? timeline : defaultAnalysis.timeline,
      matchedCase: matchedCase.snapshots?.length
        ? matchedCase
        : defaultAnalysis.matchedCase,
    };
  }, [assessmentData]);

  const analysisResults = computedAnalysis ?? defaultAnalysis;
  const planFocus = analysisResults.planFocus ?? DEFAULT_PLAN_FOCUS;
  const lifestyleTips = analysisResults.lifestyle ?? DEFAULT_LIFESTYLE;
  const featureInsights =
    analysisResults.featureInsights ?? DEFAULT_FEATURE_INSIGHTS;
  const timeline = analysisResults.timeline ?? defaultAnalysis.timeline;
  const matchedCase =
    analysisResults.matchedCase ?? defaultAnalysis.matchedCase;
  const allRecommendations = Array.isArray(analysisResults.recommendations)
    ? analysisResults.recommendations
    : defaultAnalysis.recommendations;
  const regimenCategorySet = new Set([
    "topical",
    "booster",
    "lifestyle",
    "treatment",
    "general",
  ]);
  const regimenRecommendations = allRecommendations.filter((item) =>
    regimenCategorySet.has((item.category ?? "").toLowerCase()),
  );
  const productRecommendations = allRecommendations.filter(
    (item) => !regimenCategorySet.has((item.category ?? "").toLowerCase()),
  );
  const primaryFocus = planFocus[0] ?? "Stabilise your routine";
  const successPercent = Math.round(
    (analysisResults.successProbability ?? defaultAnalysis.successProbability) *
      100,
  );
  const confidencePercent =
    analysisResults.predictionConfidence !== null &&
    analysisResults.predictionConfidence !== undefined
      ? Math.round(analysisResults.predictionConfidence * 100)
      : null;

  const treatmentPlans = [
    {
      id: "30-day",
      duration: "30 Days",
      popular: false,
      price: 1999,
      originalPrice: 2999,
      discount: 33,
      includes: [
        "Customized skin analysis",
        "Medicated creams & serums",
        "Vitamin supplements",
        "2 doctor consultations",
        "Diet & lifestyle plan",
        "WhatsApp support",
      ],
      description: "Perfect for trying our treatment approach",
    },
    {
      id: "60-day",
      duration: "60 Days",
      popular: true,
      price: 3499,
      originalPrice: 5998,
      discount: 42,
      includes: [
        "Everything in 30-day plan",
        "4 doctor consultations",
        "Progress tracking dashboard",
        "Personalized adjustments",
        "Priority support",
        "100% money-back guarantee",
      ],
      description: "Most effective for visible results",
    },
    {
      id: "90-day",
      duration: "90 Days",
      popular: false,
      price: 4999,
      originalPrice: 8997,
      discount: 44,
      includes: [
        "Everything in 60-day plan",
        "6 doctor consultations",
        "Advanced skin tracking",
        "Habit building gamification",
        "Lifetime diet plan access",
        "Extended support",
      ],
      description: "Complete transformation program",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Analysis Complete */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-24 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        {/* Decorative Blur Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-12">
              <div className="space-y-6 flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
                    Personalized Assessment Report
                  </p>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                  {assessmentData?.lead?.name ? (
                    <>
                      <span className="text-emerald-400">
                        {assessmentData.lead.name},
                      </span>
                      <br />
                      your skin reboot starts now.
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-400">Hey,</span>
                      <br />
                      your skin reboot starts now.
                    </>
                  )}
                </h1>

                <p className="max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
                  Our AI analyzed your responses, lifestyle patterns, and skin
                  photo to create a personalized treatment plan. Follow the
                  routine consistently and expect visible improvements in{" "}
                  <span className="font-semibold text-emerald-400">
                    {analysisResults.monthsToResults} months
                  </span>
                  .
                </p>
              </div>

              {/* Success Card */}
              <div className="w-full lg:w-80 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {analysisResults.stageLabel}
                  </p>
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="flex items-end gap-3 mb-6">
                  <span className="text-6xl font-bold leading-none bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {successPercent}%
                  </span>
                  <span className="pb-2 text-sm font-medium text-white/70">
                    success rate
                  </span>
                </div>

                {/* Mini Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 w-full rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                      style={{ width: `${successPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Based on adherence to recommended routine, nutrition
                  guidelines, and monthly progress check-ins.
                </p>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-10">
              <div className="relative">
                <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-1000 shadow-lg shadow-emerald-500/50"
                    style={{ width: `${successPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-white/75">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>{analysisResults.stageLabel}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-teal-400" />
                  <span>
                    Results in ~{analysisResults.monthsToResults} months
                  </span>
                </div>
                {confidencePercent !== null &&
                  confidencePercent !== undefined && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Model confidence {confidencePercent}%</span>
                    </div>
                  )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
                  Predicted Skin Type
                </p>
                <p
                  className="text-3xl font-bold mb-3 transition-colors"
                  style={{
                    color: analysisResults.predictedSkinTypeConfig.color,
                  }}
                >
                  {analysisResults.predictedSkinType}
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  {analysisResults.predictedSkinTypeConfig.description}
                </p>
              </div>

              {/* Card 2 */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-teal-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20">
                <div className="absolute top-4 right-4 w-12 h-12 bg-teal-400/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
                  Primary Focus
                </p>
                <p className="text-3xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors">
                  {primaryFocus}
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  We prioritize the most impactful treatment for faster visible
                  results.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 sm:col-span-2 lg:col-span-1">
                <div className="absolute top-4 right-4 w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
                  Lifestyle Levers
                </p>
                <p className="text-3xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                  {lifestyleTips.length} key habits
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Essential daily rituals to amplify your topical skincare
                  routine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="py-16  ">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-12  overflow-hidden border border-slate-200 bg-white shadow-sm">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <span>
                    Projected Journey ({analysisResults.monthsToResults} months)
                  </span>
                  <span className="text-sm text-slate-500">
                    Follow the checkpoints to stack visible progress.
                  </span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid gap-6 md:grid-cols-4">
                  {timeline.map((milestone) => (
                    <div
                      key={`${milestone.title}-${milestone.month}`}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                          {milestone.month}
                        </span>
                        <span>{milestone.title}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {milestone.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Tips Card */}
            <div className="lg:col-span-1 w-full">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50  rounded-2xl border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tips for Best Results
                  </h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Stand near natural light and keep your face centered
                    </p>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Remove heavy makeup to let the AI see real skin texture
                    </p>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Avoid blurry photos—steady your hand or use the capture
                      button
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            {/* Photo + Quick Analysis */}
            <div className="my-5 grid gap-2 lg:grid-cols-2 mb-10">
              {/* Analysis Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 lg:p-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                      {/* Image Section */}
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-50">
                          {submittedImage ? (
                            <>
                              <img
                                src={submittedImage}
                                alt="Your submitted image"
                                className="w-full aspect-[4/3] object-cover"
                              />
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Analyzed
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="aspect-[4/3] flex flex-col items-center justify-center">
                              <svg
                                className="w-16 h-16 text-slate-300 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="text-sm font-medium text-slate-500">
                                Upload a clear photo for richer insights
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Your submitted image
                        </div>
                      </div>

                      {/* Analysis Results */}
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                              </svg>
                            </span>
                            Your AI Analysis
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            We detected the closest skin type match based on
                            your answers and uploaded image cues
                          </p>
                        </div>

                        {/* Main Result */}
                        <div className="relative rounded-2xl bg-gradient-to-r from-[#c9f5d8] via-[#ccecf5] to-[#c4e1ff] p-6 shadow-md overflow-hidden border border-emerald-200">
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400 rounded-full blur-3xl"></div>
                          </div>

                          <div className="relative">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                              Predicted Skin Type
                            </p>
                            <p
                              className="text-4xl font-bold mb-3"
                              style={{
                                color:
                                  analysisResults.predictedSkinTypeConfig.color,
                              }}
                            >
                              {analysisResults.predictedSkinType}
                            </p>

                            {analysisResults.predictionConfidence !== null &&
                              analysisResults.predictionConfidence !==
                                undefined && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-700">
                                      Confidence Level
                                    </span>
                                    <span className="text-slate-900">
                                      {(
                                        analysisResults.predictionConfidence *
                                        100
                                      ).toFixed(0)}
                                      %
                                    </span>
                                  </div>
                                  <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                                      style={{
                                        width: `${analysisResults.predictionConfidence * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                            {/* Low-confidence retake suggestion */}
                            {analysisResults.predictionConfidence !== null &&
                              analysisResults.predictionConfidence !==
                                undefined &&
                              analysisResults.predictionConfidence < 0.4 && (
                                <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                  <svg
                                    className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  <div>
                                    <p className="text-xs font-bold text-amber-800">
                                      Low Confidence — Retake Suggested
                                    </p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                      Try a photo with better lighting, no
                                      makeup, and face centered.
                                    </p>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Confidence Level Badge + Top-2 Predictions */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                          {/* Badge row */}
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                              Prediction Confidence
                            </h4>
                            {analysisResults.confidenceLevel &&
                              (() => {
                                const lvl = analysisResults.confidenceLevel;
                                const cfg = {
                                  Strong: {
                                    bg: "bg-emerald-100",
                                    text: "text-emerald-800",
                                    dot: "bg-emerald-500",
                                    icon: "🟢",
                                  },
                                  Moderate: {
                                    bg: "bg-amber-100",
                                    text: "text-amber-800",
                                    dot: "bg-amber-500",
                                    icon: "🟡",
                                  },
                                  Low: {
                                    bg: "bg-red-100",
                                    text: "text-red-800",
                                    dot: "bg-red-500",
                                    icon: "🔴",
                                  },
                                }[lvl] ?? {
                                  bg: "bg-slate-100",
                                  text: "text-slate-700",
                                  dot: "bg-slate-400",
                                  icon: "⚪",
                                };
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${cfg.dot}`}
                                    />
                                    {cfg.icon} {lvl} Confidence
                                  </span>
                                );
                              })()}
                          </div>

                          {/* Top-2 skin type predictions */}
                          {analysisResults.topPredictions?.length > 0 && (
                            <div className="space-y-2">
                              {analysisResults.topPredictions.map(
                                (pred, idx) => (
                                  <div key={pred.type} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                      <span className="flex items-center gap-1.5">
                                        <span
                                          className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-emerald-500" : "bg-slate-300"}`}
                                        />
                                        {idx === 0 ? "🏆 " : ""}
                                        {pred.type}
                                      </span>
                                      <span>
                                        {(pred.score * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-slate-300"}`}
                                        style={{
                                          width: `${pred.score * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        
                      </div>

                      {/* Enriched Explanation */}
                        {analysisResults.enrichedExplanation && (
                          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-2 flex items-center gap-1.5">
                              <span>🧠</span> AI Explanation
                            </h4>
                            <p className="text-xs text-indigo-900 leading-relaxed">
                              {analysisResults.enrichedExplanation}
                            </p>
                          </div>
                        )}

                        {/* ── 4. WHAT IT MEANS (XAI contributions) ────────────── */}
                        {analysisResults.conditionContributions?.length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm">
                                💡
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  What It Means
                                </h4>
                                <p className="text-xs text-slate-500">
                                  How each condition contributed to your result
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {analysisResults.conditionContributions.map(
                                (contrib) => {
                                  const pct = Math.round(contrib.score * 100);
                                  const tagColor =
                                    {
                                      Oily: "text-blue-700 bg-blue-50 border-blue-200",
                                      Dry: "text-orange-700 bg-orange-50 border-orange-200",
                                      Normal:
                                        "text-emerald-700 bg-emerald-50 border-emerald-200",
                                      Combination:
                                        "text-purple-700 bg-purple-50 border-purple-200",
                                    }[contrib.points_to] ??
                                    "text-slate-700 bg-slate-50 border-slate-200";
                                  const condIcon =
                                    contrib.condition === "Wrinkles"
                                      ? "〰️"
                                      : contrib.condition === "Pores"
                                        ? "🔵"
                                        : contrib.condition === "Acne"
                                          ? "🔴"
                                          : contrib.condition === "Blackheads"
                                            ? "⚫"
                                            : contrib.condition === "Dark Spots"
                                              ? "🟤"
                                              : "📍";
                                  return (
                                    <div
                                      key={contrib.condition}
                                      className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shadow-sm">
                                        {condIcon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span className="text-xs font-bold text-slate-800">
                                            {contrib.condition}
                                          </span>
                                          <span className="text-xs text-slate-400">
                                            {pct}% detected
                                          </span>
                                          <span
                                            className={`text-xs font-semibold px-2 py-px rounded-full border ${tagColor}`}
                                          >
                                            → {contrib.points_to}
                                          </span>
                                        </div>
                                        <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-1.5">
                                          <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">
                                          {contrib.contribution}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}

                        {/* ── 5. SKIN TYPE BREAKDOWN ───────────────────────────── */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-sm">
                              📊
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">
                                Skin Type Breakdown
                              </h4>
                              <p className="text-xs text-slate-500">
                                Model confidence across all skin types
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {(() => {
                              const sorted = SCORE_KEYS.map((k) => ({
                                key: k,
                                ...SKIN_TYPE_CONFIG[k],
                                score: analysisResults.predictionScores[k] ?? 0,
                              })).sort((a, b) => b.score - a.score);
                              return sorted.map((item, idx) => {
                                const pct = Math.round(item.score * 100);
                                const rank =
                                  idx === 0
                                    ? {
                                        label: "Primary",
                                        badge:
                                          "bg-emerald-100 text-emerald-700",
                                      }
                                    : idx === 1
                                      ? {
                                          label: "Secondary",
                                          badge: "bg-slate-100 text-slate-600",
                                        }
                                      : null;
                                return (
                                  <div key={item.key} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="flex items-center gap-2 font-semibold text-slate-700">
                                        {item.label}
                                        {rank && (
                                          <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${rank.badge}`}
                                          >
                                            {rank.label}
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-xs font-bold text-slate-500">
                                        {pct}%
                                      </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                          width: `${pct}%`,
                                          backgroundColor: item.color,
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* ── 6. IMAGE QUALITY METRICS ────────────────────────── */}
                        {featureInsights.length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center text-sm">
                                📷
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  Image Quality
                                </h4>
                                <p className="text-xs text-slate-500">
                                  How your photo affected analysis quality
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {featureInsights.slice(0, 4).map((insight) => {
                                const isGood = insight.label
                                  .toLowerCase()
                                  .includes("brightness")
                                  ? insight.value > 100
                                  : insight.label.toLowerCase().includes("oil")
                                    ? insight.value < 300
                                    : true;
                                return (
                                  <div
                                    key={insight.label}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1"
                                  >
                                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                                      {insight.label}
                                    </p>
                                    <p className="text-lg font-bold text-slate-900">
                                      {insight.unit
                                        ? `${insight.value} ${insight.unit}`
                                        : insight.value}
                                    </p>
                                    <span
                                      className={`text-xs font-semibold ${isGood ? "text-emerald-600" : "text-amber-600"}`}
                                    >
                                      {isGood ? "✓ Good" : "↑ Review"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-400 mt-3">
                              Use natural daylight for highest accuracy. Avoid
                              flash or heavy filters.
                            </p>
                          </div>
                        )}

                        {/* ── 7. AI OBSERVATION NOTE ──────────────────────────── */}
                        {analysisResults.imageNotes && (
                          <div className="rounded-xl bg-sky-50 border border-sky-200 p-4">
                            <div className="flex gap-3">
                              <span className="text-sky-600 text-lg flex-shrink-0 mt-0.5">
                                💬
                              </span>
                              <div>
                                <p className="text-xs font-bold text-sky-900 mb-1 uppercase tracking-wide">
                                  AI Observation
                                </p>
                                <p className="text-sm text-sky-800 leading-relaxed">
                                  {analysisResults.imageNotes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── 8. ACTION CTAs ───────────────────────────────────── */}
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 mb-3">
                            Next Steps
                          </h4>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => navigate("/assessment")}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Retake for Better Accuracy
                            </button>
                            <button
                              onClick={() => {
                                const el =
                                  document.getElementById("skincare-plan");
                                if (el)
                                  el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-all duration-200 shadow-sm"
                            >
                              <svg
                                className="w-4 h-4 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              View Your Skincare Plan
                            </button>
                            <button
                              onClick={() => navigate("/products")}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-all duration-200 shadow-sm"
                            >
                              <svg
                                className="w-4 h-4 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              Shop Recommended Products
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Skin Type */}
            <Card className="mb-8 animate-fadeIn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-3xl">🧴</span>
                  Your Skin Type: {analysisResults.skinType}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                  style={{
                    backgroundColor: `${analysisResults.predictedSkinTypeConfig.color}1A`,
                    color: analysisResults.predictedSkinTypeConfig.color,
                  }}
                >
                  {analysisResults.predictedSkinType}
                </div>
                <p className="text-slate-700 mb-4">
                  {analysisResults.predictedSkinTypeConfig.description}
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Recommended Tips
                  </p>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {analysisResults.predictedSkinTypeConfig.tips.map((tip) => (
                      <li
                        key={tip}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-slate-600">
                  Based on your responses, we see{" "}
                  <strong className="text-slate-900">
                    {analysisResults.skinType}
                  </strong>{" "}
                  tendencies. The AI photo scan leans{" "}
                  <strong className="text-slate-900">
                    {analysisResults.predictedSkinType}
                  </strong>{" "}
                  with
                  <strong className="text-orange-600">
                    {analysisResults.severity}
                  </strong>{" "}
                  severity, so we balance oil control with gentle barrier repair
                  across zones.
                </p>
              </CardBody>
            </Card>

            {/* Root Causes Analysis */}
            <Card
              className="mb-8 animate-slideUp"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  Root Causes Identified
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  We've identified {analysisResults.rootCauses.length} factors
                  contributing to your skin concerns
                </p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {analysisResults.rootCauses.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="text-3xl flex-shrink-0">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {item.cause}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            Impact:
                          </span>
                          <span
                            className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${
                              item.impact === "High"
                                ? "bg-red-100 text-red-700"
                                : item.impact === "Medium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                          >
                            {item.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card
              className="mb-8 animate-slideUp"
              style={{ animationDelay: "0.12s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  {matchedCase.headline}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  {matchedCase.story}
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {matchedCase.snapshots.map((snap) => (
                    <div
                      key={snap.label}
                      className="min-w-[180px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {snap.label}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {snap.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Treatment Strategy Focus */}
            <Card
              className="mb-8 animate-slideUp"
              style={{ animationDelay: "0.15s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-secondary-600" />
                  Your Treatment Focus Areas
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {planFocus.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {/* Treatment Recommendations */}
            <Card
              className="mb-8 animate-slideUp"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary-600" />
                  Your Personalized Treatment Plan
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {(regimenRecommendations.length
                    ? regimenRecommendations
                    : allRecommendations
                  ).map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="text-slate-700">
                        <p className="font-semibold text-slate-800">
                          {rec.title}
                        </p>
                        {rec.summary && (
                          <p className="text-sm text-slate-600 mt-1">
                            {rec.summary}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {productRecommendations.length > 0 && (
              <Card
                className="mb-8 animate-slideUp"
                style={{ animationDelay: "0.22s" }}
              >
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-secondary-600" />
                      Derm-Picked Product Kit
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">
                      Curated formulas matched to your{" "}
                      {(
                        analysisResults.predictedSkinType || "skin"
                      ).toLowerCase()}{" "}
                      profile.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/products")}
                    className="mt-3 md:mt-0 uppercase tracking-wide"
                  >
                    Explore full catalogue
                  </Button>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 sm:mx-auto -mx-15">
                    {productRecommendations.map((product) => {
                      const key = product.product_id ?? product.title;
                      const [description] = (product.summary || "").split("|");
                      const highlightBadge =
                        (product.priority || "").toLowerCase() === "high";
                      return (
                        <div
                          key={key}
                           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                                <span className="text-lg font-semibold">
                                  {product.title?.charAt(0) ?? "P"}
                                </span>
                              </div>
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-500">
                                <span>{product.category}</span>
                                {highlightBadge && (
                                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">
                                    Made specially for you
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-semibold text-slate-900">
                                {product.title}
                              </h4>
                              {description && (
                                <p className="text-sm text-slate-600">
                                  {description.trim()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {typeof product.price === "number" ? (
                              <span className="text-lg font-semibold text-slate-900">
                                {formatCurrency(product.price)}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-500">
                                Price on request
                              </span>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate("/products")}
                              className="uppercase"
                              icon={ArrowRight}
                              iconPosition="right"
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Lifestyle Suggestions */}
            <Card
              className="mb-8 animate-slideUp"
              style={{ animationDelay: "0.25s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  Lifestyle Adjustments
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Small daily habits that accelerate visible results and keep
                  flare-ups away.
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 md:grid-cols-2">
                  {lifestyleTips.map((tip, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {tip.title}
                      </h4>
                      <p className="text-sm text-slate-600">{tip.detail}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* How It Works */}
            <Card className="mb-12 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
              <CardHeader>
                <CardTitle>How Your Treatment Works</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">
                      Targeted Treatment
                    </h4>
                    <p className="text-sm text-slate-600">
                      Custom formulations address your specific skin concerns
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">
                      Doctor Guided
                    </h4>
                    <p className="text-sm text-slate-600">
                      Regular consultations and plan adjustments
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">
                      Track Progress
                    </h4>
                    <p className="text-sm text-slate-600">
                      Monitor improvements with our dashboard
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recommended Doctors Section */}
            <div className="mb-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">
                  Recommended Specialists
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Based on your{" "}
                  {(
                    analysisResults.predictedSkinType || "Combination"
                  ).toLowerCase()}{" "}
                  skin profile, we've matched you with top-rated dermatologists
                  who specialize in your specific needs.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {getTopDoctors(
                  analysisResults.predictedSkinTypeKey === "unknown"
                    ? ""
                    : analysisResults.predictedSkinTypeKey,
                  3,
                ).map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="h-full flex flex-col"
                    hoverable
                  >
                    <CardBody className="flex flex-col h-full p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold border-2 border-primary-50">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold">
                          <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                          {doctor.rating}
                        </div>
                      </div>

                      <div className="mb-6 flex-grow">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-primary-600 font-semibold text-sm mb-3">
                          {doctor.specialty}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span>{doctor.experience} Experience</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{doctor.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{doctor.availability}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 italic text-sm text-slate-500 mb-6">
                        "{doctor.about}"
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        className="mt-auto group"
                        onClick={() =>
                          window.open(doctor.bookingLink, "_blank")
                        }
                      >
                        Book Consultation
                        <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            {/* Guarantee Section */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardBody>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      100% Money-Back Guarantee
                    </h3>
                    <p className="text-slate-700">
                      If you don't see visible improvements in your skin within
                      your chosen plan duration, we'll refund your complete
                      payment. No questions asked.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Plan Selection Modal - Simple version */}
      {showPlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Confirm Your Plan
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                You've selected the <strong>{selectedPlan.duration}</strong>{" "}
                plan for{" "}
                <strong className="text-primary-600">
                  {formatCurrency(selectedPlan.price)}/month
                </strong>
              </p>
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-800">
                  💡 <strong>Save {selectedPlan.discount}%</strong> on your
                  treatment!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowPlanModal(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/checkout")}
                fullWidth
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Proceed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinAnalysisResults;
