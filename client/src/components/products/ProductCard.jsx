import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Eye,
  TrendingUp,
  Truck,
  Shield,
  ArrowRight,
} from "lucide-react";
import Button from "../common/Button";

const ProductCard = ({ product, onAddToCart, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(product._id);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    // You can add toast notification here
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    handleAddToCart(e);
    navigate("/checkout");
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  // Calculate discount percentage
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {/* Product Image */}
        <img
          src={product.images?.[0]?.url || ""}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {(!product.images?.[0]?.url) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              {discountPercentage}% OFF
            </div>
          )}
          {product.tags?.includes("bestseller") && (
            <div className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
              BESTSELLER
            </div>
          )}
          {product.tags?.includes("new") && (
            <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              NEW
            </div>
          )}
        </div>

        {/* Favorite Button - Top Right */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"
            }`}
          />
        </button>

        {/* Quick View Button - Center (appears on hover) */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
            className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="h-5 w-5" />
            Quick View
          </button>
        </div>

        {/* Stock Status Badge - Bottom Left */}
        {product.stock === 0 ? (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full">
            Out of Stock
          </div>
        ) : (
          product.stock > 0 &&
          product.stock < 20 && (
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full animate-pulse">
              Only {product.stock} left
            </div>
          )
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {product.category}
          </span>
          {product.ratings?.average > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-slate-900">
                {product.ratings.average}
              </span>
              <span className="text-xs text-slate-500">
                ({product.ratings.count})
              </span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3rem]">
          {product.name}
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Skin Types */}
        {product.skinTypes && product.skinTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.skinTypes.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-2xl font-bold text-primary-600">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <div className="hidden lg:block ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="px-2 py-0 rounded-full flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Action Buttons */}
        {/* <div className="flex gap-2 pt-2"> */}
        {/* <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            disabled={!product.inStock}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
          >
            Add to Cart
          </Button> */}

        {/* </div> */}
        {/* Trust Badges */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Truck className="h-3.5 w-3.5" />
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Shield className="h-3.5 w-3.5" />
            <span>100% Authentic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
