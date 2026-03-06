import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Tag, 
  ShoppingBag, 
  ArrowRight,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';

/**
 * Special Offers Animated Banner
 * Continuously scrolling product offers with emerald theme
 */
const SpecialOffersBanner = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  // Sample special offer products - Replace with real data
  const specialOffers = [
    {
      id: 1,
      name: "Vitamin C Glow Serum",
      shortDesc: "Brighten & illuminate your skin",
      image: "/api/placeholder/120/120",
      originalPrice: 2499,
      offerPrice: 1749,
      discount: "30%",
      badge: "FLASH SALE",
      badgeColor: "bg-red-500",
      timeLeft: "2h 15m"
    },
    {
      id: 2,
      name: "Hydrating Night Cream",
      shortDesc: "Deep moisture overnight repair",
      image: "/api/placeholder/120/120",
      originalPrice: 1899,
      offerPrice: 1329,
      discount: "30%",
      badge: "BEST SELLER",
      badgeColor: "bg-emerald-500",
      timeLeft: "4h 30m"
    },
    {
      id: 3,
      name: "Anti-Aging Eye Cream",
      shortDesc: "Reduce fine lines & dark circles",
      image: "/api/placeholder/120/120",
      originalPrice: 1599,
      offerPrice: 1119,
      discount: "30%",
      badge: "LIMITED",
      badgeColor: "bg-amber-500",
      timeLeft: "1h 45m"
    },
    {
      id: 4,
      name: "Sunscreen SPF 50+",
      shortDesc: "Complete UV protection",
      image: "/api/placeholder/120/120",
      originalPrice: 1299,
      offerPrice: 909,
      discount: "30%",
      badge: "HOT DEAL",
      badgeColor: "bg-orange-500",
      timeLeft: "5h 20m"
    },
    {
      id: 5,
      name: "Detox Clay Mask",
      shortDesc: "Deep cleanse & purify pores",
      image: "/api/placeholder/120/120",
      originalPrice: 1099,
      offerPrice: 769,
      discount: "30%",
      badge: "TRENDING",
      badgeColor: "bg-violet-500",
      timeLeft: "3h 10m"
    }
  ];

  // Duplicate products for seamless infinite scroll
  const products = [...specialOffers, ...specialOffers, ...specialOffers];

  return (
    <div className="relative py-6 md:py-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer-bg"></div>
      </div>

      {/* Top Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-horizontal"></div>
      
      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-horizontal-reverse"></div>

      <div className="relative">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-3 animate-bounce-slow">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white font-black text-sm md:text-base tracking-wider uppercase">
              🔥 Special Offers - Limited Time Only! 🔥
            </span>
            <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-3 text-white/90 text-xs md:text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-semibold">Hurry! Offers expire soon</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Scrolling Products Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Gradient Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-emerald-600 to-transparent z-10 pointer-events-none"></div>
          
          {/* Right Gradient Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-cyan-600 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Track */}
          <div className={`flex gap-4 md:gap-6 ${isPaused ? '' : 'animate-scroll'}`}>
            {products.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group relative flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 cursor-pointer hover:scale-105 overflow-hidden"
              >
                {/* Discount Badge - Top Right */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="relative">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                      <span className="text-white font-black text-sm">-{product.discount} OFF</span>
                    </div>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                {/* Status Badge - Top Left */}
                <div className={`absolute top-3 left-3 z-20 ${product.badgeColor} px-3 py-1 rounded-full shadow-lg`}>
                  <span className="text-white font-bold text-xs tracking-wide">{product.badge}</span>
                </div>

                <div className="flex items-center gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1 truncate group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">
                      {product.shortDesc}
                    </p>

                    {/* Timer */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                      <span className="text-xs font-semibold text-red-600">
                        Ends in: {product.timeLeft}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                      <span className="text-lg md:text-xl font-black text-emerald-600">
                        ₹{product.offerPrice}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-xs md:text-sm shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 group/btn">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Grab Deal Now</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Bottom Glow Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Offers Button */}
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={() => navigate('/products')}
            className="group inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-emerald-600 rounded-full font-black text-sm md:text-base shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
          >
            <Tag className="w-5 h-5" />
            <span>View All Special Offers</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes shimmer-bg {
          0% {
            background-position: -250% 0;
          }
          100% {
            background-position: 250% 0;
          }
        }

        @keyframes scan-horizontal {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scan-horizontal-reverse {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-shimmer-bg {
          animation: shimmer-bg 3s linear infinite;
        }

        .animate-scan-horizontal {
          animation: scan-horizontal 3s linear infinite;
        }

        .animate-scan-horizontal-reverse {
          animation: scan-horizontal-reverse 3s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* Pause animation on hover */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SpecialOffersBanner;