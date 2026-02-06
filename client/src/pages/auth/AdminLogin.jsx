import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    // Simulate API call - Replace with actual API
    setTimeout(() => {
      // Demo credentials
      if (formData.email === 'admin@skincare.ai' && formData.password === 'Admin@123') {
        const adminUser = {
          id: '1',
          name: 'Admin User',
          email: formData.email,
          role: 'super_admin',
        };

        localStorage.setItem('adminToken', 'demo_admin_token_12345');
        localStorage.setItem('adminUser', JSON.stringify(adminUser));

        toast.success('Login successful! Welcome back 👋');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  SkinCare AI
                </h1>
                <p className="text-sm text-slate-600">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Admin Login
            </h2>
            <p className="text-slate-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Email: admin@skincare.ai</p>
            <p className="text-xs text-blue-700">Password: Admin@123</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@skincare.ai"
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-600">
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-slate-600">
                This is a secure admin area. All actions are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          ></div>
        </div>

        {/* Decorative Blur */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/30">
            <Sparkles className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome to Admin Panel</h2>
          <p className="text-lg text-emerald-100 mb-8">
            Manage your skincare platform with powerful tools and analytics
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-sm">Analytics</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-sm">User Management</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-semibold text-sm">Product Control</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold text-sm">Order Tracking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;