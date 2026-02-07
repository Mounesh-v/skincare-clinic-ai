import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Calendar,
  X,
  ChevronDown,
  Phone,
  Mail,
  Award,
  Briefcase,
  Users,
  Grid,
  Map as MapIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FindDoctors = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Mumbai, India');
  
  // Filter states
  const [filters, setFilters] = useState({
    specialization: 'all',
    availability: 'all',
    gender: 'all',
    experience: 'all',
    rating: 'all',
    priceRange: [0, 5000],
    consultationType: 'all'
  });

  // Sample doctor data
  const doctorsData = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: 12,
      rating: 4.8,
      reviews: 156,
      consultationFee: 1500,
      address: 'Apollo Clinic, Bandra West, Mumbai',
      location: { lat: 19.0596, lng: 72.8295 },
      availability: ['Mon', 'Wed', 'Fri', 'Sat'],
      nextAvailable: '2026-02-08',
      gender: 'Female',
      languages: ['English', 'Hindi', 'Marathi'],
      about: 'Specialist in acne treatment, skin rejuvenation, and laser therapy. 12+ years of experience treating complex skin conditions.',
      image: 'https://i.pravatar.cc/300?img=47',
      consultationType: ['In-clinic', 'Video'],
      featured: true,
      timeSlots: ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM']
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD, DNB',
      experience: 15,
      rating: 4.9,
      reviews: 203,
      consultationFee: 2000,
      address: 'Lilavati Hospital, Bandra West, Mumbai',
      location: { lat: 19.0563, lng: 72.8302 },
      availability: ['Mon', 'Tue', 'Thu', 'Sat'],
      nextAvailable: '2026-02-07',
      gender: 'Male',
      languages: ['English', 'Hindi', 'Tamil'],
      about: 'Expert in cosmetic dermatology, hair transplant, and anti-aging treatments. Gold medalist from AIIMS.',
      image: 'https://i.pravatar.cc/300?img=12',
      consultationType: ['In-clinic', 'Video', 'Home Visit'],
      featured: true,
      timeSlots: ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM']
    },
    {
      id: 3,
      name: 'Dr. Anjali Desai',
      specialization: 'Cosmetologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: 8,
      rating: 4.7,
      reviews: 98,
      consultationFee: 1200,
      address: 'Skin Clinic, Andheri East, Mumbai',
      location: { lat: 19.1136, lng: 72.8697 },
      availability: ['Tue', 'Wed', 'Fri', 'Sun'],
      nextAvailable: '2026-02-09',
      gender: 'Female',
      languages: ['English', 'Hindi', 'Gujarati'],
      about: 'Specializes in non-surgical facial treatments, chemical peels, and laser hair removal.',
      image: 'https://i.pravatar.cc/300?img=26',
      consultationType: ['In-clinic', 'Video'],
      featured: false,
      timeSlots: ['10:30 AM', '1:00 PM', '3:30 PM', '5:30 PM']
    },
    {
      id: 4,
      name: 'Dr. Suresh Menon',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD, FAAD',
      experience: 20,
      rating: 4.9,
      reviews: 312,
      consultationFee: 2500,
      address: 'Breach Candy Hospital, Mumbai',
      location: { lat: 18.9756, lng: 72.8066 },
      availability: ['Mon', 'Wed', 'Sat'],
      nextAvailable: '2026-02-10',
      gender: 'Male',
      languages: ['English', 'Hindi', 'Malayalam'],
      about: '20+ years of experience in treating psoriasis, eczema, and autoimmune skin disorders.',
      image: 'https://i.pravatar.cc/300?img=33',
      consultationType: ['In-clinic'],
      featured: true,
      timeSlots: ['9:30 AM', '12:00 PM', '4:00 PM']
    },
    {
      id: 5,
      name: 'Dr. Meera Nair',
      specialization: 'Aesthetic Physician',
      qualification: 'MBBS, MD (Aesthetics)',
      experience: 10,
      rating: 4.6,
      reviews: 127,
      consultationFee: 1800,
      address: 'Fortis Hospital, Mulund, Mumbai',
      location: { lat: 19.1727, lng: 72.9560 },
      availability: ['Mon', 'Tue', 'Thu', 'Fri'],
      nextAvailable: '2026-02-08',
      gender: 'Female',
      languages: ['English', 'Hindi'],
      about: 'Expert in Botox, fillers, thread lifts, and advanced skin rejuvenation techniques.',
      image: 'https://i.pravatar.cc/300?img=32',
      consultationType: ['In-clinic', 'Video'],
      featured: false,
      timeSlots: ['11:00 AM', '2:30 PM', '5:00 PM']
    },
  ];

  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);

  // Apply filters
  useEffect(() => {
    let result = doctorsData;

    // Search filter
    if (searchQuery) {
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Specialization filter
    if (filters.specialization !== 'all') {
      result = result.filter(doc => doc.specialization === filters.specialization);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      result = result.filter(doc => doc.gender === filters.gender);
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      result = result.filter(doc => doc.rating >= minRating);
    }

    // Experience filter
    if (filters.experience !== 'all') {
      const minExp = parseInt(filters.experience);
      result = result.filter(doc => doc.experience >= minExp);
    }

    // Price range filter
    result = result.filter(doc =>
      doc.consultationFee >= filters.priceRange[0] &&
      doc.consultationFee <= filters.priceRange[1]
    );

    // Consultation type filter
    if (filters.consultationType !== 'all') {
      result = result.filter(doc =>
        doc.consultationType.includes(filters.consultationType)
      );
    }

    setFilteredDoctors(result);
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Location */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 lg:w-64">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent flex-1 outline-none text-slate-700 placeholder-slate-400"
                placeholder="Enter location"
              />
            </div>

            {/* Search */}
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-slate-700 placeholder-slate-400"
                placeholder="Search doctors, specialization..."
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors lg:w-auto"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600">
            Found <span className="font-semibold text-slate-900">{filteredDoctors.length}</span> doctors in {location}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          )}

          {/* Doctor List or Map */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onViewDetails={() => setSelectedDoctor(doctor)}
                  />
                ))}
              </div>
            ) : (
              <MapView doctors={filteredDoctors} onMarkerClick={setSelectedDoctor} />
            )}
          </div>
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Filters</h3>
        <button
          onClick={() =>
            setFilters({
              specialization: 'all',
              availability: 'all',
              gender: 'all',
              experience: 'all',
              rating: 'all',
              priceRange: [0, 5000],
              consultationType: 'all'
            })
          }
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Specialization */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Specializations</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Cosmetologist">Cosmetologist</option>
            <option value="Aesthetic Physician">Aesthetic Physician</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Gender
          </label>
          <div className="flex gap-2">
            {['all', 'Male', 'Female'].map((gender) => (
              <button
                key={gender}
                onClick={() => setFilters({ ...filters, gender })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.gender === gender
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {gender === 'all' ? 'Any' : gender}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Minimum Experience
          </label>
          <select
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Any Experience</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
            <option value="15">15+ Years</option>
          </select>
        </div>

        {/* Consultation Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Consultation Type
          </label>
          <select
            value={filters.consultationType}
            onChange={(e) => setFilters({ ...filters, consultationType: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="In-clinic">In-clinic</option>
            <option value="Video">Video Consultation</option>
            <option value="Home Visit">Home Visit</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Consultation Fee: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      {/* Featured Badge */}
      {doctor.featured && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            <Award className="w-3 h-3" />
            Featured Doctor
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Doctor Image */}
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-24 h-24 rounded-xl object-cover border-2 border-emerald-500"
        />

        {/* Doctor Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{doctor.name}</h3>
          <p className="text-sm text-slate-600 mb-2">{doctor.specialization}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md">
              <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{doctor.rating}</span>
            </div>
            <span className="text-sm text-slate-500">({doctor.reviews} reviews)</span>
          </div>

          {/* Quick Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="w-4 h-4" />
              <span>{doctor.experience} years experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{doctor.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold text-slate-900">₹{doctor.consultationFee}</span>
              <span>consultation fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-600">Next available:</span>
          </div>
          <span className="text-sm font-semibold text-emerald-600">
            {new Date(doctor.nextAvailable).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            View Profile
          </button>
          <button className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Map View Component
const MapView = ({ doctors, onMarkerClick }) => {
  const center = doctors.length > 0 
    ? [doctors[0].location.lat, doctors[0].location.lng]
    : [19.0760, 72.8777]; // Mumbai default

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ height: '700px' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {doctors.map((doctor) => (
          <Marker
            key={doctor.id}
            position={[doctor.location.lat, doctor.location.lng]}
            eventHandlers={{
              click: () => onMarkerClick(doctor),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-sm">{doctor.name}</h4>
                <p className="text-xs text-slate-600">{doctor.specialization}</p>
                <p className="text-xs text-slate-600 mt-1">₹{doctor.consultationFee}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Doctor Detail Modal Component
const DoctorModal = ({ doctor, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Doctor Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Doctor Info */}
          <div className="flex gap-6 mb-8">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-32 h-32 rounded-xl object-cover border-2 border-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{doctor.name}</h3>
                  <p className="text-lg text-slate-600">{doctor.specialization}</p>
                  <p className="text-sm text-slate-500">{doctor.qualification}</p>
                </div>
                {doctor.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    <Award className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <Star className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-700">{doctor.rating}</span>
                  <span className="text-sm text-slate-600">({doctor.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">{doctor.experience} years</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-5 h-5" />
                  <span>{doctor.gender}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-900 mb-2">About</h4>
            <p className="text-slate-600 leading-relaxed">{doctor.about}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Consultation Fee */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h5 className="font-semibold text-slate-900">Consultation Fee</h5>
              </div>
              <p className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee}</p>
            </div>

            {/* Address */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h5 className="font-semibold text-slate-900">Clinic Address</h5>
              </div>
              <p className="text-slate-600">{doctor.address}</p>
            </div>

            {/* Languages */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h5 className="font-semibold text-slate-900 mb-2">Languages</h5>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-white rounded-full text-sm text-slate-700 border border-slate-200"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Consultation Types */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h5 className="font-semibold text-slate-900 mb-2">Consultation Types</h5>
              <div className="flex flex-wrap gap-2">
                {doctor.consultationType.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Available Days</h4>
            <div className="flex flex-wrap gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span
                  key={day}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    doctor.availability.includes(day)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Available Time Slots</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {doctor.timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedTime === time
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
              <Phone className="w-5 h-5" />
              Call Now
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
