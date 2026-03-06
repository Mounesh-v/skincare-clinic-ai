import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Package,
  Loader2,
  ChevronDown,
  Grid3x3,
  LayoutGrid,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Filter,
  ArrowUpDown,
  Eye,
  Heart,
  ShoppingBag,
  Zap,
  BadgeCheck,
  Clock
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import Button from "../components/common/Button";
import productService from "../services/productService";
import toast from "react-hot-toast";
import AdBanner from "./AdBanner";
import SlideSection from "../components/Slide/SlideSection";

/**
 * Enhanced Premium Products Page
 * Professional e-commerce experience with advanced features
 */
const ProductsPage = () => {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSkinType, setSelectedSkinType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedTags, setSelectedTags] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Categories with icons and colors
  const PRODUCT_CATEGORIES = [
    { value: "cleanser", label: "Cleansers", icon: "🧼", color: "from-blue-500 to-cyan-500" },
    { value: "moisturizer", label: "Moisturizers", icon: "💧", color: "from-emerald-500 to-teal-500" },
    { value: "serum", label: "Serums", icon: "✨", color: "from-violet-500 to-purple-500" },
    { value: "sunscreen", label: "Sunscreens", icon: "☀️", color: "from-amber-500 to-orange-500" },
    { value: "face_mask", label: "Face Masks", icon: "🎭", color: "from-pink-500 to-rose-500" },
    { value: "toner", label: "Toners", icon: "🌸", color: "from-fuchsia-500 to-pink-500" },
    { value: "eye_cream", label: "Eye Creams", icon: "👁️", color: "from-indigo-500 to-blue-500" },
    { value: "treatment", label: "Treatments", icon: "💊", color: "from-red-500 to-pink-500" },
  ];

  const SKIN_TYPES = [
    { value: "all", label: "All Types", icon: "✨" },
    { value: "oily", label: "Oily", icon: "💧" },
    { value: "dry", label: "Dry", icon: "🏜️" },
    { value: "combination", label: "Combination", icon: "🌓" },
    { value: "sensitive", label: "Sensitive", icon: "🌸" },
    { value: "normal", label: "Normal", icon: "😊" },
  ];

  const POPULAR_TAGS = [
    "Anti-Aging", "Brightening", "Hydrating", "Acne Treatment",
    "Natural", "Vegan", "Organic", "Fragrance-Free",
    "Hypoallergenic", "Oil-Free", "Non-Comedogenic", "SPF"
  ];

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSkinType, priceRange, sortBy, searchTerm, selectedTags]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters = {
        category: selectedCategory,
        skinType: selectedSkinType,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortBy,
        search: searchTerm,
        tags: selectedTags
      };

      const data = await productService.getAll(filters);
      let productsArray = Array.isArray(data) ? data : 
                         Array.isArray(data?.products) ? data.products :
                         Array.isArray(data?.data) ? data.data : [];
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(item => (item.id || item._id) === (product.id || product._id));

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, id: product.id || product._id });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast.success(wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist");
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSkinType("all");
    setPriceRange([0, 5000]);
    setSearchTerm("");
    setSelectedTags([]);
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedSkinType !== "all",
    priceRange[1] !== 5000,
    searchTerm !== "",
    selectedTags.length > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ENHANCED HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container-custom relative py-12 md:py-16">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-3 border border-white/30">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="text-sm md:text-base font-bold text-white tracking-wide">
                Premium Skincare Collection
              </span>
              <BadgeCheck className="h-5 w-5 text-white" />
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Discover Your Perfect
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Skincare Match
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Dermatologist-approved products tailored to your unique skin needs
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[
                { icon: Shield, text: "100% Authentic" },
                { icon: Truck, text: "Free Shipping" },
                { icon: RotateCcw, text: "Easy Returns" },
                { icon: BadgeCheck, text: "Verified Products" }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <badge.icon className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Package, label: "Products", value: products.length + "+" },
              { icon: Star, label: "Avg Rating", value: "4.8" },
              { icon: Award, label: "Verified", value: "100%" },
              { icon: TrendingUp, label: "Satisfaction", value: "98%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 text-center hover:bg-white/20 transition-all hover:scale-105"
              >
                <stat.icon className="mx-auto mb-2 h-8 w-8 text-white" />
                <p className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPECIAL SECTIONS */}
      <AdBanner />
      <SlideSection />

      {/* CATEGORY QUICK FILTERS */}
      <div className="border-y border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Products
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  selectedCategory === cat.value
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* ENHANCED SIDEBAR */}
          <div className="lg:col-span-1">
            {/* Mobile Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between gap-2 mb-4 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 font-bold text-slate-900 shadow-lg hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-emerald-600" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filters Panel */}
            {showFilters && (
              <div className="sticky top-24 rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b-2 border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                        <SlidersHorizontal className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Filters</h2>
                        {activeFiltersCount > 0 && (
                          <span className="text-sm font-semibold text-emerald-600">
                            {activeFiltersCount} active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>

                {/* Scroll Area */}
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-6 space-y-8">
                  {/* Search */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Search className="h-4 w-4 text-emerald-600" />
                      Search Products
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg"
                        >
                          <X className="h-4 w-4 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Skin Type */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      Skin Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SKIN_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedSkinType(type.value)}
                          className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all flex items-center gap-2 ${
                            selectedSkinType === type.value
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      Popular Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                            selectedTags.includes(tag)
                              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      Price Range
                    </label>
                    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full h-3 cursor-pointer appearance-none rounded-lg bg-slate-200"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${(priceRange[1]/5000)*100}%, #e2e8f0 ${(priceRange[1]/5000)*100}%, #e2e8f0 100%)`
                        }}
                      />
                      <div className="mt-4 flex justify-between">
                        <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm">
                          ₹0
                        </span>
                        <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                          ₹{priceRange[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRODUCTS SECTION */}
          <div className="lg:col-span-3">
            {/* Enhanced Toolbar */}
            <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-4 md:p-6 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Results */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Showing</p>
                    <p className="text-lg font-black text-slate-900">
                      {products.length} {products.length === 1 ? 'Product' : 'Products'}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-white shadow-md text-emerald-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Grid3x3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-white shadow-md text-emerald-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-xl border-2 border-slate-200 bg-white py-2.5 pl-4 pr-10 font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 hover:border-emerald-400"
                  >
                    <option value="featured">✨ Featured</option>
                    <option value="price-asc">💰 Price: Low to High</option>
                    <option value="price-desc">💎 Price: High to Low</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="newest">🆕 Newest First</option>
                    <option value="popular">🔥 Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Active Filters:</span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                      <X onClick={() => setSelectedCategory("all")} className="h-3 w-3 cursor-pointer" />
                    </span>
                  )}
                  {selectedSkinType !== "all" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                      {SKIN_TYPES.find(s => s.value === selectedSkinType)?.label}
                      <X onClick={() => setSelectedSkinType("all")} className="h-3 w-3 cursor-pointer" />
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {tag}
                      <X onClick={() => toggleTag(tag)} className="h-3 w-3 cursor-pointer" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-16 w-16 animate-spin text-emerald-600 mb-4" />
                <p className="text-lg font-semibold text-slate-600">Loading amazing products...</p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {Array.isArray(products) && products.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onBuyNow={() => navigate(`/products/${product.id || product._id}`)}
                        viewMode={viewMode}
                        onToggleWishlist={() => toggleWishlist(product.id || product._id)}
                        isWishlisted={wishlist.includes(product.id || product._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 md:p-20 text-center">
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
                      <Search className="h-16 w-16 text-slate-400" />
                    </div>
                    <h3 className="mb-3 text-3xl font-black text-slate-900">
                      No products found
                    </h3>
                    <p className="mb-8 text-lg text-slate-600">
                      Try adjusting your filters or search term to find what you're looking for
                    </p>
                    <Button onClick={clearFilters} className="mx-auto shadow-xl">
                      <X className="h-5 w-5 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductsPage;