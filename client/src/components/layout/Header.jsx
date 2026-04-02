import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

import ctaBg from "../../public/hero2.jpeg";

import { getInitial, getUser } from "../../utils/auth";

const Header = ({ isAuthenticated = false, user = null, onLogout }) => {
  const [fullscreenMenuOpen, setFullscreenMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Avatar State
  const [initial, setInitial] = useState(getInitial());
  const [name, setName] = useState(getUser()?.name || "");
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  // hand gesture navigation
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const distance = touchEndX - touchStartX;

    // 👉 swipe right → open
    if (distance > 70) {
      setFullscreenMenuOpen(true);
    }

    // 👉 swipe left → close
    if (distance < -70) {
      setFullscreenMenuOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      // Use pointerdown (works on touch + mouse) and capture phase
      // to avoid 300ms Android tap delay from mousedown
      document.addEventListener("pointerdown", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside, true);
    };
  }, [profileDropdownOpen]);

  // Prevent body scroll when fullscreen menu is open
  // Use a CSS class instead of inline overflow:hidden to avoid
  // Android WebView bug where hiding overflow blocks touch events
  useEffect(() => {
    if (fullscreenMenuOpen) {
      document.documentElement.classList.add("menu-open");
    } else {
      document.documentElement.classList.remove("menu-open");
    }
    return () => {
      document.documentElement.classList.remove("menu-open");
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
      <header className="sticky top-0 z-[1000] bg-gradient-to-br  from-white tp-teal-50 to-emerald-200 py-1 border-b border-slate-50 ">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => setFullscreenMenuOpen(false)}
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center  shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-xl sm:text-2xl">🌿</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SkinCare AI
              </span>
            </Link>
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => setFullscreenMenuOpen(true)}
                className="text-slate-700 cursor-pointer hover:text-emerald-600 font-medium transition-colors duration-200"
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
                to="/Offers"
                onClick={() => setFullscreenMenuOpen(false)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Offers
              </Link>
              <Link
                to="/contact"
                onClick={() => setFullscreenMenuOpen(false)}
                className="text-slate-700 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                Contact
              </Link>
            </div>

            {/* Fullscreen Menu in Mobile */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={`md:hidden fixed top-0 left-0 z-[999] h-full w-full bg-cover bg-center shadow-xl overflow-y-auto transform transition-transform duration-500 ease-in-out ${
                  fullscreenMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundImage: `url(${ctaBg})` }}
              >
                {/* Header */}
                <div className="sticky top-0  z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-br  from-white tp-teal-50 to-emerald-200 border-b">
                  {/* Left: Logo + Title */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <span className="text-xl">🌿</span>
                    </div>

                    <span className="text-xl font-bold text-emerald-700">
                      SkinCare AI
                    </span>
                  </div>

                  {/* Right: Close Button */}
                  <button
                    onClick={() => setFullscreenMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/60 transition"
                  >
                    <X className="h-6 w-6 text-slate-700" />
                  </button>
                </div>

                {/* Menu Grid Layout */}
                <div className="flex flex-col gap-8 p-4 space-y-8 pb-24">
                  {/* WHAT WE DO Section */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-emerald-500 pb-2">
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
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-emerald-50 transition-all duration-200 group shadow-sm"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-teal-500 pb-2">
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
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-teal-50 transition-all duration-200 group shadow-sm"
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
                    <div className="mt-2 sm:mt-6  p-3 sm:p-4 bg-gradient-to-br from-teal-50/90 to-emerald-50/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50">
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
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-purple-500 pb-2">
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
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-purple-50 transition-all duration-200 group shadow-sm"
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
                      <div className="flex items-center gap-4 mt-6 sm:mt-8">
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
              </div>
            </div>

            {/* Right Side - Auth or Profile */}
            <div className="flex items-center gap-4">
              {name ? (
                // ===== LOGGED IN VIEW =====
                <div className="relative" ref={profileRef}>
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

                      {/* <button
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
                      </button> */}

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
                    className="bg-emerald-600 px-5  py-2 text-white rounded-xl  hover:text-emerald-600"
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

              {/* Hamburger — hidden on lg+ (desktop uses top nav links) */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 touch-manipulation"
                style={{ touchAction: "manipulation" }}
                onClick={() => {
                  console.log(
                    "[Nav] hamburger clicked, was:",
                    fullscreenMenuOpen,
                  );
                  setFullscreenMenuOpen(!fullscreenMenuOpen);
                }}
                aria-label={fullscreenMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={fullscreenMenuOpen}
              >
                {fullscreenMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Fullscreen Dropdown Menu Overlay */}
      {fullscreenMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto hidden md:block">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center sm:bg-top md:bg-center bg-repeat"
            style={{ backgroundImage: `url(${ctaBg})` }}
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10 space-y-6 sm:space-y-10">
            {/* Close Button */}
            <button
              onClick={() => setFullscreenMenuOpen(false)}
              className="absolute top-20 right-6 p-2 hover:bg-slate-100/80 rounded-lg transition-colors backdrop-blur-sm"
            >
              <X className="h-6 w-6 text-slate-700" />
            </button>

            {/* Menu Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
              
              {/* WHAT WE DO Section */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-emerald-500 pb-2">
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
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-emerald-50 transition-all duration-200 group shadow-sm"
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
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-teal-500 pb-2">
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
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-teal-50 transition-all duration-200 group shadow-sm"
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
                <div className="mt-4 sm:mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-teal-50/90 to-emerald-50/90 backdrop-blur-md rounded-lg shadow-lg border border-white/50">
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
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b-2 border-purple-500 pb-2">
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
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-purple-50 transition-all duration-200 group shadow-sm"
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
                  <div className="flex items-center gap-4 mt-6 sm:mt-8">
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

      {/* Mobile Bottom Navigation Bar — only visible on small screens (hidden on md+) */}
      {/* {!fullscreenMenuOpen && ( */}
      <nav className="bottom-nav md:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {[
            {
              to: "/",
              label: "Home",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              ),
            },
            {
              to: "/assessment",
              label: "Scan",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              ),
            },
            {
              to: "/products",
              label: "Products",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              ),
            },
            {
              to: "/find-doctors",
              label: "Doctors",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              ),
            },
            {
              to: "/contact",
              label: "Contact",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              ),
            },
          ].map(({ to, icon, label }) => {
            // useLocation() updates correctly on React SPA navigation
            // window.location.pathname does NOT update on client-side routing
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
                >
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* )} */}
    </>
  );
};

export default Header;
