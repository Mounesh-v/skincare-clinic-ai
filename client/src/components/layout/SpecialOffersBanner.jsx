import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Tag, 
  ShoppingBag, 
  ArrowRight,
  Clock,
  Zap,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import specialOfferService from '../../services/specialOfferService.js';
import toast from 'react-hot-toast';

/**
 * Special Offers Animated Banner - Connected to Backend
 * Fetches live data from admin-managed special offers
 */
const SpecialOffersBanner = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [trackedViews, setTrackedViews] = useState(new Set());

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers();
  }, []);

  // Track views when offers are loaded
  useEffect(() => {
    if (offers.length > 0) {
      offers.forEach(offer => {
        if (!trackedViews.has(offer.id)) {
          specialOfferService.trackView(offer.id);
          setTrackedViews(prev => new Set([...prev, offer.id]));
        }
      });
    }
  }, [offers]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await specialOfferService.getActiveOffers();
      
      if (response.success && response.data) {
        setOffers(response.data);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load special offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = async (offer) => {
    // Track click
    await specialOfferService.trackClick(offer.id);
    
    // Navigate to product
    navigate(`/products/${offer.productId}`);
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="relative py-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // If error or no offers, don't show banner
  if (error || !offers || offers.length === 0) {
    return null;
  }

  // Duplicate offers for seamless infinite scroll
  const displayOffers = [...offers, ...offers, ...offers];

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
            {displayOffers.map((offer, index) => (
              <div
                key={`${offer.id}-${index}`}
                onClick={() => handleOfferClick(offer)}
                className="group relative flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 cursor-pointer hover:scale-105 overflow-hidden"
              >
                {/* Discount Badge - Top Right */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="relative">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                      <span className="text-white font-black text-sm">-{offer.discount} OFF</span>
                    </div>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>

                {/* Status Badge - Top Left */}
                <div className={`absolute top-3 left-3 z-20 ${offer.badgeColor} px-3 py-1 rounded-full shadow-lg`}>
                  <span className="text-white font-bold text-xs tracking-wide">{offer.badge}</span>
                </div>

                <div className="flex items-center gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={offer.image}
                        alt={offer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/120/120';
                        }}
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1 truncate group-hover:text-emerald-600 transition-colors">
                      {offer.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">
                      {offer.shortDesc}
                    </p>

                    {/* Timer */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                      <span className="text-xs font-semibold text-red-600">
                        Ends in: {offer.timeLeft}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 line-through">
                        ₹{offer.originalPrice}
                      </span>
                      <span className="text-lg md:text-xl font-black text-emerald-600">
                        ₹{offer.offerPrice}
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