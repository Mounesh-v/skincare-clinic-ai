import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Microscope,
  Sparkles, 
  Stethoscope, 
  Rocket, 
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import Button from '../common/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * Premium How It Works Section Component
 * Enhanced with modern gradients, glass morphism, and professional design
 */
const HowItWorks = () => {
  const navigate = useNavigate();
  
  // Initialize scroll animations
  useScrollAnimation();

  // Enhanced steps data with better icons and colors
  const steps = [
    { 
      step: '1', 
      title: 'Smart Assessment', 
      desc: 'Answer personalized questions in just 3 minutes', 
      Icon: Microscope,
      gradient: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-400/20 to-teal-500/20',
      iconColor: 'text-emerald-500',
      glowColor: 'shadow-emerald-500/50'
    },
    { 
      step: '2', 
      title: 'AI-Powered Analysis', 
      desc: 'Get instant results using advanced algorithms', 
      Icon: Sparkles,
      gradient: 'from-violet-400 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-400/20 to-purple-500/20',
      iconColor: 'text-violet-500',
      glowColor: 'shadow-violet-500/50'
    },
    { 
      step: '3', 
      title: 'Expert Consultation', 
      desc: 'Connect with certified dermatologists', 
      Icon: Stethoscope,
      gradient: 'from-rose-400 to-pink-500',
      iconBg: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
      iconColor: 'text-rose-500',
      glowColor: 'shadow-rose-500/50'
    },
    { 
      step: '4', 
      title: 'Transform Your Skin', 
      desc: 'Follow your customized treatment plan', 
      Icon: Rocket,
      gradient: 'from-amber-400 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-400/20 to-orange-500/20',
      iconColor: 'text-amber-500',
      glowColor: 'shadow-amber-500/50'
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div 
          className="text-center max-w-3xl mx-auto mb-20 opacity-0 translate-y-10 transition-all duration-700" 
          data-animate
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-6">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Your Path to Clear Skin</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <p className="text-xl text-slate-600 leading-relaxed">
            A scientifically-proven approach to achieving your best skin. 
            <span className="text-emerald-600 font-semibold"> Simple, effective, and personalized.</span>
          </p>
        </div>

        {/* Steps Grid - Enhanced Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-7xl mx-auto">
          {steps.map((item, index) => {
            const IconComponent = item.Icon;
            
            return (
              <div 
                key={index} 
                className="relative opacity-0 translate-y-10 transition-all duration-700 group"
                data-animate
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connecting Line - Redesigned */}
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-16 left-[calc(50%+3rem)] w-[calc(100%-6rem)] items-center justify-center z-0">
                    <div className="w-full h-[2px] bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200">
                      <div className="h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>
                    </div>
                    <div className="absolute right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                )}
                
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-slate-200 h-full">
                  
                  {/* Step Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg ${item.glowColor} group-hover:scale-110 transition-transform duration-300`}>
                      {item.step}
                    </div>
                  </div>
                  
                  {/* Icon Container - Glass Morphism Effect */}
                  <div className="relative mb-6 p-5">
                    <div 
                      className={`
                        relative inline-flex items-center justify-center 
                        w-20 h-20 rounded-2xl backdrop-blur-xl
                        ${item.iconBg}
                        border border-white/50
                        shadow-xl ${item.glowColor}
                        group-hover:scale-110 group-hover:rotate-3
                        transition-all duration-500
                      `}
                    >
                      <IconComponent className={`w-10 h-10 ${item.iconColor}`} strokeWidth={2} />
                      
                      {/* Animated ring */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Decorative dot */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${item.gradient} animate-pulse`}></div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-700 transition-all duration-300">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  
                  {/* Bottom decoration */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Stats Section */}
        <div 
          className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '600ms' }}
        >
          {[
            { value: '50K+', label: 'Happy Users', icon: CheckCircle },
            { value: '95%', label: 'Success Rate', icon: TrendingUp },
            { value: '3 Min', label: 'Quick Start', icon: Sparkles },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-3">
                <stat.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Premium Design */}
        <div 
          className="text-center mt-16 opacity-0 translate-y-10 transition-all duration-700" 
          data-animate
          style={{ transitionDelay: '700ms' }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 group">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Transform Your Skin?
              </h3>
              <p className="text-emerald-50">
                Join thousands who've achieved their skin goals
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/assessment')}
              rightIcon={<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              className="bg-white text-emerald-600 hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-xl font-bold px-8 py-4 whitespace-nowrap"
            >
              Start Free Assessment
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div 
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '800ms' }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>100% Private & Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Certified Dermatologists</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
