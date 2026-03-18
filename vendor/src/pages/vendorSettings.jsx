import React, { useState, useEffect } from 'react';
import {
  User,
  Store,
  CreditCard,
  Bell,
  Lock,
  Save,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';

const VendorSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    gstNumber: '',
    panNumber: ''
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getVendorMe();
        if (cancelled || !res.vendor) return;
        const v = res.vendor;
        setProfileData({
          businessName: v.businessName || '',
          ownerName: v.ownerName || '',
          email: v.email || '',
          phone: v.phone || '',
          businessAddress: v.businessAddress || '',
          city: v.city || '',
          state: v.state || '',
          zipCode: v.zipCode || '',
          gstNumber: v.gstNumber || '',
          panNumber: v.panNumber || ''
        });
        setBankData({
          accountHolderName: v.accountHolderName || '',
          accountNumber: v.bankAccountNumber || '',
          ifscCode: v.ifscCode || ''
        });
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productAlerts: true,
    paymentNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankData({ ...bankData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    // API call to save profile
    toast.success('Profile updated successfully!');
  };

  const saveBankDetails = () => {
    // API call to save bank details
    toast.success('Bank details updated successfully!');
  };

  const saveNotifications = () => {
    // API call to save notification preferences
    toast.success('Notification preferences updated!');
  };

  const changePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    // API call to change password
    toast.success('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Store },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Business Profile</h2>
                    <button
                      onClick={saveProfile}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Store className="inline h-4 w-4 mr-1" />
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={profileData.businessName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Owner Name
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={profileData.ownerName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Business Address
                      </label>
                      <textarea
                        name="businessAddress"
                        value={profileData.businessAddress}
                        onChange={handleProfileChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={profileData.state}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={profileData.gstNumber}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={profileData.panNumber}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Tab */}
              {activeTab === 'bank' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Bank Account Details</h2>
                    <button
                      onClick={saveBankDetails}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> All payments will be transferred to this bank account. Please ensure the details are correct.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={bankData.accountHolderName}
                        onChange={handleBankChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankData.accountNumber}
                          onChange={handleBankChange}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          value={bankData.ifscCode}
                          onChange={handleBankChange}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          <Building className="inline h-4 w-4 mr-1" />
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={bankData.bankName}
                          onChange={handleBankChange}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          name="branchName"
                          value={bankData.branchName}
                          onChange={handleBankChange}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                    <button
                      onClick={saveNotifications}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-slate-600">
                            Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(key)}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            value ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Change Password</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      onClick={changePassword}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Update Password
                    </button>
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

export default VendorSettings;