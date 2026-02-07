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

    const analysis = assessmentData.analysis;

    const imageAnalysis = analysis.image_analysis ?? null;
    const predictedKey = imageAnalysis?.predicted_skin_type ?? 'combination';
    const skinTypeLabel = formatSkinLabel(predictedKey);
    const predictedSkinType = skinTypeLabel;

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
<section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-24 text-white overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
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
                <span className="text-emerald-400">{assessmentData.lead.name},</span>
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
            Our AI analyzed your responses, lifestyle patterns, and skin photo to create a personalized treatment plan. 
            Follow the routine consistently and expect visible improvements in{' '}
            <span className="font-semibold text-emerald-400">{analysisResults.monthsToResults} months</span>.
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
            Based on adherence to recommended routine, nutrition guidelines, and monthly progress check-ins.
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
            <span>Results in ~{analysisResults.monthsToResults} months</span>
          </div>
          {confidencePercent && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Photo confidence {confidencePercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
          <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
            Predicted Skin Type
          </p>
          <p className="text-3xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
            {analysisResults.predictedSkinType}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Photo analysis confirmed your questionnaire responses for accuracy.
          </p>
        </div>

        {/* Card 2 */}
        <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-teal-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20">
          <div className="absolute top-4 right-4 w-12 h-12 bg-teal-400/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
            Primary Focus
          </p>
          <p className="text-3xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors">
            {primaryFocus}
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            We prioritize the most impactful treatment for faster visible results.
          </p>
        </div>

        {/* Card 3 */}
        <div className="group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
            Lifestyle Levers
          </p>
          <p className="text-3xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
            {lifestyleTips.length} key habits
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Essential daily rituals to amplify your topical skincare routine.
          </p>
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
<div className="grid gap-6 lg:grid-cols-3 mb-10">
  {/* Tips Card */}
  <div className="lg:col-span-1">
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Tips for Best Results</h3>
      </div>
      
      <ul className="space-y-4">
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Stand near natural light and keep your face centered
          </p>
        </li>
        
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Remove heavy makeup to let the AI see real skin texture
          </p>
        </li>
        
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Avoid blurry photos—steady your hand or use the capture button
          </p>
        </li>
      </ul>
    </div>
  </div>

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
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Analyzed
                    </span>
                  </div>
                </>
              ) : (
                <div className="aspect-[4/3] flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-500">Upload a clear photo for richer insights</p>
                </div>
              )}
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Your submitted image
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                Your AI Analysis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We detected the closest skin type match based on your answers and uploaded image cues
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
                <p className="text-4xl font-bold text-slate-900 mb-3">
                  {analysisResults.predictedSkinType}
                </p>
                
                {analysisResults.imageConfidence !== null && analysisResults.imageConfidence !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">Confidence Level</span>
                      <span className="text-slate-900">{(analysisResults.imageConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${analysisResults.imageConfidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature Insights */}
            <div className="grid grid-cols-2 gap-3">
              {featureInsights.slice(0, 4).map((insight) => (
                <div 
                  key={insight.label} 
                  className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1.5">
                    {insight.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {insight.unit ? `${insight.value} ${insight.unit}` : insight.value}
                  </p>
                </div>
              ))}
            </div>

            {/* AI Notes */}
            {analysisResults.imageNotes && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide">AI Observation</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {analysisResults.imageNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
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