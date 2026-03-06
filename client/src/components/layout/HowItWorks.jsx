import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Microscope,
  Sparkles, 
  Stethoscope, 
  Rocket, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Zap,
  Award,
  Star,
  Shield
} from 'lucide-react';
import Button from '../common/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';

/**
 * Award-Winning Premium How It Works Section
 * Enhanced with futuristic animations, particle effects, and professional design
 */
const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
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

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced steps data with better icons and colors
  const steps = [
    { 
      step: '1', 
      title: 'Smart Assessment', 
      desc: 'Answer personalized questions in just 3 minutes', 
      Icon: Microscope,
      gradient: 'from-emerald-400 via-teal-900 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-emerald-400/20 to-teal-500/20',
      iconColor: 'text-emerald-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400',
      stat: '3 min',
      statLabel: 'Quick & Easy'
    },
    { 
      step: '2', 
      title: 'AI-Powered Analysis', 
      desc: 'Get instant results using advanced algorithms', 
      Icon: Sparkles,
      gradient: 'from-emerald-400 via-teal-900 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-violet-400/20 to-purple-500/20',
     iconColor: 'text-emerald-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400',
      stat: '98%',
      statLabel: 'Accuracy'
    },
    { 
      step: '3', 
      title: 'Expert Consultation', 
      desc: 'Connect with certified dermatologists', 
      Icon: Stethoscope,
      gradient: 'from-emerald-400 via-teal-900 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
     iconColor: 'text-emerald-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400',
      stat: '500+',
      statLabel: 'Experts'
    },
    { 
      step: '4', 
      title: 'Transform Your Skin', 
      desc: 'Follow your customized treatment plan', 
      Icon: Rocket,
      gradient: 'from-emerald-400 via-teal-900 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-amber-400/20 to-orange-500/20',
      iconColor: 'text-emerald-500',
      glowColor: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400',
      stat: '2 weeks',
      statLabel: 'Results'
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
       {/* Futuristic Grid Background */}
<div className="absolute inset-0">
  {/* soft green → white base gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 via-emerald-100 to-white"></div>

  {/* light green grid overlay */}
  <div className="absolute inset-0 
    bg-[linear-gradient(to_right,rgba(16,185,129,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.25)_1px,transparent_1px)] 
    bg-[size:4rem_4rem] 
    [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]">
  </div>
</div>

{/* Animated Gradient Orbs with Parallax */}
<div
  className="absolute top-20 left-10 w-96 h-96 bg-emerald-300/30 rounded-full mix-blend-screen filter blur-3xl animate-float"
  style={{
    transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
  }}
></div>
<div
  className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/25 rounded-full mix-blend-screen filter blur-3xl animate-float-delayed"
  style={{
    transform: `translate(${-mousePosition.x * 40}px, ${mousePosition.y * 40}px)`
  }}
></div>
<div
  className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-200/25 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"
  style={{
    transform: `translate(${mousePosition.x * 35}px, ${-mousePosition.y * 35}px)`
  }}
></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-particle"
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
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan"></div>
      </div>
      
      <div className="container-custom relative z-10">
        
        {/* Section Header with Holographic Effect */}
        <div 
          className="text-center max-w-4xl mx-auto mb-12 md:mb-20 lg:mb-24 px-4 opacity-0 translate-y-10 transition-all duration-700" 
          data-animate
        >
          {/* Award Badge */}
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 backdrop-blur-xl rounded-full mb-4 md:mb-6 border border-amber-500/30 shadow-2xl shadow-amber-500/20 animate-glow">
            <Award className="h-4 w-4 md:h-5 md:w-5 text-amber-600 animate-spin-slow" />
            <span className="text-xs md:text-sm font-bold text-amber-600 tracking-wider">
              AWARD-WINNING PROCESS
            </span>
            <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-400 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-black mb-4 md:mb-6 relative">
            <span className="bg-gradient-to-r from-white via-cyan-600 to-white bg-clip-text text-transparent animate-gradient-x">
              How It Works
            </span>
            {/* Holographic shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed mb-6 md:mb-8 px-4">
            A scientifically-proven, AI-powered approach to achieving your best skin.
          </p>

          {/* Glowing Badge Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-full">
              <span className="text-xs md:text-sm font-semibold text-emerald-500">✓ Clinically Proven</span>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-violet-500/10 backdrop-blur-xl border border-violet-500/30 rounded-full">
              <span className="text-xs md:text-sm font-semibold text-blue-700">✓ AI-Powered</span>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 rounded-full">
              <span className="text-xs md:text-sm font-semibold text-rose-500">✓ Expert Approved</span>
            </div>
          </div>
        </div>

        {/* Interactive Steps Grid - Futuristic Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto mb-12 md:mb-20 px-4">
          {steps.map((item, index) => {
            const IconComponent = item.Icon;
            const isActive = activeStep === index;
            
            return (
              <div 
                key={index} 
                className="relative opacity-0 translate-y-10 transition-all duration-700 group"
                data-animate
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Connecting Data Stream - Hidden on mobile */}
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-20 left-[calc(50%+3rem)] w-[calc(100%-6rem)] items-center justify-center z-0">
                    <div className="relative w-full h-[2px]">
                      {/* Base line */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
                      {/* Animated data stream */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} animate-data-flow`}></div>
                      {/* Flowing particles */}
                      <div className="absolute right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow"></div>
                      <div className={`absolute right-4 w-1 h-1 ${item.particleColor} rounded-full animate-flow`}></div>
                    </div>
                  </div>
                )}
                
                {/* Futuristic Card */}
                <div className={`
                  relative bg-gradient-to-br from-slate-100/50 to-slate-100/50 
                  backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 
                  border transition-all duration-500 h-full
                  ${isActive 
                    ? `border-cyan-500/50 shadow-2xl ${item.glowColor} scale-105` 
                    : 'border-slate-700/50 hover:border-slate-600/50 shadow-xl'
                  }
                `}>
                  
                  {/* Holographic Corner Accents */}
                  <div className="absolute top-0 left-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${item.gradient}`}></div>
                    <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b ${item.gradient}`}></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
                    <div className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l ${item.gradient}`}></div>
                    <div className={`absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t ${item.gradient}`}></div>
                  </div>

                  {/* Step Badge with Circuit Effect */}
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4">
                    <div className={`
                      relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} 
                      flex items-center justify-center text-white font-black text-sm md:text-base lg:text-lg 
                      shadow-2xl ${item.glowColor}
                      ${isActive ? 'scale-110 animate-pulse-glow' : ''}
                      transition-all duration-300
                    `}>
                      {item.step}
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
                  <div className="relative mb-4 md:mb-6 lg:mb-8">
                    <div 
                      className={`
                        relative inline-flex items-center justify-center 
                        w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl backdrop-blur-xl
                        ${item.iconBg}
                        border-2 ${isActive ? 'border-cyan-400/50' : 'border-white/10'}
                        shadow-2xl ${item.glowColor}
                        transition-all duration-500
                        ${isActive ? 'scale-110 rotate-6' : 'group-hover:scale-110 group-hover:rotate-3'}
                        perspective-1000 transform-gpu
                      `}
                    >
                      <IconComponent 
                        className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${item.iconColor} relative z-10`} 
                        strokeWidth={2.5} 
                      />
                      
                      {/* Inner glow */}
                      <div className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} opacity-20 blur-xl`}></div>
                      
                      {/* Animated ring */}
                      <div className={`
                        absolute inset-0 rounded-xl md:rounded-2xl 
                        bg-gradient-to-br from-white/20 to-transparent 
                        ${isActive ? 'opacity-100 animate-pulse-ring' : 'opacity-0'}
                        transition-opacity duration-500
                      `}></div>

                      {/* Orbiting particles - Hidden on mobile for performance */}
                      {isActive && (
                        <>
                          <div className={`hidden md:block absolute top-0 left-1/2 w-2 h-2 ${item.particleColor} rounded-full animate-orbit`}></div>
                          <div className={`hidden md:block absolute top-1/2 right-0 w-1.5 h-1.5 ${item.particleColor} rounded-full animate-orbit-delayed`}></div>
                        </>
                      )}
                    </div>
                    
                    {/* Energy field effect */}
                    {isActive && (
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient}`}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content with Scan Effect */}
                  <div className="space-y-2 md:space-y-3 lg:space-y-4 relative">
                    <h3 className={`
                      text-lg md:text-xl lg:text-2xl font-black transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` 
                        : 'text-white group-hover:text-cyan-300'
                      }
                    `}>
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                      {item.desc}
                    </p>

                    {/* Stat Display */}
                    <div className={`
                      flex items-center justify-between pt-3 md:pt-4 border-t 
                      ${isActive ? 'border-cyan-500/30' : 'border-slate-700/50'}
                      transition-colors duration-300
                    `}>
                      <div>
                        <div className={`text-2xl md:text-3xl font-black ${isActive ? 'text-cyan-400' : 'text-white'} transition-colors`}>
                          {item.stat}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          {item.statLabel}
                        </div>
                      </div>
                      <Zap className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-yellow-400 animate-pulse' : 'text-slate-600'} transition-all`} />
                    </div>
                  </div>
                  
                  {/* Bottom glow line */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 
                    bg-gradient-to-r ${item.gradient} rounded-b-2xl md:rounded-b-3xl
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                    transition-opacity duration-500
                  `}></div>

                  {/* Scan line effect - Hidden on mobile for performance */}
                  {isActive && (
                    <div className="hidden md:block absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl pointer-events-none">
                      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-vertical"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Stats Dashboard */}
        <div 
          className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '600ms' }}
        >
          {[
            { value: '50K+', label: 'Happy Users', icon: CheckCircle, color: 'emerald' },
            { value: '95%', label: 'Success Rate', icon: TrendingUp, color: 'violet' },
            { value: '24/7', label: 'Support', icon: Shield, color: 'rose' },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-slate-100/50 to-slate-200/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-6 md:p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/30 mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 md:w-8 md:h-8 text-${stat.color}-400`} />
                </div>
                
                {/* Value with counter animation */}
                <div className={`text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-400 via-cyan-300 to-white bg-clip-text text-transparent mb-1 md:mb-2`}>
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="text-xs md:text-sm text-slate-400 font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-${stat.color}-500/0 to-${stat.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Futuristic CTA Section */}
        <div 
          className="text-center mt-12 md:mt-20 lg:mt-24 px-4 opacity-0 translate-y-10 transition-all duration-700" 
          data-animate
          style={{ transitionDelay: '700ms' }}
        >
          <div className="relative inline-block w-full max-w-4xl">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-2xl md:rounded-3xl blur-2xl opacity-50 animate-pulse-slow"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-6 md:p-8 lg:p-10 bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-cyan-500/30 shadow-2xl group hover:scale-105 transition-all duration-500">
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span>Ready to Transform Your Skin?</span>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-cyan-200 text-sm md:text-base lg:text-lg">
                  Join 50,000+ users who've achieved their skin goals
                </p>
              </div>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/assessment')}
                rightIcon={<ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />}
                className="relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-2xl shadow-emerald-500/50 font-black px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 text-sm md:text-base lg:text-lg whitespace-nowrap overflow-hidden group"
              >
                <span className="relative z-10">Start Free Assessment</span>
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators with Icons */}
        <div 
          className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-6 lg:gap-8 px-4 opacity-0 translate-y-10 transition-all duration-700"
          data-animate
          style={{ transitionDelay: '800ms' }}
        >
          {[
            { icon: CheckCircle, text: 'No credit card required' },
            { icon: Shield, text: '100% Private & Secure' },
            { icon: Award, text: 'Certified Dermatologists' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-slate-800/50 backdrop-blur-xl rounded-full border border-slate-700/50">
              <item.icon className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              <span className="text-xs md:text-sm text-slate-300 font-medium">{item.text}</span>
            </div>
          ))}
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
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); }
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

        @keyframes data-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes flow {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100px); opacity: 0; }
        }

        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
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
        .animate-data-flow { animation: data-flow 2s linear infinite; }
        .animate-flow { animation: flow 3s linear infinite; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .animate-orbit { animation: orbit 4s linear infinite; }
        .animate-orbit-delayed { animation: orbit-delayed 4s linear infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }

        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .perspective-1000 { perspective: 1000px; }
        .transform-gpu { transform: translateZ(0); }
      `}</style>
    </section>
  );
};

export default HowItWorks;