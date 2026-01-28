import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Star, Play,
  Users, Award, TrendingUp, Shield, Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * Traya-Inspired Home Page
 * Focus on quiz/assessment CTA with social proof
 */
const TrayaStyleHome = () => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState(false);

  return (
    <div className="min-h-screen">
      
      {/* Hero Section - Strong CTA for Quiz */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>India's #1 AI-Powered Skin Care Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight">
                Healthier Skin Starts With Understanding
                <span className="text-primary-600"> Your Roots</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Take our FREE 3-minute skin test. Get doctor-approved personalized treatment plans 
                that target the root causes of your skin concerns.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 py-4">
                <div>
                  <p className="text-3xl font-bold text-slate-900">50,000+</p>
                  <p className="text-sm text-slate-600">Happy Patients</p>
                </div>
                <div className="h-12 w-px bg-slate-300" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">93%</p>
                  <p className="text-sm text-slate-600">Success Rate</p>
                </div>
                <div className="h-12 w-px bg-slate-300" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">4.8/5</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    Rating
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="shadow-xl shadow-primary-500/30"
                >
                  Take FREE Skin Test
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPlayingVideo(true)}
                  leftIcon={<Play className="h-5 w-5" />}
                >
                  Watch How It Works
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Doctor Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-float">
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
                <div className="aspect-[4/5] bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="text-8xl mb-4">🧑‍⚕️</div>
                    <h3 className="text-2xl font-bold mb-2">Start Your Journey</h3>
                    <p className="text-white/90">Personalized care backed by science</p>
                  </div>
                </div>
              </div>

              {/* Floating Success Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 max-w-xs animate-slideRight">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">93% Success Rate</p>
                    <p className="text-xs text-slate-600">Based on 50K+ treatments</p>
                  </div>
                </div>
              </div>

              {/* Floating Rating Card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-slideRight" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-900">4.8/5 from 15K+ reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-white border-y border-slate-200 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">50,000+</p>
                <p className="text-sm text-slate-600">Happy Patients</p>
              </div>
            </div>
            <div className="hidden md:block h-12 w-px bg-slate-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">100+</p>
                <p className="text-sm text-slate-600">Expert Doctors</p>
              </div>
            </div>
            <div className="hidden md:block h-12 w-px bg-slate-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">93%</p>
                <p className="text-sm text-slate-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Take Our Test Section */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Why Take Our FREE Skin Test?
            </h2>
            <p className="text-lg text-slate-600">
              Our AI-powered assessment identifies your unique skin concerns and root causes in just 3 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card hoverable className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Identify Root Causes
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Go beyond symptoms. Our test analyzes stress, diet, sleep, and lifestyle to find what's really causing your skin issues.
              </p>
            </Card>

            <Card hoverable className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Doctor-Approved Plans
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get personalized treatment plans verified by certified dermatologists, not generic recommendations.
              </p>
            </Card>

            <Card hoverable className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Track Your Progress
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor improvements with our dashboard, get regular check-ins, and adjust your plan as needed.
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/assessment')}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Your FREE Skin Test Now
            </Button>
            <p className="text-sm text-slate-600 mt-3">Takes only 3 minutes • 50,000+ people tested</p>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Real Results from Real People
            </h2>
            <p className="text-lg text-slate-600">
              See how our personalized treatment approach helped thousands achieve their skin goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before/After Card 1 */}
            <Card className="overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-slate-300">
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-4xl mb-2">😔</p>
                    <p className="text-sm font-semibold text-slate-600">BEFORE</p>
                  </div>
                </div>
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-4xl mb-2">😊</p>
                    <p className="text-sm font-semibold text-green-600">AFTER 60 DAYS</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-3 italic">
                  "I struggled with acne for years. Traya's personalized approach finally worked! My skin is clearer and I feel confident again."
                </p>
                <p className="font-semibold text-slate-900">Priya S., Mumbai</p>
                <p className="text-sm text-slate-600">Acne Treatment • 60 Days</p>
              </div>
            </Card>

            {/* Before/After Card 2 */}
            <Card className="overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-slate-300">
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-4xl mb-2">😟</p>
                    <p className="text-sm font-semibold text-slate-600">BEFORE</p>
                  </div>
                </div>
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-4xl mb-2">✨</p>
                    <p className="text-sm font-semibold text-green-600">AFTER 90 DAYS</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-3 italic">
                  "The holistic approach really works. Not just topical creams, but diet and lifestyle changes too. My skin has never looked better!"
                </p>
                <p className="font-semibold text-slate-900">Rahul K., Delhi</p>
                <p className="text-sm text-slate-600">Pigmentation Treatment • 90 Days</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Your Journey to Better Skin
            </h2>
            <p className="text-lg text-white/90">
              Simple, scientific, and personalized - here's how we help you achieve your skin goals
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '1', title: 'Take Test', desc: '3-min assessment', icon: '📝' },
              { step: '2', title: 'Get Analysis', desc: 'AI-powered results', icon: '🤖' },
              { step: '3', title: 'Doctor Review', desc: 'Expert consultation', icon: '👨‍⚕️' },
              { step: '4', title: 'Start Treatment', desc: 'Personalized plan', icon: '✨' },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-white/30" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg mb-4 text-4xl">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/assessment')}
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="bg-white text-primary-600 hover:bg-slate-50"
            >
              Start Now - It's FREE
            </Button>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 bg-green-50">
        <div className="container-custom">
          <Card className="max-w-4xl mx-auto bg-white border-2 border-green-200">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-slate-900 mb-3">
                  100% Money-Back Guarantee
                </h3>
                <p className="text-lg text-slate-700 mb-4">
                  We're so confident in our treatment approach that if you don't see visible results, 
                  we'll refund your entire investment. No questions asked.
                </p>
                <Button variant="primary" onClick={() => navigate('/assessment')}>
                  Try Risk-Free Today
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join 50,000+ people who trusted us with their skin health. Take the first step today.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/assessment')}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="shadow-2xl shadow-primary-500/30"
          >
            Take Your FREE Skin Test
          </Button>
          <p className="text-sm text-slate-600 mt-4">
            ⏱️ Takes only 3 minutes • 🔒 100% Confidential • ✅ No credit card required
          </p>
        </div>
      </section>
    </div>
  );
};

export default TrayaStyleHome;