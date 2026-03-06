import React, { useEffect, useRef, useState } from 'react';
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
  CheckCircle2,
  Zap,
  Award,
  Star
} from 'lucide-react';
import Button from '../common/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * Award-Winning Futuristic Why Take Test Section
 * Matching emerald/green theme with HowItWorks section
 */
const WhyTakeTest = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  
  // Initialize scroll animations
  useScrollAnimation();

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-cycle active card
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced benefits data with emerald theme
  const benefits = [
    {
      icon: Target,
      emoji: '🎯',
      title: 'Identify Root Causes',
      description: 'Go beyond symptoms. Our AI analyzes stress, diet, sleep, hormones, and lifestyle patterns to find what\'s really triggering your skin issues.',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400',
      iconColor: 'text-emerald-500',
      features: ['Stress Analysis', 'Lifestyle Factors', 'Dietary Impact']
    },
    {
      icon: Stethoscope,
      emoji: '👨‍⚕️',
      title: 'Doctor-Approved Plans',
      description: 'Receive personalized treatment plans created and verified by board-certified dermatologists, not generic advice.',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-teal-400',
      iconColor: 'text-teal-500',
      features: ['Expert Review', 'Custom Treatments', 'Medical Grade']
    },
    {
      icon: TrendingUp,
      emoji: '📊',
      title: 'Track Your Progress',
      description: 'Monitor improvements with our intelligent dashboard, get regular check-ins, and adjust your plan based on real results.',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      glowColor: 'shadow-cyan-500/50',
      particleColor: 'bg-cyan-400',
      iconColor: 'text-cyan-500',
      features: ['Smart Dashboard', 'Weekly Updates', 'Plan Adjustments']
    },
  ];

  // Trust indicators
  const trustStats = [
    { icon: Users, value: '50K+', label: 'Tests Completed', color: 'emerald' },
    { icon: Clock, value: '3 Min', label: 'Quick & Easy', color: 'teal' },
    { icon: Shield, value: '100%', label: 'Private & Secure', color: 'cyan' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
    >
      {/* Futuristic Grid Background - Matching HowItWorks */}
      <div className="absolute inset-0">
        {/* soft green → white base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50 to-white"></div>

        {/* light green grid overlay */}
        <div className="absolute inset-0 
          bg-[linear-gradient(to_right,rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.15)_1px,transparent_1px)] 
          bg-[size:2rem_2rem] md:bg-[size:4rem_4rem] 
          [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]">
        </div>
      </div>

      {/* Animated Gradient Orbs with Parallax - Emerald Theme */}
      <div
        className="absolute top-10 md:top-20 left-5 md:left-10 w-48 h-48 md:w-96 md:h-96 bg-emerald-300/25 rounded-full mix-blend-multiply filter blur-3xl animate-float"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
        }}
      ></div>
      <div
        className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-48 h-48 md:w-96 md:h-96 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"
        style={{
          transform: `translate(${-mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-48 h-48 md:w-96 md:h-96 bg-cyan-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"
        style={{
          transform: `translate(${mousePosition.x * 18}px, ${-mousePosition.y * 18}px)`
        }}
      ></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scan"></div>
      </div>

      <div className="container-custom relative z-10">
        
        {/* Section Header with Holographic Effect */}
        <div 
          className="text-center max-w-4xl mx-auto mb-12 md:mb-20 lg:mb-24 px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
        >
          {/* Premium Badge - Emerald Theme */}
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-xl rounded-full mb-4 md:mb-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-glow">
            <Award className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 animate-spin-slow" />
            <span className="text-xs md:text-sm font-bold text-emerald-700 tracking-wider">
              AWARD-WINNING ASSESSMENT
            </span>
            <Star className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-black mb-4 md:mb-6 relative">
            <span className="bg-gradient-to-r from-slate-900 via-emerald-700 to-slate-900 bg-clip-text text-transparent animate-gradient-x">
              Why Take Our FREE Skin Test?
            </span>
            {/* Holographic shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent -skew-x-12 animate-shimmer"></div>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed mb-6 md:mb-8">
            Our <span className="font-bold text-emerald-600">AI-powered assessment</span> identifies your unique skin concerns in just
          </p>

          {/* Animated Time Badge - Emerald Theme */}
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-full border border-emerald-500/30 shadow-2xl">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 animate-pulse" />
            <span className="text-xl md:text-2xl font-black text-emerald-600">3 Minutes</span>
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-amber-500 animate-bounce" />
          </div>
        </div>

        {/* Benefits Grid - Futuristic Cards with Emerald Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto mb-12 md:mb-20 px-4">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            const isActive = activeCard === index;
            
            return (
              <div
                key={index}
                className="opacity-0 translate-y-10 transition-all duration-700"
                data-animate
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setActiveCard(index)}
              >
                <div className={`
                  relative h-full p-6 md:p-8 rounded-2xl md:rounded-3xl 
                  bg-gradient-to-br from-white/80 to-emerald-50/50
                  backdrop-blur-xl
                  border transition-all duration-500
                  ${isActive 
                    ? `border-emerald-500/50 shadow-2xl ${benefit.glowColor} scale-105` 
                    : 'border-emerald-200/30 hover:border-emerald-300/50 shadow-xl'
                  }
                  group cursor-pointer
                `}>
                  
                  {/* Holographic Corner Accents */}
                  <div className="absolute top-0 left-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${benefit.gradient}`}></div>
                    <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b ${benefit.gradient}`}></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
                    <div className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l ${benefit.gradient}`}></div>
                    <div className={`absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t ${benefit.gradient}`}></div>
                  </div>

                  {/* Floating Number Badge */}
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4">
                    <div className={`
                      relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${benefit.gradient} 
                      flex items-center justify-center text-white font-black text-sm md:text-base lg:text-lg 
                      shadow-2xl ${benefit.glowColor}
                      ${isActive ? 'scale-110 animate-pulse-glow' : ''}
                      transition-all duration-300
                    `}>
                      {index + 1}
                      {/* Circuit lines */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/2 w-[1px] h-2 bg-white"></div>
                        <div className="absolute bottom-0 left-1/2 w-[1px] h-2 bg-white"></div>
                        <div className="absolute left-0 top-1/2 w-2 h-[1px] bg-white"></div>
                        <div className="absolute right-0 top-1/2 w-2 h-[1px] bg-white"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 3D Icon Container with Particles */}
                  <div className="relative mb-6 md:mb-8">
                    <div 
                      className={`
                        relative inline-flex items-center justify-center 
                        w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl backdrop-blur-xl
                        bg-gradient-to-br from-emerald-100/50 to-teal-100/50
                        border-2 ${isActive ? 'border-emerald-400/50' : 'border-emerald-200/30'}
                        shadow-2xl ${benefit.glowColor}
                        transition-all duration-500
                        ${isActive ? 'scale-110 rotate-6' : 'group-hover:scale-110 group-hover:rotate-3'}
                        perspective-1000 transform-gpu
                      `}
                    >
                      <IconComponent 
                        className={`w-10 h-10 md:w-12 md:h-12 ${benefit.iconColor} relative z-10`} 
                        strokeWidth={2.5} 
                      />
                      
                      {/* Inner glow */}
                      <div className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-20 blur-xl`}></div>
                      
                      {/* Animated ring */}
                      <div className={`
                        absolute inset-0 rounded-xl md:rounded-2xl 
                        bg-gradient-to-br from-white/20 to-transparent 
                        ${isActive ? 'opacity-100 animate-pulse-ring' : 'opacity-0'}
                        transition-opacity duration-500
                      `}></div>

                      {/* Orbiting particles - Hidden on mobile */}
                      {isActive && (
                        <>
                          <div className={`hidden md:block absolute top-0 left-1/2 w-2 h-2 ${benefit.particleColor} rounded-full animate-orbit`}></div>
                          <div className={`hidden md:block absolute top-1/2 right-0 w-1.5 h-1.5 ${benefit.particleColor} rounded-full animate-orbit-delayed`}></div>
                        </>
                      )}
                    </div>
                    
                    {/* Floating emoji with 3D effect */}
                    <div className={`
                      absolute -top-2 -right-2 text-3xl md:text-4xl 
                      ${isActive ? 'animate-float-emoji scale-110' : 'animate-bounce-slow'}
                      transition-all duration-300
                      drop-shadow-2xl
                    `}>
                      {benefit.emoji}
                    </div>

                    {/* Energy field effect */}
                    {isActive && (
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-gradient-to-br ${benefit.gradient}`}></div>
                      </div>
                    )}
                  </div>

                  {/* Content with Scan Effect */}
                  <div className="space-y-3 md:space-y-4 relative">
                    <h3 className={`
                      text-xl md:text-2xl font-black transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent` 
                        : 'text-slate-900 group-hover:text-emerald-600'
                      }
                    `}>
                      {benefit.title}
                    </h3>
                    
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 pt-3 md:pt-4">
                      {benefit.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 
                            bg-white/80 backdrop-blur-sm text-xs font-semibold 
                            rounded-full border transition-all duration-300
                            ${isActive 
                              ? 'border-emerald-500/50 text-emerald-700' 
                              : 'border-emerald-200/50 text-slate-600'
                            }
                          `}
                        >
                          <CheckCircle2 className={`h-3 w-3 ${isActive ? 'text-emerald-600' : benefit.iconColor}`} />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom glow line */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 
                    bg-gradient-to-r ${benefit.gradient} rounded-b-2xl md:rounded-b-3xl
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                    transition-opacity duration-500
                  `}></div>

                  {/* Scan line effect - Hidden on mobile */}
                  {isActive && (
                    <div className="hidden md:block absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl pointer-events-none">
                      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-vertical"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Futuristic Stats Bar - Emerald Theme */}
        <div 
          className="max-w-5xl mx-auto mb-12 md:mb-20 px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '450ms' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 p-6 md:p-8 bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-xl rounded-2xl border border-emerald-200/30 shadow-xl">
            {trustStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/30 mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 md:w-8 md:h-8 text-${stat.color}-600`} />
                  </div>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1 md:mb-2 animate-gradient-x">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Futuristic CTA Section - Emerald Theme */}
        <div 
          className="text-center px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '600ms' }}
        >
          <div className="relative inline-block w-full max-w-3xl mx-auto">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl md:rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
            
            <div className="relative flex flex-col items-center gap-4 md:gap-6 p-6 md:p-10 bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-emerald-500/30 shadow-2xl">
              
              {/* Premium badge */}
              <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full animate-glow">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 animate-pulse" />
                <span className="text-xs md:text-sm font-bold text-emerald-300">100% Free • No Credit Card Required</span>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 md:mb-3 flex flex-wrap items-center justify-center gap-2">
                  <span>Ready to Discover Your Skin's Story?</span>
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-sm md:text-base lg:text-lg text-slate-300">
                  Join <span className="text-emerald-400 font-bold">50,000+</span> people who've transformed their skin
                </p>
              </div>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/assessment')}
                rightIcon={<ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />}
                className="relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-2xl shadow-emerald-500/50 font-black px-8 md:px-12 py-4 md:py-6 text-base md:text-lg lg:text-xl whitespace-nowrap overflow-hidden group"
              >
                <span className="relative z-10">Start Your FREE Skin Test Now</span>
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
              </Button>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Takes only 3 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Science-backed results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Instant personalized plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof with Avatars */}
        <div 
          className="text-center mt-8 md:mt-12 px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '700ms' }}
        >
          <div className="inline-flex flex-col items-center gap-3 md:gap-4">
            <div className="flex -space-x-2 md:-space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${
                    i === 0 ? 'from-emerald-400 to-teal-500' :
                    i === 1 ? 'from-teal-400 to-cyan-500' :
                    i === 2 ? 'from-cyan-400 to-blue-500' :
                    i === 3 ? 'from-emerald-500 to-teal-600' :
                    'from-teal-500 to-cyan-600'
                  } border-3 md:border-4 border-white flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-xl animate-bounce-slow`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {i === 4 ? '5K+' : ''}
                </div>
              ))}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">
              <span className="text-slate-900 font-bold text-base md:text-lg">50,000+</span> people took the test this month
            </p>
          </div>
        </div>
      </div>

      {/* Custom Keyframe Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes scan-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          50% { transform: translateX(100%) skewX(-12deg); }
          100% { transform: translateX(100%) skewX(-12deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 40px currentColor; }
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0; }
        }

        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }

        @keyframes orbit-delayed {
          0% { transform: rotate(120deg) translateX(35px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(35px) rotate(-480deg); }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-emoji {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-particle { animation: particle linear infinite; }
        .animate-scan { animation: scan 8s linear infinite; }
        .animate-scan-vertical { animation: scan-vertical 3s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        .animate-shine { animation: shine 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .animate-orbit { animation: orbit 4s linear infinite; }
        .animate-orbit-delayed { animation: orbit-delayed 4s linear infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-float-emoji { animation: float-emoji 3s ease-in-out infinite; }

        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform: translateZ(0); }
      `}</style>
    </section>
  );
};

export default WhyTakeTest;