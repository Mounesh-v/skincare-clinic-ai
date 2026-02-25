import React from 'react';
import { 
  Award, 
  Users, 
  Heart, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Sparkles,
  Shield,
  Leaf,
  Star
} from 'lucide-react';

const About = () => {
  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '15+', label: 'Years Experience' },
    { value: '500+', label: 'Expert Doctors' },
    { value: '98%', label: 'Success Rate' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We prioritize your skin health and satisfaction above everything else.',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: '100% authentic products tested and certified by dermatologists.',
    },
    {
      icon: Leaf,
      title: 'Natural & Safe',
      description: 'Clean beauty formulations free from harmful chemicals.',
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Cutting-edge AI technology combined with proven skincare science.',
    },
  ];

  const team = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Chief Dermatologist',
      image: '/api/placeholder/300/300',
      bio: '15+ years of experience in cosmetic dermatology',
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Medical Director',
      image: '/api/placeholder/300/300',
      bio: 'Specialist in anti-aging treatments',
    },
    {
      name: 'Dr. Anita Desai',
      role: 'Trichology Expert',
      image: '/api/placeholder/300/300',
      bio: 'Leading expert in hair and scalp treatments',
    },
    {
      name: 'Dr. Vikram Singh',
      role: 'Research Head',
      image: '/api/placeholder/300/300',
      bio: 'PhD in Cosmetic Science & Innovation',
    },
  ];

  const milestones = [
    { year: '2010', title: 'Founded', description: 'Started with a vision to revolutionize skincare' },
    { year: '2015', title: '10K Customers', description: 'Reached our first major milestone' },
    { year: '2020', title: 'AI Integration', description: 'Launched AI-powered skin assessment' },
    { year: '2024', title: '50K+ Happy Users', description: 'Serving customers across India' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">About SkinCare AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Skin, Our Passion
            </h1>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Combining cutting-edge AI technology with dermatological expertise to deliver 
              personalized skincare solutions that work for you.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Founded in 2010, SkinCare AI was born from a simple belief: everyone deserves 
                  access to personalized, professional skincare guidance.
                </p>
                <p>
                  What started as a small dermatology clinic in Ludhiana has grown into a 
                  leading digital skincare platform, serving over 50,000 customers across India.
                </p>
                <p>
                  Our journey has been driven by innovation, combining the expertise of 
                  certified dermatologists with advanced AI technology to provide accurate 
                  skin assessments and personalized treatment plans.
                </p>
                <p>
                  Today, we continue to evolve, staying at the forefront of skincare science 
                  while maintaining our commitment to natural, safe, and effective solutions.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/api/placeholder/600/600" 
                  alt="Our Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-700 leading-relaxed">
                To democratize access to professional skincare by combining AI technology with 
                expert dermatological guidance, making personalized skincare solutions accessible 
                to everyone, everywhere.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-700 leading-relaxed">
                To become India's most trusted digital skincare platform, setting new standards 
                in personalized care through innovation, transparency, and unwavering commitment 
                to customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-200 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
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

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-slate-50 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600">
              Major milestones in our story
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="relative flex gap-6 items-start group"
                >
                  {/* Timeline line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-6 top-14 w-0.5 h-full bg-emerald-200"></div>
                  )}
                  
                  {/* Year badge */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200 group-hover:shadow-md group-hover:border-emerald-200 transition-all">
                    <div className="text-sm text-emerald-600 font-semibold mb-1">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-slate-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Experts
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Board-certified dermatologists dedicated to your skin health
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <div className="text-emerald-600 font-semibold mb-3">
                    {member.role}
                  </div>
                  <p className="text-slate-600 text-sm">
                    {member.bio}
                  </p>
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm text-slate-600 ml-2">5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-4">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SkinCare AI?
            </h2>
            <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
              The benefits that set us apart
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Award,
                title: 'Expert Approved',
                description: 'All products and recommendations verified by certified dermatologists',
              },
              {
                icon: Users,
                title: 'Personalized Care',
                description: 'AI-powered assessments tailored to your unique skin needs',
              },
              {
                icon: CheckCircle,
                title: 'Proven Results',
                description: '98% customer satisfaction rate with visible improvements',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-emerald-50">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Skin?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of happy customers who have discovered their perfect skincare routine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/assessment'}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg text-lg"
              >
                Start Free Assessment
              </button>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all text-lg"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;