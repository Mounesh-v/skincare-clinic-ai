import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, TrendingUp, Calendar,
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

/**
 * Traya-Inspired Results/Analysis Page
 * Shows personalized skin analysis and treatment recommendations
 */
const SkinAnalysisResults = ({ assessmentData }) => {
  const navigate = useNavigate();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Simulated analysis results (In production, this comes from backend)
  const analysisResults = {
    skinType: 'Combination',
    severity: 'Moderate',
    rootCauses: [
      { id: 1, cause: 'Stress & Sleep Deprivation', impact: 'High', icon: '😰' },
      { id: 2, cause: 'Poor Hydration', impact: 'Medium', icon: '💧' },
      { id: 3, cause: 'Diet & Nutrition Gaps', impact: 'Medium', icon: '🥗' },
      { id: 4, cause: 'Environmental Factors', impact: 'Low', icon: '🌤️' },
    ],
    recommendations: [
      'Custom medicated cream for acne control',
      'Hydrating serum for moisture balance',
      'Vitamin C supplement for skin health',
      'Personalized diet plan',
      'Stress management techniques',
    ],
    estimatedTimeline: '3-6 months',
    successRate: '93%'
  };

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
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg mb-6 animate-scaleIn">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Your Skin Analysis is Complete!
            </h1>
            <p className="text-xl text-white/90 mb-8">
              We've identified the root causes of your skin concerns and created a personalized treatment plan just for you.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">{analysisResults.successRate}</p>
                <p className="text-sm text-white/80">Success Rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">{analysisResults.severity}</p>
                <p className="text-sm text-white/80">Severity Level</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">{analysisResults.rootCauses.length}</p>
                <p className="text-sm text-white/80">Root Causes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">{analysisResults.estimatedTimeline}</p>
                <p className="text-sm text-white/80">Timeline</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            
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
                  Based on your responses, we've determined you have <strong className="text-slate-900">{analysisResults.skinType}</strong> skin 
                  with <strong className="text-orange-600">{analysisResults.severity}</strong> severity level. 
                  This requires a balanced approach targeting both oily and dry areas.
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
                  {analysisResults.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
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