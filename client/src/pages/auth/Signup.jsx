import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import api from "../../utils/api.js";

// Import your background image
import signupBg from "../../assets/signup-bg.jpg";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect already-logged-in users away from signup
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
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

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to terms");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms,
      });

      // Store name so login page can greet the user
      sessionStorage.setItem("justRegistered", formData.name);

      toast.success(`Welcome, ${formData.name}! Account created successfully 🎉`);

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookSignup = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${signupBg})` }}
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
                <p className="text-sm text-white/80">
                  Your journey to healthier skin
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight">
              Start Your Skin Transformation Today
            </h2>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle,
                  text: "Personalized AI-powered skin analysis",
                },
                { icon: Shield, text: "Doctor-approved treatment plans" },
                {
                  icon: Sparkles,
                  text: "Track your progress with smart insights",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-base text-white/90 font-medium">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Testimonial */}
            <div className="mt-8 p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-white/90 italic mb-3 text-sm leading-relaxed">
                "This platform transformed my skincare routine. The personalized
                approach really works!"
              </p>
              <p className="text-xs text-white/70 font-medium">
                — Priya S., Mumbai
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">50K+</div>
                <div className="text-xs text-white/70">Happy Users</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">4.8/5</div>
                <div className="text-xs text-white/70">Rating</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">93%</div>
                <div className="text-xs text-white/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form Section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:w-1/2">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-100 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-100 opacity-20 blur-3xl"></div>
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
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  Join 10,000+ Users
                </span>
              </div>
              <h2 className="mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
                Create Your Account ✨
              </h2>
              <p className="text-base text-slate-600">
                Begin your journey to radiant, healthy skin today
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User className="h-4 w-4 text-emerald-600" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pl-12 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                </div>
              </div>

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
                    placeholder="Create a strong password"
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
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pl-12 pr-12 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
                <label className="group flex cursor-pointer items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"
                      required
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
                  <div className="text-sm leading-relaxed text-slate-600">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </label>
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
                <span className="font-bold">Create My Account</span>
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 font-semibold text-slate-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
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
                  onClick={handleFacebookSignup}
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

            {/* Login Link */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </p>
            </div>

            {/* Security & Benefits */}
            <div className="mt-6 space-y-3">
              {/* Security Badge */}
              <div className="overflow-hidden rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-bold text-slate-900">
                      Your Privacy Matters
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600">
                      256-bit encryption protects your data. We never sell or
                      share your personal information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "🎯", text: "Personalized Plans" },
                  { icon: "🔬", text: "AI Analysis" },
                  { icon: "💰", text: "Special Offers" },
                  { icon: "📱", text: "Mobile Access" },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
                  >
                    <span className="text-lg">{benefit.icon}</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {benefit.text}
                    </span>
                  </div>
                ))}
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
    </div>
  );
};

export default Signup;
