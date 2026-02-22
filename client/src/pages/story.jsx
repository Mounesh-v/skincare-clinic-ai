import React from 'react';
import { 
  Sparkles, 
  Heart, 
  Users, 
  Award,
  TrendingUp,
  Target,
  Lightbulb,
  Globe,
  Star
} from 'lucide-react';

const Story = () => {
  const timeline = [
    {
      year: '2010',
      title: 'The Beginning',
      description: 'Founded by Dr. Priya Sharma with a vision to make professional skincare accessible to everyone.',
      image: '/api/placeholder/600/400',
      highlight: 'Started in a small clinic in Ludhiana',
    },
    {
      year: '2012',
      title: 'First Milestone',
      description: 'Reached 1,000 happy customers and expanded our dermatology team to 5 certified doctors.',
      image: '/api/placeholder/600/400',
      highlight: 'Opened 2 new clinics',
    },
    {
      year: '2015',
      title: 'Going Digital',
      description: 'Launched our first online consultation platform, making skincare advice accessible from anywhere.',
      image: '/api/placeholder/600/400',
      highlight: 'Served 10,000+ customers online',
    },
    {
      year: '2018',
      title: 'Product Line Launch',
      description: 'Introduced our own line of dermatologist-approved skincare products formulated with natural ingredients.',
      image: '/api/placeholder/600/400',
      highlight: '50+ products developed',
    },
    {
      year: '2020',
      title: 'AI Innovation',
      description: 'Integrated AI-powered skin assessment technology, revolutionizing personalized skincare recommendations.',
      image: '/api/placeholder/600/400',
      highlight: '98% accuracy in skin analysis',
    },
    {
      year: '2024',
      title: 'Leading the Industry',
      description: 'Became one of India\'s most trusted digital skincare platforms with 50,000+ active users and 500+ partnered doctors.',
      image: '/api/placeholder/600/400',
      highlight: 'Expanding to 50+ cities',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'Driven by a genuine passion for helping people achieve healthy, confident skin.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Constantly evolving with the latest technology and skincare science.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive community of skincare enthusiasts and experts.',
    },
    {
      icon: Target,
      title: 'Results',
      description: 'Committed to delivering visible, measurable results for every customer.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              From Vision to Reality
            </h1>
            <p className="text-xl text-emerald-50 leading-relaxed">
              The journey of how a small dermatology clinic became India's trusted 
              digital skincare platform
            </p>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              It all started in 2010 with a simple observation: <span className="font-semibold text-emerald-600">
              quality skincare advice was accessible only to those who could afford expensive consultations.</span> 
              Dr. Priya Sharma, a young dermatologist fresh out of medical school, wanted to change that.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              What began as a modest clinic in Ludhiana, Punjab, has transformed into a 
              revolutionary platform that combines cutting-edge AI technology with expert 
              dermatological care, serving over 50,000 customers across India.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-slate-50 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Journey Through The Years
            </h2>
            <p className="text-xl text-slate-600">
              Every milestone brought us closer to our vision
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {timeline.map((item, index) => (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 mb-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot and line */}
                <div className="hidden md:block absolute left-1/2 top-8 w-0.5 h-full bg-emerald-200 -translate-x-1/2"></div>
                
                {/* Year badge */}
                <div className="md:w-1/2 flex justify-center md:justify-end pr-8">
                  <div className="relative">
                    <div className="inline-block">
                      <div className="text-6xl font-bold text-emerald-600 opacity-20">
                        {item.year}
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div className="md:w-1/2 pl-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className="mb-4">
                      <img 
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {item.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
                      <Star className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        {item.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/api/placeholder/200/200"
                  alt="Dr. Priya Sharma"
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                />
              </div>
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Dr. Priya Sharma
                  </h3>
                  <p className="text-emerald-600 font-semibold">
                    Founder & Chief Dermatologist
                  </p>
                </div>
                <blockquote className="text-lg text-slate-700 italic border-l-4 border-emerald-500 pl-4">
                  "When I started this journey, I had one simple goal: make quality skincare 
                  accessible to everyone. Today, seeing thousands of people gain confidence 
                  through healthy skin makes every challenge worth it. We're not just treating 
                  skin – we're changing lives."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The core values that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact Today
            </h2>
            <p className="text-xl text-emerald-50">
              Numbers that tell our story
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '500+', label: 'Expert Doctors' },
              { value: '50+', label: 'Cities Covered' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-emerald-50 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Looking Forward */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl text-center">
          <Globe className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            The Journey Continues
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            While we're proud of how far we've come, we're even more excited about where 
            we're going. Our vision is to make professional skincare accessible to every 
            Indian household, combining technology, expertise, and compassion to transform 
            millions of lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/about'}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
            >
              Learn More About Us
            </button>
            <button 
              onClick={() => window.location.href = '/assessment'}
              className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Story;