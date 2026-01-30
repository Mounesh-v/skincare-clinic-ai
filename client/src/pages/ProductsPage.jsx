import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/common/Button';
import { products, PRODUCT_CATEGORIES, SKIN_TYPES_FILTER } from '../data/products';
import toast from 'react-hot-toast';

/**
 * Products Page
 * Browse all skincare products with filters
 */
const ProductsPage = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkinType, setSelectedSkinType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSkinType = selectedSkinType === 'all' || 
                            product.skinTypes.includes(selectedSkinType) || 
                            product.skinTypes.includes(SKIN_TYPES_FILTER.ALL);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesSkinType && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product) => {
    toast.success(`${product.name} added to cart!`);
    // Add to cart logic
  };

  const handleBuyNow = (product) => {
    navigate(`/products/${product.id}`);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSkinType('all');
    setPriceRange([0, 5000]);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-8">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
            Skincare Products
          </h1>
          <p className="text-lg text-slate-600">
            Discover our range of dermatologist-approved skincare solutions
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    All Products
                  </button>
                  {Object.values(PRODUCT_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all capitalize ${
                        selectedCategory === category
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {category.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Skin Type
                </label>
                <div className="space-y-2">
                  {Object.entries(SKIN_TYPES_FILTER).map(([key, value]) => (
                    <button
                      key={value}
                      onClick={() => setSelectedSkinType(value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all capitalize ${
                        selectedSkinType === value
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {key.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Price Range
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-slate-600 mt-2">
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{sortedProducts.length}</span> products
              </p>
              
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search term</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;