
import React, { useEffect, useRef,useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Star, Play,
  Users, Award, TrendingUp, Shield, Sparkles, Heart
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HowItWorks from '../components/layout/HowItWorks';
import WhyTakeTest from '../components/layout/WhyTaketest';
import ProductShowcase from '../components/layout/ProductShowcase.jsx';
import SpecialOffersBanner from '../components/layout/SpecialOffersBanner.jsx';

function HomePage() {
  return (
    <div>
      <HeroSection />
      
      {/* Add banner anywhere */}
      <SpecialOffersBanner />
      
      <ProductShowcase />
      <HowItWorks />
    </div>
  );
}


import heroImage from '../assets/heroImage.jpg';
import beforeImage from '../assets/beforeimage.jpg';
import afterImage from '../assets/afterImage.jpg';
import bgPattern from '../assets/hero2.jpg';
import beforeImage2 from '../assets/beforeImage2.jpg';
import afterImage2 from '../assets/afterImage2.jpg';
  // At the top of your file
import ctaBg from '../assets/hero3.jpg';


import { ClipboardList, Brain, UserCheck } from 'lucide-react';



/**

 * Focus on quiz/assessment CTA with social proof
 */
const TrayaStyleHome = () => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState(false);

  return (
    <div className="min-h-screen ">
      
      {/* Hero Section - Strong CTA for Quiz */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-200 via-white to-teal-50 py-10 md:py-2">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-12 animate-fadeIn p-8">
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
                  variant=""
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="shadow-xl shadow-primary-500/30 bg-green-200 "
                >
                  Take FREE Skin Test
                </Button>
                <Button
                  variant=""
                  size="lg"
                  onClick={() => setPlayingVideo(true)}
                  leftIcon={<Play className="h-5 w-5" />}
                  className="shadow-xl shadow-primary-500/30 bg-green-200 "
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
            <div className="relative animate-float p-1">
              {/* Main Image Container */}
            


<div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
  <div className="aspect-[4/5] bg-gradient-to-br from-primary-400 to-secondary-100">
    <img 
      src={heroImage} 
      alt="Start Your Journey"
      className="w-full h-full object-cover"
    />
    {/* Optional overlay with text */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent flex items-end pb-13">
      <div className="text-center text-white p-8 w-full">
        <h3 className="text-2xl font-bold mb-2">Start Your Journey</h3>
        <p className="text-white/90">Personalized care backed by science</p>
      </div>
    </div>
  </div>
</div>

              {/* Floating Success Card */}
              <div className="absolute -bottom-3 -left-1 bg-white rounded-2xl shadow-xl p-2  max-w-xs animate-slideRight">
                <div className="flex items-center gap-3 mb-2 ">
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
              <div className="absolute -top-3 -right-1 bg-white rounded-2xl shadow-2xl p-4 animate-slideRight" style={{animationDelay: '0.7s'}}>
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

      {/* Social Proof Bar - Enhanced */}
<section className="relative py-16 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-y border-slate-100 overflow-hidden">
  {/* Subtle background pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }}></div>
  </div>

  <div className="container-custom relative z-10">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
      {/* Stat 1 - Happy Patients */}
      <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-emerald-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Users className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
        </div>
        <p className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          50,000+
        </p>
        <p className="text-sm font-medium text-slate-600">
          Happy Patients
        </p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Stat 2 - Expert Doctors */}
      <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Award className="w-7 h-7 text-blue-600" strokeWidth={2.5} />
        </div>
        <p className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          100+
        </p>
        <p className="text-sm font-medium text-slate-600">
          Expert Doctors
        </p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Stat 3 - Success Rate */}
      <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-violet-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <TrendingUp className="w-7 h-7 text-violet-600" strokeWidth={2.5} />
        </div>
        <p className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
          93%
        </p>
        <p className="text-sm font-medium text-slate-600">
          Success Rate
        </p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Stat 4 - Rating (New) */}
      <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-amber-50 border-2 border-transparent hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Star className="w-7 h-7 text-amber-600" strokeWidth={2.5} />
        </div>
        <p className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          4.9/5
        </p>
        <p className="text-sm font-medium text-slate-600">
          Average Rating
        </p>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>

    {/* Trust Badge */}
    <div className="text-center mt-12">
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-medium text-slate-700">
          Trusted by thousands of satisfied customers
        </span>
        <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
      </div>
    </div>
  </div>
</section>

    <SpecialOffersBanner />

   {/* Why Take Test Section */}
      <WhyTakeTest />


      {/* Before/After Section */}
<section className="py-20 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-70">
    <div 
    className="absolute inset-0 bg-cover bg-center" 
    style={{
      backgroundImage: `url(${bgPattern})`,
    }}
  ></div>
  </div>

  {/* Decorative Circles */}
  <div className="absolute top-10 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl"></div>

  <div className="container-custom relative z-10">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
        Real Results from Real People
      </h2>
      <p className="text-lg text-slate-600">
        See how our personalized treatment approach helped thousands achieve their skin goals
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Your cards here */}
      
 {/* Before/After Card 1 */}
          


<Card className="overflow-hidden">
  <div className="grid grid-cols-2 gap-px bg-slate-300">
    {/* BEFORE Image */}
    <div className="aspect-square bg-slate-100 relative overflow-hidden group">
      <img 
        src={beforeImage}
        alt="Before treatment"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback to emoji if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback emoji (hidden by default) */}
      <div className="absolute inset-0 items-center justify-center text-center p-6" style={{display: 'none'}}>
        <p className="text-4xl mb-2">😔</p>
      </div>
      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-sm font-semibold text-white text-center">BEFORE</p>
      </div>
    </div>

    {/* AFTER Image */}
    <div className="aspect-square bg-slate-100 relative overflow-hidden group">
      <img 
        src={afterImage}
        alt="After 60 days treatment"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback to emoji if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback emoji (hidden by default) */}
      <div className="absolute inset-0 items-center justify-center text-center p-6" style={{display: 'none'}}>
        <p className="text-4xl mb-2">😊</p>
      </div>
      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-4">
        <p className="text-sm font-semibold text-white text-center">AFTER 60 DAYS</p>
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
      "I struggled with acne for years. This personalized approach finally worked! My skin is clearer and I feel confident again."
    </p>
    <p className="font-semibold text-slate-900">Priya S., Mumbai</p>
    <p className="text-sm text-slate-600">Acne Treatment • 60 Days</p>
  </div>
</Card>

            {/* Before/After Card 2 */}
           <Card className="overflow-hidden">
  <div className="grid grid-cols-2 gap-px bg-slate-300">
    {/* BEFORE Image */}
    <div className="aspect-square bg-slate-100 relative overflow-hidden group">
      <img 
        src={beforeImage2}
        alt="Before treatment"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback to emoji if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback emoji (hidden by default) */}
      <div className="absolute inset-0 items-center justify-center text-center p-6" style={{display: 'none'}}>
        <p className="text-4xl mb-2">😔</p>
      </div>
      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-sm font-semibold text-white text-center">BEFORE</p>
      </div>
    </div>

    {/* AFTER Image */}
    <div className="aspect-square bg-slate-100 relative overflow-hidden group">
      <img 
        src={afterImage2}
        alt="After 60 days treatment"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          // Fallback to emoji if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback emoji (hidden by default) */}
      <div className="absolute inset-0 items-center justify-center text-center p-6" style={{display: 'none'}}>
        <p className="text-4xl mb-2">😊</p>
      </div>
      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-4">
        <p className="text-sm font-semibold text-white text-center">AFTER 60 DAYS</p>
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
   
"I struggled with pimple problems for years. This personalized approach finally worked! My skin is clearer and I feel confident again."
    </p>
    <p className="font-semibold text-slate-900">Laara, UK</p>
    <p className="text-sm text-slate-600">Pimple Treatment • 60 Days</p>
  </div>
</Card>

    </div>
  </div>
</section>



<ProductShowcase />




 {/* How It Works Section - Add this */}
<HowItWorks />




{/* Add this script at the bottom of your component or in a useEffect */}
<script dangerouslySetInnerHTML={{__html: `
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        entry.target.classList.add('opacity-100', 'translate-y-0');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
`}} />


     {/* Combined Guarantee + Final CTA Section */}
<section className="relative overflow-hidden">
  {/* Single Background Image for both sections */}
  <div 
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${ctaBg})` }}
  ></div>

  {/* Guarantee Section */}
  <div className="py-20 relative">
    {/* Light overlay for guarantee section */}
    <div className="absolute inset-0 bg-gradient-to-br from-green-40/95 via-emerald-30/90 to-teal-40/95"></div>
    
    <div className="container-custom relative z-10">
      <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border-2 border-green-200 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
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
  </div>

  {/* Final CTA Section */}
  <div className="py-20 relative">
    {/* Darker overlay for CTA section */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-secondary-600/85 to-primary-700/90"></div>

    <div className="container-custom text-center relative z-10">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
        Ready to Transform Your Skin?
      </h2>
      <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
        Join 50,000+ people who trusted us with their skin health. Take the first step today.
      </p>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => navigate('/assessment')}
        rightIcon={<ArrowRight className="h-5 w-5" />}
        className="shadow-2xl shadow-black/30 bg-white text-primary-600 hover:bg-slate-50"
      >
        Take Your FREE Skin Test
      </Button>
      <p className="text-sm text-white/80 mt-4">
        ⏱️ Takes only 3 minutes • 🔒 100% Confidential • ✅ No credit card required
      </p>
    </div>
  </div>
</section>
    </div>
  );
};

export default TrayaStyleHome;