import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Target,
  Stethoscope,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../common/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * Why Take Our Test Section Component
 * Premium design showcasing key benefits with modern UI
 */
const WhyTakeTest = () => {
  const navigate = useNavigate();
  
  // Initialize scroll animations
  useScrollAnimation();

  // Enhanced benefits data
  const benefits = [
    {
      icon: Target,
      emoji: '🎯',
      title: 'Identify Root Causes',
      description: 'Go beyond symptoms. Our AI analyzes stress, diet, sleep, hormones, and lifestyle patterns to find what\'s really triggering your skin issues.',
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      features: ['Stress Analysis', 'Lifestyle Factors', 'Dietary Impact']
    },
    {
      icon: Stethoscope,
      emoji: '👨‍⚕️',
      title: 'Doctor-Approved Plans',
      description: 'Receive personalized treatment plans created and verified by board-certified dermatologists, not generic advice.',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      features: ['Expert Review', 'Custom Treatments', 'Medical Grade']
    },
    {
      icon: TrendingUp,
      emoji: '📊',
      title: 'Track Your Progress',
      description: 'Monitor improvements with our intelligent dashboard, get regular check-ins, and adjust your plan based on real results.',
      gradient: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      features: ['Smart Dashboard', 'Weekly Updates', 'Plan Adjustments']
    },
  ];

  // Trust indicators
  const trustStats = [
    { icon: Users, value: '50K+', label: 'Tests Completed' },
    { icon: Clock, value: '3 Min', label: 'Quick & Easy' },
    { icon: Shield, value: '100%', label: 'Private & Secure' },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div 
          className="text-center max-w-4xl mx-auto mb-20 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">Free Skin Assessment</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Why Take Our FREE Skin Test?
          </h2>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Our <span className="font-semibold text-slate-900">AI-powered assessment</span> identifies your unique skin concerns and root causes in just 
            <span className="inline-flex items-center gap-1 mx-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">
              <Clock className="h-4 w-4" />
              3 minutes
            </span>
          </p>
        </div>

        {/* Benefits Grid - Premium Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            
            return (
              <div
                key={index}
                className="opacity-0 translate-y-10 transition-all duration-700"
                data-animate
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`
                  relative h-full p-8 rounded-3xl 
                  ${benefit.bgColor}
                  border-2 ${benefit.borderColor}
                  shadow-lg hover:shadow-2xl
                  transition-all duration-500
                  group cursor-pointer
                  hover:-translate-y-2
                `}>
                  {/* Decorative gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} rounded-t-3xl`}></div>
                  
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className={`
                      inline-flex items-center justify-center 
                      w-20 h-20 rounded-2xl bg-white shadow-lg
                      group-hover:scale-110 group-hover:rotate-3
                      transition-all duration-500
                    `}>
                      <IconComponent className={`w-10 h-10 ${benefit.iconColor}`} strokeWidth={2} />
                    </div>
                    
                    {/* Floating emoji */}
                    <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                      {benefit.emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-700 transition-all">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {benefit.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2">
                    {benefit.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-700 rounded-full border border-slate-200"
                      >
                        <CheckCircle2 className={`h-3 w-3 ${benefit.iconColor}`} />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Stats Bar */}
        <div 
          className="max-w-4xl mx-auto mb-12 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '450ms' }}
        >
          <div className="grid grid-cols-3 gap-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            {trustStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 mb-3">
                    <IconComponent className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div 
          className="text-center opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '600ms' }}
        >
          <div className="inline-flex flex-col items-center gap-6 p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl hover:shadow-slate-900/50 transition-all duration-500 group max-w-2xl mx-auto">
            
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">100% Free • No Credit Card</span>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Ready to Discover Your Skin's Story?
              </h3>
              <p className="text-slate-300 text-lg">
                Join 50,000+ people who've transformed their skin
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/assessment')}
              rightIcon={<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              className="bg-white text-slate-900 hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-xl font-bold px-10 py-5 text-lg"
            >
              Start Your FREE Skin Test Now
            </Button>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Takes only 3 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Science-backed results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom testimonial hint */}
        <div 
          className="text-center mt-12 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '700ms' }}
        >
          <div className="inline-flex items-center gap-3 text-slate-600">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  {i === 4 ? '5K+' : ''}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              <span className="text-slate-900 font-bold">50,000+</span> people have taken the test this month
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTakeTest;
