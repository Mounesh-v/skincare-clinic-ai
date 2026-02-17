import React from 'react';
import { Microscope, Beaker, Award, Target } from 'lucide-react';

const OurScience = () => {
  const principles = [
    {
      icon: Microscope,
      title: 'Research-Driven Approach',
      description: 'Our formulations are backed by extensive scientific research and dermatological studies. We collaborate with leading research institutions to stay at the forefront of skincare innovation.',
    },
    {
      icon: Beaker,
      title: 'Advanced Formulations',
      description: 'We utilize cutting-edge technology and proven ingredients to create effective skincare solutions. Each product is carefully formulated to deliver visible results.',
    },
    {
      icon: Award,
      title: 'Quality Standards',
      description: 'All our products undergo rigorous testing and quality control. We adhere to international standards and ensure every product meets our high-quality benchmarks.',
    },
    {
      icon: Target,
      title: 'Targeted Solutions',
      description: 'We develop personalized skincare solutions based on individual skin types and concerns. Our AI-powered assessment helps identify the most effective treatments for you.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Science</h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Combining cutting-edge technology with dermatological expertise to deliver proven skincare solutions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Science-Backed Skincare
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            At SkinCare AI, we believe that effective skincare starts with science. Our approach combines 
            evidence-based research, advanced technology, and expert dermatological knowledge to create 
            products that truly work.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {principle.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Our Process Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Our Research Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Research & Analysis</h4>
              <p className="text-slate-600 text-sm">
                Study skin conditions and identify effective ingredients through clinical research
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Formulation Development</h4>
              <p className="text-slate-600 text-sm">
                Create and refine formulations with optimal ingredient concentrations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Clinical Testing</h4>
              <p className="text-slate-600 text-sm">
                Conduct rigorous testing to ensure safety, efficacy, and consistent results
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600 mb-2">15+</p>
            <p className="text-slate-600">Years of Research</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600 mb-2">100+</p>
            <p className="text-slate-600">Clinical Studies</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600 mb-2">50K+</p>
            <p className="text-slate-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600 mb-2">98%</p>
            <p className="text-slate-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurScience;