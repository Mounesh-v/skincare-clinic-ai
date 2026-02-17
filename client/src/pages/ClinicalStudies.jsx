import React from 'react';
import { FileCheck, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

const ClinicalStudies = () => {
  const studies = [
    {
      title: 'Acne Treatment Efficacy Study',
      duration: '12 weeks',
      participants: 150,
      results: '87% showed significant improvement',
      details: 'Clinical trial evaluating the effectiveness of our acne treatment formulation on mild to moderate acne. Participants showed visible reduction in breakouts and inflammation.',
      metrics: [
        { label: 'Reduced Breakouts', value: '87%' },
        { label: 'Improved Skin Texture', value: '92%' },
        { label: 'Reduced Inflammation', value: '85%' },
      ],
    },
    {
      title: 'Anti-Aging Serum Clinical Trial',
      duration: '8 weeks',
      participants: 120,
      results: '93% reported visible wrinkle reduction',
      details: 'Double-blind study testing our advanced anti-aging serum formulation. Participants experienced significant improvement in fine lines, wrinkles, and skin firmness.',
      metrics: [
        { label: 'Wrinkle Reduction', value: '93%' },
        { label: 'Improved Firmness', value: '89%' },
        { label: 'Enhanced Radiance', value: '91%' },
      ],
    },
    {
      title: 'Hyperpigmentation Treatment Study',
      duration: '16 weeks',
      participants: 200,
      results: '90% experienced even skin tone',
      details: 'Comprehensive study on treating hyperpigmentation and dark spots. Our brightening formulation showed remarkable results in reducing discoloration.',
      metrics: [
        { label: 'Reduced Dark Spots', value: '90%' },
        { label: 'Even Skin Tone', value: '88%' },
        { label: 'Brighter Complexion', value: '85%' },
      ],
    },
    {
      title: 'Sensitive Skin Tolerance Test',
      duration: '4 weeks',
      participants: 100,
      results: '98% reported no irritation',
      details: 'Safety and tolerance study for sensitive skin types. Our gentle formulations were tested on individuals with reactive and sensitive skin.',
      metrics: [
        { label: 'No Irritation', value: '98%' },
        { label: 'Improved Comfort', value: '94%' },
        { label: 'Reduced Redness', value: '89%' },
      ],
    },
  ];

  const methodology = [
    {
      icon: Users,
      title: 'Diverse Participants',
      description: 'We test on diverse skin types, ages, and ethnicities to ensure universal efficacy',
    },
    {
      icon: FileCheck,
      title: 'Rigorous Protocols',
      description: 'All studies follow strict scientific protocols and are conducted by certified dermatologists',
    },
    {
      icon: TrendingUp,
      title: 'Measurable Results',
      description: 'We use advanced imaging technology and standardized assessments to track progress',
    },
    {
      icon: Award,
      title: 'Third-Party Verified',
      description: 'Independent laboratories verify our findings to ensure objectivity and accuracy',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Clinical Studies</h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Scientifically proven results backed by rigorous clinical testing and research
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Evidence-Based Skincare
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Every product we create undergoes extensive clinical testing to ensure safety and efficacy. 
            Our commitment to scientific validation means you can trust that our products deliver real, 
            measurable results.
          </p>
        </div>

        {/* Methodology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Our Testing Methodology
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((method, index) => {
              const Icon = method.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {method.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Studies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Recent Clinical Studies
          </h2>
          <div className="space-y-8">
            {studies.map((study, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Side - Study Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {study.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {study.details}
                    </p>
                    <div className="flex flex-wrap gap-6 mb-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Duration</p>
                        <p className="font-semibold text-slate-900">{study.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Participants</p>
                        <p className="font-semibold text-slate-900">{study.participants}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Key Finding</p>
                        <p className="text-sm text-emerald-700">{study.results}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Metrics */}
                  <div className="lg:w-64 space-y-4">
                    <p className="font-semibold text-slate-900 mb-4">Results</p>
                    {study.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-4">
                        <p className="text-3xl font-bold text-emerald-600 mb-1">
                          {metric.value}
                        </p>
                        <p className="text-sm text-slate-600">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Our Research Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-emerald-600 mb-2">100+</p>
              <p className="text-slate-600 font-medium">Clinical Studies</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-emerald-600 mb-2">10K+</p>
              <p className="text-slate-600 font-medium">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-emerald-600 mb-2">95%</p>
              <p className="text-slate-600 font-medium">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-emerald-600 mb-2">15+</p>
              <p className="text-slate-600 font-medium">Years Research</p>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Certifications & Recognition
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-slate-900 mb-2">FDA Registered</h4>
              <p className="text-sm text-slate-600">
                Manufactured in FDA-registered facilities
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="text-4xl mb-3">✓</div>
              <h4 className="font-semibold text-slate-900 mb-2">Dermatologist Approved</h4>
              <p className="text-sm text-slate-600">
                Recommended by leading dermatologists
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="text-4xl mb-3">🔬</div>
              <h4 className="font-semibold text-slate-900 mb-2">Lab Tested</h4>
              <p className="text-sm text-slate-600">
                Verified by independent laboratories
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Want to See the Full Research?
          </h3>
          <p className="text-slate-600 mb-6">
            Access detailed study reports and clinical data
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg">
            Download Research Papers
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalStudies;