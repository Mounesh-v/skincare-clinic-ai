import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertCircle, TrendingUp,
  Award, Shield, Clock, ArrowRight, X
} from 'lucide-react';
import Button from "../../components/common/Button";
import Card, { CardHeader, CardTitle, CardBody } from "../../components/common/Card";
// import { formatCurrency } from '../utils/formatters';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SKIN_TYPE_LABELS = {
  oily: 'Oily',
  dry: 'Dry',
  combination: 'Combination',
  sensitive: 'Sensitive',
  normal: 'Normal',
};

const CAUSE_ICON_MAP = [
  { match: 'stress', icon: '😰' },
  { match: 'sleep', icon: '😴' },
  { match: 'hydration', icon: '💧' },
  { match: 'diet', icon: '🥗' },
  { match: 'environment', icon: '🌤️' },
];

const DEFAULT_PLAN_FOCUS = [
  'Custom topical routine that balances oil and hydration.',
  'Barrier repair with ceramide-rich moisturisers.',
  'Monthly dermatologist follow-ups to tweak actives.',
];

const DEFAULT_LIFESTYLE = [
  { title: 'Hydration Habit', detail: 'Sip 2.5L water daily with electrolyte boosters.' },
  { title: 'Stress Reset', detail: '10 minutes of guided breathing or yoga nidra daily.' },
  { title: 'Sleep Ritual', detail: 'Aim for 7-8 hours with a screen-free wind-down routine.' },
];

const DEFAULT_FEATURE_INSIGHTS = [
  { label: 'Brightness Mean', value: 146.33, unit: '' },
  { label: 'Lighting Variability', value: 63.24, unit: '' },
  { label: 'Oil Activity Index', value: 241.15, unit: '' },
  { label: 'Dryness Index', value: 62.14, unit: '' },
];

const pickCauseIcon = (text = '') => {
  const lower = text.toLowerCase();
  const match = CAUSE_ICON_MAP.find((item) => lower.includes(item.match));
  return match?.icon ?? '✨';
};

const formatSkinLabel = (key = '') => {
  if (!key) {
    return 'Custom';
  }
  if (SKIN_TYPE_LABELS[key]) {
    return SKIN_TYPE_LABELS[key];
  }
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    skinType: 'Combination',
    predictedSkinType: 'Combination',
    severity: 'Moderate',
    stageLabel: 'Stage 2 · Barrier Rehab',
    monthsToResults: 4,
    successProbability: 0.89,
    rootCauses: [
      { id: 1, cause: 'Stress & Sleep Deprivation', impact: 'High', icon: '😰' },
      { id: 2, cause: 'Poor Hydration', impact: 'Medium', icon: '💧' },
      { id: 3, cause: 'Diet & Nutrition Gaps', impact: 'Medium', icon: '🥗' },
      { id: 4, cause: 'Environmental Factors', impact: 'Low', icon: '🌤️' },
    ],
    recommendations: [
      { title: 'Custom medicated cream', summary: 'Custom medicated cream for acne control', category: 'Treatment', priority: 'High', price: null },
      { title: 'Hydrating serum', summary: 'Hydrating serum for moisture balance', category: 'Serum', priority: 'High', price: null },
      { title: 'Vitamin C supplement', summary: 'Vitamin C supplement for skin health', category: 'Supplement', priority: 'Medium', price: null },
      { title: 'Personalized diet plan', summary: 'Personalized diet plan tailored to your needs', category: 'Lifestyle', priority: 'Medium', price: null },
      { title: 'Stress management techniques', summary: 'Guided stress management techniques', category: 'Lifestyle', priority: 'Medium', price: null },
    ],
    estimatedTimeline: '3-6 months',
    successRate: '93%',
    planFocus: DEFAULT_PLAN_FOCUS,
    lifestyle: DEFAULT_LIFESTYLE,
    featureInsights: DEFAULT_FEATURE_INSIGHTS,
    imageConfidence: 0.86,
    imageNotes: 'Lighting looks consistent. Keep using natural light for future scans.',
    timeline: [
      { month: 1, title: 'Month 1: Reset', description: 'Stabilise inflammation and reset your routine.' },
      { month: 2, title: 'Month 2: Repair', description: 'Rebuild barrier strength with hydrating actives.' },
      { month: 3, title: 'Month 3: Transform', description: 'Introduce glow-boosting formulas as skin calms.' },
      { month: 4, title: 'Month 4: Maintain', description: 'Lock in results with simplified upkeep.' },
    ],
    matchedCase: {
      name: 'Maya',
      headline: 'Here is Maya, who matches your profile',
      story: 'Maya balanced a hectic travel schedule with a calming routine and saw visible clarity by month 3.',
      snapshots: [
        { month: 1, label: 'Month 1', summary: 'Reset routine and track triggers.' },
        { month: 2, label: 'Month 2', summary: 'Texture calmer, fewer flare-ups.' },
        { month: 3, label: 'Month 3', summary: 'Balanced oil control and glow returns.' },
        { month: 4, label: 'Month 4', summary: 'Maintaining glow with lighter routine.' },
      ],
    },
  };

  const computedAnalysis = useMemo(() => {
    if (!assessmentData?.analysis) {
      return null;
    }

    const answers = assessmentData.answers ?? {};
    const analysis = assessmentData.analysis;

    const skinTypeKey = answers.skin_type ?? 'custom';
    const imageAnalysis = analysis.image_analysis ?? null;
    const predictedKey = imageAnalysis?.predicted_skin_type ?? skinTypeKey;
    const skinTypeLabel = formatSkinLabel(skinTypeKey);
    const predictedSkinType = formatSkinLabel(predictedKey);

    const rootCauses = (analysis.root_causes ?? []).map((cause, index) => ({
      id: index + 1,
      cause,
      impact: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
      icon: pickCauseIcon(cause),
    }));

    const recommendations = (analysis.recommendations ?? []).map((item) => {
      if (!item) {
        return null;
      }
      if (typeof item === 'string') {
        return { title: item, summary: item, category: 'general', priority: 'Medium' };
      }
      if (typeof item === 'object') {
        return {
          title: item.title ?? item.summary ?? 'Recommended Product',
          summary: item.summary ?? item.title ?? '',
          category: item.category ?? 'general',
          priority: item.priority ?? 'Medium',
          price: item.price ?? null,
        };
      }
      return null;
    }).filter(Boolean);

    const severity = analysis.severity ?? 'Moderate';

    const estimatedTimeline = (() => {
      if (severity === 'High') {
        return '4-6 months';
      }
      if (severity === 'Moderate') {
        return '3-4 months';
      }
      return '6-8 weeks';
    })();

    const planFocus = analysis.plan_focus?.length ? analysis.plan_focus : DEFAULT_PLAN_FOCUS;
    const lifestyle = analysis.lifestyle?.length ? analysis.lifestyle : DEFAULT_LIFESTYLE;
    const featureInsights = (imageAnalysis?.feature_insights ?? []).map((item) => ({
      label: item.label,
      value: typeof item.value === 'number' ? Number(item.value.toFixed(2)) : item.value,
      unit: item.unit ?? '',
    }));
    const imageConfidence = typeof imageAnalysis?.confidence === 'number' ? imageAnalysis.confidence : null;
    const imageNotes = imageAnalysis?.notes ?? null;
    const stageLabel = analysis.stage_label ?? defaultAnalysis.stageLabel;
    const monthsToResults = typeof analysis.months_to_results === 'number' ? analysis.months_to_results : defaultAnalysis.monthsToResults;
    const successProbability = typeof analysis.success_probability === 'number' ? analysis.success_probability : defaultAnalysis.successProbability;
    const timeline = (analysis.timeline ?? []).map((item, index) => ({
      month: item.month ?? index + 1,
      title: item.title ?? `Month ${index + 1}`,
      description: item.description ?? '',
    }));
    const matchedCaseRaw = analysis.matched_case ?? null;
    const matchedCase = matchedCaseRaw
      ? {
          name: matchedCaseRaw.name ?? defaultAnalysis.matchedCase.name,
          headline: matchedCaseRaw.headline ?? defaultAnalysis.matchedCase.headline,
          story: matchedCaseRaw.story ?? defaultAnalysis.matchedCase.story,
          snapshots: (matchedCaseRaw.snapshots ?? []).map((snap, snapIndex) => ({
            month: snap.month ?? snapIndex + 1,
            label: snap.label ?? `Month ${snapIndex + 1}`,
            summary: snap.summary ?? '',
          })),
        }
      : defaultAnalysis.matchedCase;

    return {
      skinType: skinTypeLabel,
      predictedSkinType,
      severity,
      rootCauses: rootCauses.length ? rootCauses : defaultAnalysis.rootCauses,
      recommendations: recommendations.length ? recommendations : defaultAnalysis.recommendations,
      estimatedTimeline,
      successProbability,
      successRate: `${Math.round(successProbability * 100)}%`,
      planFocus,
      lifestyle,
      featureInsights: featureInsights.length ? featureInsights : DEFAULT_FEATURE_INSIGHTS,
      imageConfidence: imageConfidence ?? defaultAnalysis.imageConfidence,
      imageNotes: imageNotes ?? defaultAnalysis.imageNotes,
      stageLabel,
      monthsToResults,
      timeline: timeline.length ? timeline : defaultAnalysis.timeline,
      matchedCase: matchedCase.snapshots?.length ? matchedCase : defaultAnalysis.matchedCase,
    };
  }, [assessmentData]);

  const analysisResults = computedAnalysis ?? defaultAnalysis;
  const planFocus = analysisResults.planFocus ?? DEFAULT_PLAN_FOCUS;
  const lifestyleTips = analysisResults.lifestyle ?? DEFAULT_LIFESTYLE;
  const featureInsights = analysisResults.featureInsights ?? DEFAULT_FEATURE_INSIGHTS;
  const timeline = analysisResults.timeline ?? defaultAnalysis.timeline;
  const matchedCase = analysisResults.matchedCase ?? defaultAnalysis.matchedCase;
  const allRecommendations = Array.isArray(analysisResults.recommendations)
    ? analysisResults.recommendations
    : defaultAnalysis.recommendations;
  const regimenCategorySet = new Set(['topical', 'booster', 'lifestyle', 'treatment', 'general']);
  const regimenRecommendations = allRecommendations.filter((item) =>
    regimenCategorySet.has((item.category ?? '').toLowerCase())
  );
  const productRecommendations = allRecommendations.filter((item) =>
    !regimenCategorySet.has((item.category ?? '').toLowerCase())
  );
  const primaryFocus = planFocus[0] ?? 'Stabilise your routine';
  const successPercent = Math.round((analysisResults.successProbability ?? defaultAnalysis.successProbability) * 100);
  const confidencePercent = analysisResults.imageConfidence
    ? Math.round(analysisResults.imageConfidence * 100)
    : null;

  const treatmentPlans = [
    {
      id: '30-day',
      duration: '30 Days',
      popular: false,
      price: 1999,
      originalPrice: 2999,
      discount: 33,
      includes: [
        'Customized skin analysis',
        'Medicated creams & serums',
        'Vitamin supplements',
        '2 doctor consultations',
        'Diet & lifestyle plan',
        'WhatsApp support',
      ],
      description: 'Perfect for trying our treatment approach'
    },
    {
      id: '60-day',
      duration: '60 Days',
      popular: true,
      price: 3499,
      originalPrice: 5998,
      discount: 42,
      includes: [
        'Everything in 30-day plan',
        '4 doctor consultations',
        'Progress tracking dashboard',
        'Personalized adjustments',
        'Priority support',
        '100% money-back guarantee',
      ],
      description: 'Most effective for visible results'
    },
    {
      id: '90-day',
      duration: '90 Days',
      popular: false,
      price: 4999,
      originalPrice: 8997,
      discount: 44,
      includes: [
        'Everything in 60-day plan',
        '6 doctor consultations',
        'Advanced skin tracking',
        'Habit building gamification',
        'Lifetime diet plan access',
        'Extended support',
      ],
      description: 'Complete transformation program'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Analysis Complete */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Personalised assessment report</p>
                <h1 className="text-3xl font-semibold md:text-4xl lg:text-[40px]">
                  {assessmentData?.lead?.name ? `${assessmentData.lead.name},` : 'Hey,'} your skin reboot starts now.
                </h1>
                <p className="max-w-xl text-sm text-white/80 md:text-base">
                  Our AI blended your responses, lifestyle cues, and skin photo to chart a phased plan. Stick to the rhythm and we expect visible shifts in {analysisResults.monthsToResults} months.
                </p>
              </div>
              <div className="w-full max-w-xs rounded-3xl bg-white/10 p-6 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{analysisResults.stageLabel}</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-bold leading-none">{successPercent}%</span>
                  <span className="pb-1 text-xs font-medium text-white/70">success likelihood</span>
                </div>
                <p className="mt-4 text-xs text-white/70">Based on adherence to the recommended routine, nutrition, and monthly check-ins.</p>
              </div>
            </div>

            <div>
              <div className="h-3 w-full rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${successPercent}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-white/75 md:text-sm">
                <span className="inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {analysisResults.stageLabel}</span>
                <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Results in ~{analysisResults.monthsToResults} months</span>
                {confidencePercent && (
                  <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4" /> Photo confidence {confidencePercent}%</span>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-xs uppercase tracking-wide text-white/70">Predicted Skin Type</p>
                <p className="mt-2 text-2xl font-semibold">{analysisResults.predictedSkinType}</p>
                <p className="mt-2 text-sm text-white/70">Photo cues confirmed your questionnaire responses.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-xs uppercase tracking-wide text-white/70">Top Focus</p>
                <p className="mt-2 text-2xl font-semibold">{primaryFocus}</p>
                <p className="mt-2 text-sm text-white/70">We begin by tackling the highest-impact habit shift.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-xs uppercase tracking-wide text-white/70">Lifestyle Levers</p>
                <p className="mt-2 text-2xl font-semibold">{lifestyleTips.length}</p>
                <p className="mt-2 text-sm text-white/70">Key rituals to reinforce topical care each week.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-12 overflow-hidden border border-slate-200 bg-white shadow-sm">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <span>Projected Journey ({analysisResults.monthsToResults} months)</span>
                  <span className="text-sm text-slate-500">Follow the checkpoints to stack visible progress.</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid gap-6 md:grid-cols-4">
                  {timeline.map((milestone) => (
                    <div key={`${milestone.title}-${milestone.month}`} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                          {milestone.month}
                        </span>
                        <span>{milestone.title}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

      {/* Photo + Quick Analysis */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card className="md:col-span-1 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Tips for best results</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Stand near natural light and keep your face centered.</li>
              <li>Remove heavy makeup to let the AI see real skin texture.</li>
              <li>Avoid blurry photos—steady your hand or use the capture button.</li>
            </ul>
          </CardBody>
        </Card>

        <Card className="md:col-span-2 overflow-hidden bg-white shadow-sm">
          <CardBody>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden border border-slate-200">
                  {submittedImage ? (
                    <img src={submittedImage} alt="Your submitted image" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500 text-sm">
                      Upload a clear photo for richer insights.
                    </div>
                  )}
                </div>
                <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white w-fit">
                  Your submitted image
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Your AI Analysis</h3>
                <p className="text-sm text-slate-600">
                  We detected the closest skin type match based on your answers and uploaded image cues.
                </p>
                <div className="rounded-3xl bg-gradient-to-r from-[#c9f5d8] via-[#ccecf5] to-[#c4e1ff] p-5">
                  <p className="text-sm text-slate-600">Predicted Skin Type</p>
                  <p className="text-3xl font-bold text-slate-900">{analysisResults.predictedSkinType}</p>
                  {analysisResults.imageConfidence !== null && analysisResults.imageConfidence !== undefined && (
                    <p className="mt-2 text-xs font-medium text-slate-700">
                      Confidence: {(analysisResults.imageConfidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {featureInsights.slice(0, 4).map((insight) => (
                    <div key={insight.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{insight.label}</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {insight.unit ? `${insight.value} ${insight.unit}` : insight.value}
                      </p>
                    </div>
                  ))}
                </div>
                {analysisResults.imageNotes && (
                  <p className="text-xs text-slate-500 bg-slate-100 rounded-xl px-4 py-3">
                    {analysisResults.imageNotes}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
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
                <p className="text-slate-600">
                  Based on your responses, we see <strong className="text-slate-900">{analysisResults.skinType}</strong> tendencies. 
                  The AI photo scan leans <strong className="text-slate-900">{analysisResults.predictedSkinType}</strong> with 
                  <strong className="text-orange-600">{analysisResults.severity}</strong> severity, 
                  so we balance oil control with gentle barrier repair across zones.
                </p>
              </CardBody>
            </Card>

            {/* Root Causes Analysis */}
            <Card className="mb-8 animate-slideUp" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  Root Causes Identified
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  We've identified {analysisResults.rootCauses.length} factors contributing to your skin concerns
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
                        <h4 className="font-semibold text-slate-900 mb-1">{item.cause}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Impact:</span>
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${item.impact === 'High' ? 'bg-red-100 text-red-700' : 
                              item.impact === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                              'bg-yellow-100 text-yellow-700'}
                          `}>
                            {item.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="mb-8 animate-slideUp" style={{ animationDelay: '0.12s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  {matchedCase.headline}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">{matchedCase.story}</p>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {matchedCase.snapshots.map((snap) => (
                    <div
                      key={snap.label}
                      className="min-w-[180px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{snap.label}</p>
                      <p className="mt-2 text-sm text-slate-700">{snap.summary}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Treatment Strategy Focus */}
            <Card className="mb-8 animate-slideUp" style={{ animationDelay: '0.15s' }}>
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
            <Card className="mb-8 animate-slideUp" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary-600" />
                  Your Personalized Treatment Plan
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {(regimenRecommendations.length ? regimenRecommendations : allRecommendations).map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="text-slate-700">
                        <p className="font-semibold text-slate-800">{rec.title}</p>
                        {rec.summary && <p className="text-sm text-slate-600 mt-1">{rec.summary}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {productRecommendations.length > 0 && (
              <Card className="mb-8 animate-slideUp" style={{ animationDelay: '0.22s' }}>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-secondary-600" />
                      Derm-Picked Product Kit
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">
                      Curated formulas matched to your {(analysisResults.predictedSkinType || 'skin').toLowerCase()} profile.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/products')}
                    className="mt-3 md:mt-0 uppercase tracking-wide"
                  >
                    Explore full catalogue
                  </Button>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {productRecommendations.map((product) => {
                      const key = product.product_id ?? product.title;
                      const [description] = (product.summary || '').split('|');
                      const highlightBadge = (product.priority || '').toLowerCase() === 'high';
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
                                <span className="text-lg font-semibold">{product.title?.charAt(0) ?? 'P'}</span>
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
                              <h4 className="text-base font-semibold text-slate-900">{product.title}</h4>
                              {description && (
                                <p className="text-sm text-slate-600">{description.trim()}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {typeof product.price === 'number' ? (
                              <span className="text-lg font-semibold text-slate-900">
                                {formatCurrency(product.price)}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-500">Price on request</span>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate('/products')}
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
            <Card className="mb-8 animate-slideUp" style={{ animationDelay: '0.25s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  Lifestyle Adjustments
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Small daily habits that accelerate visible results and keep flare-ups away.
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 md:grid-cols-2">
                  {lifestyleTips.map((tip, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{tip.title}</h4>
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
                    <h4 className="font-bold text-slate-900 mb-2">Targeted Treatment</h4>
                    <p className="text-sm text-slate-600">
                      Custom formulations address your specific skin concerns
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Doctor Guided</h4>
                    <p className="text-sm text-slate-600">
                      Regular consultations and plan adjustments
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Track Progress</h4>
                    <p className="text-sm text-slate-600">
                      Monitor improvements with our dashboard
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Treatment Plans */}
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-center text-slate-900 mb-3">
                Choose Your Treatment Plan
              </h2>
              <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
                Select a plan that works for you. All plans include personalized treatment, doctor consultations, and ongoing support.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {treatmentPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative ${
                      plan.popular 
                        ? 'border-2 border-primary-600 shadow-xl shadow-primary-500/20' 
                        : ''
                    }`}
                    hoverable
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-1 bg-gradient-primary text-white text-sm font-bold rounded-full shadow-lg">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <CardBody>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {plan.duration}
                        </h3>
                        <div className="mb-3">
                          <span className="text-4xl font-bold text-primary-600">
                            {formatCurrency(plan.price)}
                          </span>
                          <span className="text-slate-500">/month</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-sm text-slate-500 line-through">
                            {formatCurrency(plan.originalPrice)}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                            {plan.discount}% OFF
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{plan.description}</p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={plan.popular ? 'primary' : 'outline'}
                        fullWidth
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPlanModal(true);
                        }}
                      >
                        Choose Plan
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
                      If you don't see visible improvements in your skin within your chosen plan duration, 
                      we'll refund your complete payment. No questions asked.
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
              <h3 className="text-xl font-bold text-slate-900">Confirm Your Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                You've selected the <strong>{selectedPlan.duration}</strong> plan for{' '}
                <strong className="text-primary-600">{formatCurrency(selectedPlan.price)}/month</strong>
              </p>
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-800">
                  💡 <strong>Save {selectedPlan.discount}%</strong> on your treatment!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowPlanModal(false)} fullWidth>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/checkout')}
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