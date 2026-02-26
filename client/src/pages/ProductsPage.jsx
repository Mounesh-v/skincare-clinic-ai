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
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import Button from "../components/common/Button";
import productService from "../services/productService";
import toast from "react-hot-toast";
import AdBanner from "./AdBanner";

/**
 * Products Page - Connected to Backend
 * Browse all skincare products with filters
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
  const [showFilters, setShowFilters] = useState(false);

  // Categories
  const PRODUCT_CATEGORIES = {
    CLEANSER: "cleanser",
    MOISTURIZER: "moisturizer",
    SERUM: "serum",
    SUNSCREEN: "sunscreen",
    FACE_MASK: "face_mask",
    TONER: "toner",
    EYE_CREAM: "eye_cream",
    TREATMENT: "treatment",
  };

  const SKIN_TYPES_FILTER = {
    ALL: "all",
    OILY: "oily",
    DRY: "dry",
    COMBINATION: "combination",
    SENSITIVE: "sensitive",
    NORMAL: "normal",
  };

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSkinType, priceRange, sortBy, searchTerm]);

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
      };

      const data = await productService.getAll(filters);

      // CRITICAL FIX: Handle different response formats
      let productsArray = [];

      if (Array.isArray(data)) {
        // Response is directly an array
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        // Response has products property
        productsArray = data.products;
      } else if (data && Array.isArray(data.data)) {
        // Response has data property
        productsArray = data.data;
      } else {
        console.error("Unexpected response format:", data);
        productsArray = [];
      }

      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(
      (item) => (item.id || item._id) === (product.id || product._id),
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, id: product.id || product._id });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    navigate(`/products/${product.id || product._id}`);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSkinType("all");
    setPriceRange([0, 5000]);
    setSearchTerm("");
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedSkinType !== "all",
    priceRange[1] !== 5000,
    searchTerm !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
        <div className="container-custom relative py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Premium Skincare Collection
              </span>
            </div>
            <h1 className="mb-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl">
              Discover Your Perfect Match
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              Dermatologist-approved products tailored to your unique skin needs
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Package,
                label: "Products",
                value: products.length + "+",
              },
              { icon: Award, label: "Verified", value: "100%" },
              { icon: TrendingUp, label: "Satisfaction", value: "98%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group rounded-xl border border-slate-200 bg-white/60 p-4 text-center backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg sm:p-6"
              >
                <stat.icon className="mx-auto mb-2 h-6 w-6 text-emerald-600 transition-transform group-hover:scale-110 sm:h-8 sm:w-8" />
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdBanner/>

      <div className="container-custom py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-4 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg">
              {/* Filter Header */}
              <div className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <SlidersHorizontal className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Filters
                      </h2>
                      {activeFiltersCount > 0 && (
                        <span className="text-xs font-medium text-emerald-600">
                          {activeFiltersCount} active
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                {/* Search */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-bold text-slate-900">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-bold text-slate-900">
                    Category
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`group w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                        selectedCategory === "all"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      All Products
                    </button>
                    {Object.values(PRODUCT_CATEGORIES).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`group w-full rounded-xl px-4 py-3 text-left text-sm font-medium capitalize transition-all ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {category.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Type Filter */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-bold text-slate-900">
                    Skin Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SKIN_TYPES_FILTER).map(([key, value]) => (
                      <button
                        key={value}
                        onClick={() => setSelectedSkinType(value)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition-all ${
                          selectedSkinType === value
                            ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {key.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-bold text-slate-900">
                    Price Range
                  </label>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([0, parseInt(e.target.value)])
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-slate-900">
                        ₹0
                      </span>
                      <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        ₹{priceRange[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {products.length}
                    </span>{" "}
                    products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md lg:hidden"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border-2 border-slate-200 bg-white py-2 pl-4 pr-10 font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {Array.isArray(products) && products.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-20 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                      <Search className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">
                      No products found
                    </h3>
                    <p className="mb-6 text-slate-600">
                      Try adjusting your filters or search term
                    </p>
                    <Button onClick={clearFilters} className="mx-auto">
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
