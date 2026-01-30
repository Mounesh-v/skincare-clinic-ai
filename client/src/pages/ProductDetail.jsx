import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Star, Shield, Truck, 
  RefreshCw, Check, Plus, Minus, ChevronLeft,
  Info, Droplet, Sparkles, Package
} from 'lucide-react';
import Button from '../components/common/Button';
import { products } from '../data/products';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - Replace with actual API
    const foundProduct = products.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes?.[0] || '');
      setLoading(false);
    } else {
      navigate('/products');
    }
  }, [productId, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stockCount) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // Implement cart logic
    console.log('Added to cart:', { product, selectedSize, quantity });
    // toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary-600">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-primary-600">
            Products
          </button>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}% OFF
                  </div>
                )}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${selectedImage === index 
                      ? 'border-primary-600 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.tags?.includes('bestseller') && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    BESTSELLER
                  </span>
                )}
                {product.inStock && product.stockCount < 20 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    LOW STOCK
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-3">
                {product.name}
              </h1>
              <p className="text-slate-600 mb-4">{product.shortDescription}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-900 font-semibold">{product.rating}</span>
                <span className="text-slate-500">({product.reviews.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-slate-200">
              <span className="text-4xl font-bold text-primary-600">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-green-600 font-semibold">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Select Size
                </label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-6 py-3 rounded-lg border-2 font-medium transition-all
                        ${selectedSize === size
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-200 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= product.stockCount}
                    className="p-3 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-600">
                  {product.stockCount} items available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={!product.inStock}
                leftIcon={<ShoppingCart className="h-5 w-5" />}
              >
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col items-center text-center p-3">
                <Truck className="h-8 w-8 text-primary-600 mb-2" />
                <p className="text-xs font-medium text-slate-900">Free Delivery</p>
                <p className="text-xs text-slate-500">On orders ₹999+</p>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <Shield className="h-8 w-8 text-primary-600 mb-2" />
                <p className="text-xs font-medium text-slate-900">100% Authentic</p>
                <p className="text-xs text-slate-500">Verified products</p>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <RefreshCw className="h-8 w-8 text-primary-600 mb-2" />
                <p className="text-xs font-medium text-slate-900">Easy Returns</p>
                <p className="text-xs text-slate-500">7 days return</p>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <Package className="h-8 w-8 text-primary-600 mb-2" />
                <p className="text-xs font-medium text-slate-900">Secure Packaging</p>
                <p className="text-xs text-slate-500">Safe delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'description', label: 'Description', icon: Info },
                { id: 'ingredients', label: 'Ingredients', icon: Droplet },
                { id: 'howToUse', label: 'How to Use', icon: Sparkles },
                { id: 'reviews', label: 'Reviews', icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all
                    ${activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">About this product</h3>
                  <p className="text-slate-700 leading-relaxed">{product.fullDescription}</p>
                </div>
                
                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Key Benefits</h4>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.skinTypes && product.skinTypes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Suitable For</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
                        >
                          {type} skin
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Full Ingredient List</h3>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Droplet className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">Ingredient information coming soon.</p>
                )}
              </div>
            )}

            {activeTab === 'howToUse' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">How to Use</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.howToUse || 'Usage instructions coming soon.'}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Reviews</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{product.rating} out of 5</span>
                      <span className="text-slate-500">
                        ({product.reviews.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">Write a Review</Button>
                </div>
                <p className="text-slate-600">Customer reviews will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
