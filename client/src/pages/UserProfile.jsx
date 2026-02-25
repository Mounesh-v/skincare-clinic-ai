import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Lock,
  Heart,
  Package,
  FileText,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    skinType: '',
    allergies: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      productRecommendations: true
    }
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
          },
          skinType: userData.skinType || '',
          allergies: userData.allergies || '',
          preferences: userData.preferences || {
            emailNotifications: true,
            smsNotifications: false,
            productRecommendations: true
          }
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    } else {
      // Redirect to login if no user
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: !prev.preferences[name]
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Update user in localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        skinType: user.skinType || '',
        allergies: user.allergies || '',
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          productRecommendations: true
        }
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.dispatchEvent(new Event('auth:updated'));
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'skin', label: 'Skin Profile', icon: Heart },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'assessments', label: 'Assessments', icon: FileText },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="absolute top-6 right-6 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="pt-20 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-slate-600 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  {formData.email}
                </p>
                {formData.phone && (
                  <p className="text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formData.phone}
                  </p>
                )}
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeTab === tab.id ? 'translate-x-1' : ''
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true} // Email usually shouldn't be editable
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-500 cursor-not-allowed transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="+91 1234567890"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      Address
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Street Address */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="123 Main Street"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* City */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Ludhiana"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Punjab"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                          />
                        </div>

                        {/* ZIP Code */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="141001"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skin Profile Tab */}
              {activeTab === 'skin' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Skin Profile</h2>
                  
                  {/* Skin Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Skin Type
                    </label>
                    <select
                      name="skinType"
                      value={formData.skinType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                    >
                      <option value="">Select Skin Type</option>
                      <option value="normal">Normal</option>
                      <option value="oily">Oily</option>
                      <option value="dry">Dry</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Known Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="List any known allergies or ingredients to avoid..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:text-slate-500 transition-all resize-none"
                    />
                  </div>

                  {/* Preferences Toggle */}
                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-emerald-600" />
                      Preferences
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900">Email Notifications</p>
                          <p className="text-sm text-slate-600">Receive updates via email</p>
                        </div>
                        <button
                          onClick={() => handleToggle('emailNotifications')}
                          disabled={!isEditing}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            formData.preferences.emailNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                          } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.emailNotifications ? 'translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900">SMS Notifications</p>
                          <p className="text-sm text-slate-600">Receive updates via SMS</p>
                        </div>
                        <button
                          onClick={() => handleToggle('smsNotifications')}
                          disabled={!isEditing}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            formData.preferences.smsNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                          } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.smsNotifications ? 'translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>

                      {/* Product Recommendations */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900">Product Recommendations</p>
                          <p className="text-sm text-slate-600">Personalized suggestions</p>
                        </div>
                        <button
                          onClick={() => handleToggle('productRecommendations')}
                          disabled={!isEditing}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            formData.preferences.productRecommendations ? 'bg-emerald-600' : 'bg-slate-300'
                          } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.productRecommendations ? 'translate-x-7' : ''
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
                  <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
                  <button 
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Browse Products
                  </button>
                </div>
              )}

              {/* Assessments Tab */}
              {activeTab === 'assessments' && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Assessments Yet</h3>
                  <p className="text-slate-600 mb-6">Take a skin assessment to get personalized recommendations</p>
                  <button 
                    onClick={() => navigate('/assessment')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Start Assessment
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-emerald-600" />
                    Security Settings
                  </h2>
                  
                  {/* Change Password */}
                  <div className="p-6 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">Change Password</h3>
                        <p className="text-sm text-slate-600">Update your password regularly</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all">
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-600">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-all">
                        Enable
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="p-6 border border-red-200 rounded-xl bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-red-900 mb-1">Delete Account</h3>
                        <p className="text-sm text-red-600">Permanently delete your account and data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;