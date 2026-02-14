import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Star,
  Clock,
  Languages,
  DollarSign,
  UserCheck,
  UserX,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - Replace with actual API call
  const [doctor] = useState({
    id: 'DOC-001',
    name: 'Dr. Priya Sharma',
    image: '/api/placeholder/200/200',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '15 years',
    rating: 4.9,
    totalReviews: 1250,
    consultations: 1250,
    status: 'Active',
    email: 'priya.sharma@clinic.com',
    phone: '+91 98765 43210',
    location: 'Ludhiana, Punjab',
    availability: 'Mon-Sat (10:00 AM - 6:00 PM)',
    languages: ['English', 'Hindi', 'Punjabi'],
    consultationFee: 1500,
    joinedDate: '2020-03-15',
    lastActive: '2 hours ago',
    bio: 'Dr. Priya Sharma is a highly experienced dermatologist with over 15 years of expertise in treating various skin conditions. She specializes in acne treatment, anti-aging procedures, and cosmetic dermatology. Her approach combines evidence-based medicine with personalized care for optimal results.',
    education: [
      {
        degree: 'MBBS',
        institution: 'AIIMS, New Delhi',
        year: '2005'
      },
      {
        degree: 'MD (Dermatology)',
        institution: 'PGI, Chandigarh',
        year: '2009'
      },
      {
        degree: 'Fellowship in Cosmetic Dermatology',
        institution: 'Harvard Medical School, USA',
        year: '2012'
      }
    ],
    specialties: [
      'Acne & Acne Scars',
      'Anti-Aging Treatments',
      'Laser Therapy',
      'Chemical Peels',
      'Skin Rejuvenation',
      'Hair Transplant',
      'Pigmentation Treatment',
      'Cosmetic Dermatology'
    ],
    achievements: [
      'Best Dermatologist Award 2023',
      'Excellence in Cosmetic Dermatology 2022',
      'Published 15+ research papers',
      'Speaker at International Dermatology Conference'
    ],
    recentConsultations: [
      {
        id: 'CON-789',
        patient: 'Rahul Kumar',
        concern: 'Acne Treatment',
        date: '2024-02-06',
        status: 'Completed'
      },
      {
        id: 'CON-788',
        patient: 'Anita Desai',
        concern: 'Anti-Aging Consultation',
        date: '2024-02-06',
        status: 'Completed'
      },
      {
        id: 'CON-787',
        patient: 'Vikram Singh',
        concern: 'Hair Loss Treatment',
        date: '2024-02-05',
        status: 'Completed'
      }
    ],
    reviews: [
      {
        patient: 'Neha Patel',
        rating: 5,
        comment: 'Excellent doctor! Very professional and caring. My skin has improved significantly.',
        date: '2024-02-05'
      },
      {
        patient: 'Amit Sharma',
        rating: 5,
        comment: 'Best dermatologist I have consulted. Highly recommended!',
        date: '2024-02-04'
      },
      {
        patient: 'Pooja Singh',
        rating: 4,
        comment: 'Very knowledgeable and explains treatment options clearly.',
        date: '2024-02-03'
      }
    ]
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      toast.success('Doctor deleted successfully');
      navigate('/admin/doctors');
    }
  };

  const handleToggleStatus = () => {
    toast.success(`Doctor ${doctor.status === 'Active' ? 'deactivated' : 'activated'} successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/doctors')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Doctors</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/doctors/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span className="font-medium">Edit</span>
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              doctor.status === 'Active'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {doctor.status === 'Active' ? (
              <>
                <UserX className="w-4 h-4" />
                <span className="font-medium">Deactivate</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span className="font-medium">Activate</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-6">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-32 h-32 rounded-xl object-cover border-4 border-emerald-100"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{doctor.name}</h1>
                    <p className="text-lg text-emerald-600 font-semibold mb-2">{doctor.specialization}</p>
                    <p className="text-slate-600 mb-3">{doctor.qualification}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    doctor.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {doctor.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-slate-900">{doctor.rating}</span>
                    <span className="text-slate-500">({doctor.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{doctor.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Consultations</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{doctor.consultations}</p>
                </div>
                <div className="text-3xl">👨‍⚕️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Consultation Fee</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">₹{doctor.consultationFee}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{doctor.rating} ⭐</p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-slate-700 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Education</h2>
            <div className="space-y-3">
              {doctor.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Award className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{edu.degree}</p>
                    <p className="text-sm text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-500">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Achievements & Awards</h2>
            <ul className="space-y-2">
              {doctor.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <span className="text-yellow-500 mt-0.5">🏆</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {doctor.reviews.map((review, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{review.patient}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm mb-2">{review.comment}</p>
                  <p className="text-xs text-slate-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-sm">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-sm">{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-sm">{doctor.location}</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Availability</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-700">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <span className="text-sm">{doctor.availability}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <Languages className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {doctor.languages.map((lang, index) => (
                    <span key={index} className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Doctor ID</p>
                <p className="font-mono font-semibold text-slate-900">{doctor.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Joined Date</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{doctor.joinedDate}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Last Active</p>
                <p className="text-sm text-slate-900">{doctor.lastActive}</p>
              </div>
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Consultations</h2>
            <div className="space-y-3">
              {doctor.recentConsultations.map((consultation, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-slate-900 text-sm">{consultation.patient}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      {consultation.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{consultation.concern}</p>
                  <p className="text-xs text-slate-500">{consultation.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;