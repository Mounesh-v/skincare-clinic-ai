import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  ShoppingBag,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Package,
  Award,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import productService from ".././../services/productService";

const ProductShowcase = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right");
  const intervalRef = useRef(null);
  const sectionRefs = useRef({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSkinType, setSelectedSkinType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(true);

  const categories = [
    // { name: 'All',           icon: Package, count: 50 },
    { name: "Serums", icon: Sparkles, count: 12 },
    { name: "Moisturizers", icon: Heart, count: 15 },
    { name: "Cleansers", icon: Zap, count: 10 },
    { name: "Treatments", icon: Award, count: 13 },
  ];

  // ─── DERIVED DATA ─────────────────────────────────────────────────────────────

  // const products =
  //   activeCategory === "All"
  //     ? bestSellers
  //     : bestSellers.filter((p) => p.category === activeCategory);

  // ─── SLIDE HELPERS ────────────────────────────────────────────────────────────

  const goToSlide = useCallback(
    (index, direction = "right") => {
      if (isSliding) return;
      setIsSliding(true);
      setSlideDirection(direction);
      setCurrentSlide(index);
      setTimeout(() => setIsSliding(false), 700);
    },
    [isSliding],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );

    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, []);

  const registerSection = (key) => (el) => {
    if (el) sectionRefs.current[key] = el;
  };

  // ─── WISHLIST ─────────────────────────────────────────────────────────────────

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // ─── DISCOUNT % ──────────────────────────────────────────────────────────────

  const discountPercent = (orig, curr) =>
    Math.round(((orig - curr) / orig) * 100);

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const filters = {
        category: selectedCategory,
        skinType: selectedSkinType,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy,
        search: searchTerm,
      };

      const data = await productService.getAll(filters);

      console.log("data", data);

      // Handle any backend response format safely
      let productsArray = [];

      if (Array.isArray(data)) {
        productsArray = data;
      } else if (Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data.data)) {
        productsArray = data.data;
      }

      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSkinType, priceRange, sortBy, searchTerm]);

  const nextSlide = useCallback(() => {
    if (!products.length) return;

    setCurrentSlide((prev) => (prev + 1) % products.length);
    setSlideDirection("right");
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (!products.length) return;

    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setSlideDirection("left");
  }, [products.length]);

  useEffect(() => {
    if (!products.length) return;

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000); // change speed here (5s)

    return () => clearInterval(intervalRef.current);
  }, [nextSlide, products.length]);

  const stopAutoScroll = () => {
    clearInterval(intervalRef.current);
  };

  const startAutoScroll = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  return (
    <div className="relative bg-gradient-to-b from-white via-slate-50/60 to-white overflow-hidden py-24">
      {/* ── Ambient blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/3 -right-24 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] bg-teal-200/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        {/* ══════════════════════════════════
             SECTION 1 — FEATURED SLIDER
        ══════════════════════════════════ */}
        <section
          ref={registerSection("featured")}
          data-section="featured"
          className={`space-y-12 transition-all duration-1000 ${
            visibleSections.featured
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          {/* Heading */}
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-sm font-bold text-emerald-700 tracking-widest uppercase">
                Featured Collection
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Discover Our
              <span className="block mt-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Signature Products
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
              Clinically proven formulas loved by thousands of skincare
              devotees.
            </p>
          </div>

          {/* Slider */}
          <div
            className="relative max-w-6xl mx-auto"
            onMouseEnter={stopAutoScroll}
            onMouseLeave={startAutoScroll}
          >
            <div className="relative min-h-[480px] sm:min-h-[560px]">
              {products.map((product, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={product.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      isActive
                        ? "opacity-100 translate-x-0 scale-100 z-10"
                        : slideDirection === "right"
                          ? index < currentSlide
                            ? "opacity-0 -translate-x-full scale-95 z-0"
                            : "opacity-0 translate-x-full scale-95 z-0"
                          : index > currentSlide
                            ? "opacity-0 translate-x-full scale-95 z-0"
                            : "opacity-0 -translate-x-full scale-95 z-0"
                    }`}
                  >
                    <div
                      className={`h-full rounded-3xl bg-gradient-to-br ${product.bgGradient} p-1 shadow-2xl`}
                    >
                      <div className="grid md:grid-cols-2 h-full bg-white/70 backdrop-blur-sm rounded-[22px] overflow-hidden">
                        {/* Left — Image */}
                        <div className="relative group overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 min-h-[280px] md:min-h-0">
                          {/* Discount ribbon */}
                          <div className="absolute top-5 left-5 z-20 px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-extrabold rounded-full shadow-lg tracking-wide animate-pulse-slow">
                            {product.discount}
                          </div>
                          {/* Status badge */}
                          <div
                            className={`absolute top-5 right-5 z-20 px-4 py-1.5 bg-gradient-to-r ${product.badgeColor} text-white text-xs font-extrabold rounded-full shadow-lg tracking-wide`}
                          >
                            {product.badge}
                          </div>

                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Quick actions */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            {[
                              { Icon: Heart, color: "text-rose-500" },
                              { Icon: Eye, color: "text-slate-700" },
                              { Icon: ShoppingBag, color: "text-emerald-600" },
                            ].map(({ Icon, color }, i) => (
                              <button
                                key={i}
                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-200"
                              >
                                <Icon className={`w-5 h-5 ${color}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right — Details */}
                        <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
                          <div>
                            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                              {product.tagline}
                            </p>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                              {product.name}
                            </h3>
                          </div>

                          <p className="text-slate-500 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Benefits */}
                          <div className="flex flex-wrap gap-2">
                            {product.benefits.map((b, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                ✓ {b}
                              </span>
                            ))}
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-3 py-4 border-y border-slate-200">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.floor(product.rating)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-slate-900">
                              {product.rating}
                            </span>
                            <span className="text-slate-500 text-sm">
                              ({product.reviews} reviews)
                            </span>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-end justify-between gap-4 flex-wrap">
                            <div>
                              <p className="text-sm text-slate-400 line-through">
                                ₹{product.originalPrice}
                              </p>
                              <p className="text-4xl font-extrabold text-slate-900">
                                ₹{product.price}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                navigate(`/products/${product.id}`)
                              }
                              className="group/btn flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
                            >
                              <ShoppingBag className="w-5 h-5" />
                              Add to Cart
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Arrows */}
              {["prev", "next"].map((dir) => (
                <button
                  key={dir}
                  onClick={() => {
                    dir === "prev" ? prevSlide() : nextSlide();
                    stopAutoScroll();
                    startAutoScroll();
                  }}
                  className={`absolute ${
                    dir === "prev" ? "left-3 sm:left-5" : "right-3 sm:right-5"
                  } top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl hover:bg-white hover:scale-110 transition-all duration-200 border border-white/50`}
                  aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
                >
                  {dir === "prev" ? (
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                  ) : (
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                  )}
                </button>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    goToSlide(i, i > currentSlide ? "right" : "left");
                    stopAutoScroll();
                    startAutoScroll();
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`transition-all duration-400 rounded-full ${
                    i === currentSlide
                      ? "w-10 h-3 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-300"
                      : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
             SECTION 2 — CATEGORY TABS
        ══════════════════════════════════ */}
        <section
          ref={registerSection("categories")}
          data-section="categories"
          className={`transition-all duration-700 delay-200 ${
            visibleSections.categories
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={i}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`group flex items-center gap-3 px-5 py-3 rounded-2xl border font-semibold transition-all duration-300 hover:-translate-y-1 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-xl shadow-emerald-500/30 scale-105"
                      : "bg-white text-slate-700 border-slate-200 shadow-md hover:border-emerald-300 hover:shadow-lg"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-white/20" : "bg-emerald-50 group-hover:bg-emerald-100"}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600"}`}
                    />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm">{cat.name}</p>
                    <p
                      className={`text-xs ${isActive ? "text-white/70" : "text-slate-400"}`}
                    >
                      {cat.count} products
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════
             SECTION 3 — BEST SELLERS GRID
        ══════════════════════════════════ */}
        <section
          ref={registerSection("bestsellers")}
          data-section="bestsellers"
          className="space-y-10"
        >
          {/* Header */}
          <div
            className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 transition-all duration-700 ${
              visibleSections.bestsellers
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-3">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700 tracking-widest uppercase">
                  Most Popular
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                Best Sellers
              </h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => navigate(`/products/${product.id}`)}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer hover:-translate-y-2 ${
                  visibleSections.bestsellers
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Image */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {product.tag}
                  </span>

                  {/* Discount badge */}
                  <span className="absolute top-4 right-14 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discountPercent(product.originalPrice, product.price)}%
                  </span>

                  {/* Wishlist */}
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-200 z-10"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors duration-200 ${
                        wishlist.includes(product.id)
                          ? "text-rose-500 fill-rose-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Quick view */}
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-slate-900 rounded-full text-sm font-semibold shadow-xl whitespace-nowrap opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105">
                    Quick View
                  </button>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-200 truncate">
                    {product.name}
                  </h3>

                  {/* Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(product.rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {product.rating}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs text-slate-400 line-through">
                        ₹{product.originalPrice}
                      </p>
                      <p className="text-xl font-extrabold text-slate-900">
                        ₹{product.price}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 ${
                        hoveredProduct === product.id
                          ? "opacity-100 scale-100 translate-x-0"
                          : "opacity-0 scale-90 translate-x-4"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <button
            onClick={() => navigate("/products")}
            className="sm:hidden w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            View All Products <ArrowRight className="w-5 h-5" />
          </button>
        </section>
      </div>

      {/* ── Global animation styles ── */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -30px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-blob            { animation: blob 12s ease-in-out infinite; }
        .animation-delay-2000    { animation-delay: 2s; }
        .animation-delay-4000    { animation-delay: 4s; }
        .animate-pulse-slow      { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-fade-in         { animation: fade-in 0.6s ease-out both; }
      `}</style>
    </div>
  );
};

export default ProductShowcase;
