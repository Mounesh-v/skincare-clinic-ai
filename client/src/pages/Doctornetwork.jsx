import React from 'react';
import { MapPin, Award, Calendar, Star, Users, Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorNetwork = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Award,
      title: 'Certified Experts',
      description: 'All doctors are board-certified dermatologists with years of experience',
    },
    {
      icon: Video,
      title: 'Virtual Consultations',
      description: 'Connect with doctors from the comfort of your home via video call',
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments at your convenience with our flexible scheduling',
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Get assistance anytime with our round-the-clock support team',
    },
  ];

  const doctors = [
    {
      name: 'Dr. Priya Sharma',
      specialization: 'Dermatologist',
      experience: '15 years',
      rating: 4.9,
      reviews: 1250,
      location: 'Ludhiana, Punjab',
      image: 'https://placehold.co/150x150/e8f5e9/2e7d32?text=Dr.+Priya',
      expertise: ['Acne Treatment', 'Anti-Aging', 'Cosmetic Dermatology'],
    },
    {
      name: 'Dr. Rajesh Kumar',
      specialization: 'Cosmetologist',
      experience: '12 years',
      rating: 4.8,
      reviews: 980,
      location: 'Chandigarh',
      image: 'https://placehold.co/150x150/e0f2fe/0369a1?text=Dr.+Rajesh',
      expertise: ['Laser Treatment', 'Chemical Peels', 'Skin Rejuvenation'],
    },
    {
      name: 'Dr. Anita Desai',
      specialization: 'Trichologist',
      experience: '10 years',
      rating: 4.7,
      reviews: 756,
      location: 'Delhi',
      image: 'https://placehold.co/150x150/fce7f3/9d174d?text=Dr.+Anita',
      expertise: ['Hair Loss', 'Scalp Treatment', 'Hair Transplant'],
    },
  ];

  const stats = [
    { value: '500+', label: 'Expert Doctors' },
    { value: '50K+', label: 'Consultations' },
    { value: '100+', label: 'Cities Covered' },
    { value: '4.8', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Doctor Network</h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Connect with certified dermatologists and skincare experts across India
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Expert Care, Personalized for You
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Our network comprises experienced dermatologists and skincare specialists who are dedicated
            to helping you achieve healthy, glowing skin. Get personalized treatment plans and expert
            guidance tailored to your unique skin needs.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200"
            >
              <p className="text-4xl font-bold text-emerald-600 mb-2">{stat.value}</p>
              <p className="text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Why Choose Our Network
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Doctors */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Featured Doctors
            </h2>
            <button
              onClick={() => navigate('/find-doctors')}
              className="px-6 py-2 border border-emerald-500 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all"
            >
              View All Doctors
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm mb-2">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-slate-900">{doctor.rating}</span>
                      <span>({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>{doctor.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Take Assessment</h4>
              <p className="text-slate-600 text-sm">
                Complete our AI-powered skin assessment to identify your concerns
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Choose Your Doctor</h4>
              <p className="text-slate-600 text-sm">
                Browse our network and select a doctor that matches your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Get Treatment Plan</h4>
              <p className="text-slate-600 text-sm">
                Receive personalized recommendations and start your journey to healthy skin
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            What Our Patients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Dr. Sharma helped me get rid of my stubborn acne. Her treatment plan was
                personalized and really effective!"
              </p>
              <p className="font-semibold text-slate-900">- Neha P.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "The virtual consultation was so convenient. Dr. Kumar explained everything
                clearly and I saw results in weeks!"
              </p>
              <p className="font-semibold text-slate-900">- Rahul S.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Professional, caring, and knowledgeable. The best skincare experience I've
                had. Highly recommend!"
              </p>
              <p className="font-semibold text-slate-900">- Priya M.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Skin?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Connect with our expert dermatologists and start your personalized skincare journey today
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/assessment')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
            >
              Start Assessment
            </button>
            <button
              onClick={() => navigate('/find-doctors')}
              className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Browse Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNetwork;