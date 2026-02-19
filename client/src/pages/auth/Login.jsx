import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

import api from "../../utils/api";

// Import your background image
import loginBg from "../../assets/Signup-bg.jpg";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(res.data.message || "Welcome back! 👋");

      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form Section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:w-1/2">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-100 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-teal-100 opacity-20 blur-3xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mb-4 inline-flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
                  <span className="text-3xl">🌿</span>
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
                  SkinCare AI
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Your personalized skincare companion
              </p>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-emerald-700">
                  Secure Login
                </span>
              </div>
              <h2 className="mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
                Welcome Back! 👋
              </h2>
              <p className="text-base text-slate-600">
                Continue your journey to healthier, glowing skin
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pl-12 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pl-12 pr-12 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="group flex cursor-pointer items-center gap-2.5">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"
                    />
                    <svg
                      className="pointer-events-none absolute left-0.5 top-0.5 hidden h-4 w-4 text-white peer-checked:block"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="group flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  <span>Forgot password?</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="group !mt-6 !bg-gradient-to-r !from-emerald-600 !to-teal-600 !py-4 !shadow-xl !shadow-emerald-500/30 hover:!shadow-2xl hover:!shadow-emerald-500/40"
              >
                <span className="font-bold">Sign In</span>
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 font-semibold text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <svg
                    className="h-5 w-5 transition-transform group-hover:scale-110"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">
                    Google
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="group flex items-center justify-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <svg
                    className="h-5 w-5 transition-transform group-hover:scale-110"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">
                    Facebook
                  </span>
                </button>
              </div>
            </form>

            {/* Signup Link */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Create account
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-6 overflow-hidden rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-bold text-slate-900">
                    Bank-Level Security
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Your data is encrypted with 256-bit SSL and protected by
                    advanced security protocols. We never share your
                    information.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600">
                  SSL Secured
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600">
                  GDPR Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-teal-400/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white w-full max-w-xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-3xl">🌿</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  SkinCare AI
                </h1>
                <p className="text-sm text-white/80">Continue your journey</p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight mb-4">
                Welcome Back!
              </h2>
              <p className="text-base text-white/90 leading-relaxed">
                Continue tracking your skin health journey with personalized
                insights and expert recommendations.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-lg font-bold mb-1">Track Progress</div>
                <p className="text-xs text-white/70">Monitor skin health</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                <div className="text-2xl mb-2">👨‍⚕️</div>
                <div className="text-lg font-bold mb-1">Expert Care</div>
                <p className="text-xs text-white/70">Doctor consultations</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                <div className="text-2xl mb-2">💊</div>
                <div className="text-lg font-bold mb-1">Treatments</div>
                <p className="text-xs text-white/70">Personalized plans</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-lg font-bold mb-1">Results</div>
                <p className="text-xs text-white/70">Visible improvements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;
