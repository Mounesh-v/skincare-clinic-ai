import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Settings,
  UserCircle,
  Heart,
  ShoppingBag,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import ctaBg from "../../assets/hero2.jpg";

import { getInitial, getUser } from "../../utils/auth";

const Header = ({ isAuthenticated = false, user = null, onLogout }) => {
  const [fullscreenMenuOpen, setFullscreenMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Avatar State
  const [initial, setInitial] = useState(getInitial());
  const [name, setName] = useState(getUser()?.name || "");
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (fullscreenMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fullscreenMenuOpen]);

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  useEffect(() => {
    const update = () => {
      setInitial(getInitial());
      setName(getUser()?.name || "");
    };

    // Listen when login happens
    window.addEventListener("auth:updated", update);

    return () => window.removeEventListener("auth:updated", update);
  }, []);

  // Menu sections data
  const menuSections = {
    whatWeDo: [
      { name: "Skin Assessment", path: "/assessment", icon: Heart },
      // { name: "AI Diagnosis", path: "/diagnosis", icon: FileText },
      // { name: "Treatment Plans", path: "/treatments", icon: Calendar },
      { name: "Product Recommendations", path: "/products", icon: ShoppingBag },
    ],
    howWeDoIt: [
      { name: "Our Science", path: "/science", icon: FileText },
      { name: "Ingredients", path: "/ingredients", icon: ShoppingBag },
      { name: "Clinical Studies", path: "/ClinicalStudies", icon: FileText },
      { name: "Doctor Network", path: "/find-doctors", icon: User },
    ],
    whoWeAre: [
      { name: "About Us", path: "/about", icon: User },
      { name: "Our Story", path: "/story", icon: Heart },
      // { name: "Blog", path: "/blog", icon: FileText },
      // { name: "Careers", path: "/careers", icon: ShoppingBag },
    ],
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-br  from-white tp-teal-50 to-emerald-200 py-1 border-b border-slate-50 ">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => setFullscreenMenuOpen(false)}
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center  shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-2xl">🌿</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SkinCare AI
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => setFullscreenMenuOpen(true)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Explore
              </button>
              <Link
                to="/products"
                onClick={() => setFullscreenMenuOpen(false)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Products
              </Link>
              <Link
                to="/find-doctors"
                onClick={() => setFullscreenMenuOpen(false)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Doctors
              </Link>
              <Link
                to="/contact"
                onClick={() => setFullscreenMenuOpen(false)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Contact
              </Link>
              
            </div>

            {/* Right Side - Auth or Profile */}
            <div className="flex items-center gap-4">
              {name ? (
                // ===== LOGGED IN VIEW =====
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    {/* 🔥 YOUR LETTER AVATAR */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {initial}
                      </span>
                    </div>

                    <span className="text-sm font-semibold hidden lg:block">
                      {name}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-2xl">
                      <div className="px-4 py-3 bg-emerald-50 border-b">
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="text-xs text-slate-600">
                          {getUser()?.email}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          localStorage.clear();
                          window.dispatchEvent(new Event("auth:updated"));
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // ===== NOT LOGGED IN VIEW =====
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="hidden md:block px-5 py-2 text-slate-700 hover:text-emerald-600"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => navigate("/signup")}
                    className="hidden md:block px-6 py-2 bg-emerald-600 text-white rounded-lg"
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Hamburger stays same */}
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setFullscreenMenuOpen(!fullscreenMenuOpen)}
              >
                {fullscreenMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Fullscreen Dropdown Menu Overlay */}
      {fullscreenMenuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center sm:bg-top md:bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${ctaBg})` }}
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/35 backdrop-sm"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            {/* Close Button */}
            <button
              onClick={() => setFullscreenMenuOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100/80 rounded-lg transition-colors backdrop-blur-sm"
            >
              <X className="h-6 w-6 text-slate-700" />
            </button>

            {/* Menu Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
              {/* WHAT WE DO Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-emerald-500 pb-2">
                  WHAT WE DO
                </h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  We help you take control of your skin health in a
                  personalised, and scientific way.
                </p>
                <div className="space-y-3">
                  {menuSections.whatWeDo.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setFullscreenMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-emerald-50 transition-all duration-200 group shadow-sm"
                      >
                        <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">
                          {item.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-emerald-600 transition-colors" />
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => {
                      navigate("/assessment");
                      setFullscreenMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    Start Assessment
                  </button>

                  {/* Only show Log In button if NOT logged in */}
                  {!name && (
                    <button
                      onClick={() => {
                        navigate("/login");
                        setFullscreenMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-colors"
                    >
                      Log In
                    </button>
                  )}
                </div>
              </div>

              {/* HOW WE DO IT Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-teal-500 pb-2">
                  HOW WE DO IT
                </h2>
                <div className="space-y-3">
                  {menuSections.howWeDoIt.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setFullscreenMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-teal-50 transition-all duration-200 group shadow-sm"
                      >
                        <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                          <Icon className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="text-slate-700 font-medium group-hover:text-teal-600 transition-colors">
                          {item.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-teal-600 transition-colors" />
                      </Link>
                    );
                  })}
                </div>

                {/* Featured Products Section */}
                <div className="mt-8 p-6 bg-gradient-to-br from-teal-50/90 to-emerald-50/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50">
                  <h3 className="font-bold text-slate-900 mb-3">
                    🎯 Featured Products
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Discover our doctor-approved skincare solutions
                  </p>
                  <button
                    onClick={() => {
                      navigate("/products");
                      setFullscreenMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-white text-teal-600 font-medium rounded-lg hover:shadow-md transition-shadow"
                  >
                    View Products
                  </button>
                </div>
              </div>

              {/* WHO WE ARE Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-purple-500 pb-2">
                  WHO WE ARE
                </h2>
                <div className="space-y-3">
                  {menuSections.whoWeAre.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setFullscreenMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-purple-50 transition-all duration-200 group shadow-sm"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-slate-700 font-medium group-hover:text-purple-600 transition-colors">
                          {item.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-purple-600 transition-colors" />
                      </Link>
                    );
                  })}
                </div>

                {/* GET IN TOUCH Section */}
                <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-lg shadow-lg border border-white/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    GET IN TOUCH
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+911234567890"
                      className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="text-sm">+91 123 456 7890</span>
                    </a>

                    <a
                      href="mailto:hello@skincare.ai"
                      className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-sm">hello@skincare.ai</span>
                    </a>

                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">Mumbai, India</span>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex items-center gap-4 mt-6">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/80 rounded-full hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      <span className="text-xl">📷</span>
                    </a>

                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/80 rounded-full hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      <span className="text-xl">📘</span>
                    </a>

                    <a
                      href="https://whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/80 rounded-full hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      <span className="text-xl">💬</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile User Section (if authenticated) */}
            {isAuthenticated && user && (
              <div className="mt-12 pt-8 border-t border-slate-200 md:hidden">
                <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-emerald-500">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setFullscreenMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="h-5 w-5 text-slate-500" />
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogoutClick();
                      setFullscreenMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium shadow-sm"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
