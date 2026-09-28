import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Phone, 
  User, 
  Calendar, 
  Droplet, 
  MapPin,
  Tag,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Truck
} from "lucide-react";

const MedicalPackages = () => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    age: "",
    skinType: "",
    city: "",
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/offers");
      const data = res.data;
      if (Array.isArray(data)) {
        setOffers(data);
      } else if (data.success && data.data) {
        setOffers(data.data);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error("Failed to load packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.fullName || !formData.mobile) {
        return toast.error("Please fill required fields");
      }

      const res = await api.post("/api/offers/booking", {
        userDetails: formData,
        packageId: selectedOffer._id,
      });

      toast.success("🎉 Booking confirmed! We'll contact you shortly.");
      
      setSelectedOffer(null);
      setFormData({
        fullName: "",
        mobile: "",
        age: "",
        skinType: "",
        city: "",
      });
    } catch (error) {
      toast.error("Booking failed. Please try again.");
      console.log("Error while Booking", error);
    }
  };

  const calculateSavings = (original, price) => {
    return ((original - price) / original * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Limited Time Offers</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Medical <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Packages</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Choose the perfect skincare solution tailored to your needs. Professional care, guaranteed results.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-8 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Offer Cards Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {offers.map((offer) => {
              const savings = offer.originalPrice
                ? calculateSavings(offer.originalPrice, offer.price)
                : 0;
              
              return (
                <div
                  key={offer._id}
                  onClick={() => setSelectedOffer(offer)}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="relative h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-white/30" />
                    {/* Discount Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1 bg-white text-emerald-600 text-xs font-bold rounded-full shadow-lg">
                        {savings}% OFF
                      </div>
                    </div>
                    {/* Duration Badge */}
                    {offer.duration && (
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>{offer.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Category */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                        Medical Package
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-slate-900">
                          4.8
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors min-h-[3rem]">
                      {offer.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {offer.subtitle}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        ₹{offer.price.toLocaleString("en-IN")}
                      </span>
                      {offer.originalPrice && offer.originalPrice > offer.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{offer.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Includes Preview */}
                    {offer.includes && offer.includes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {offer.includes.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                        {offer.includes.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                            +{offer.includes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

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
            })}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 lg:gap-8">
          <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">100% Safe</h4>
            <p className="text-sm text-slate-600">Certified treatments</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Expert Care</h4>
            <p className="text-sm text-slate-600">Experienced professionals</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Quick Results</h4>
            <p className="text-sm text-slate-600">Visible improvements</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start sm:items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl my-8 sm:my-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 sm:px-8 py-6 rounded-t-2xl z-10">
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>

              <div className="pr-10">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">{selectedOffer.discount}</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {selectedOffer.title}
                </h2>
                <p className="text-slate-600">{selectedOffer.subtitle}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 sm:px-8 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              
              {/* Product Image */}
              {selectedOffer.image && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedOffer.image}
                    alt={selectedOffer.title}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                </div>
              )}
              {/* Price Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mb-6 border border-emerald-100">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ₹{selectedOffer.price.toLocaleString()}
                  </span>
                  <span className="text-xl text-slate-400 line-through">
                    ₹{selectedOffer.originalPrice.toLocaleString()}
                  </span>
                  <span className="ml-auto bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Save {calculateSavings(selectedOffer.originalPrice, selectedOffer.price)}%
                  </span>
                </div>
              </div>

              {/* What's Included */}
              {selectedOffer.includes && selectedOffer.includes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    What's Included
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedOffer.includes.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors"
                      >
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Journey */}
              {selectedOffer.journey && selectedOffer.journey.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                    Your Journey
                  </h3>
                  <div className="space-y-4">
                    {selectedOffer.journey.map((step, index) => (
                      <div key={step.stepNumber} className="flex gap-4 group">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            {step.stepNumber}
                          </div>
                          {index < selectedOffer.journey.length - 1 && (
                            <div className="w-0.5 h-8 bg-slate-200 mx-auto mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedOffer.tags && selectedOffer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedOffer.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Booking Form */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Book Your Appointment
                </h3>

                <div className="space-y-4">
                  {/* Name & Mobile */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Enter your name"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="Enter mobile number"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age & Skin Type */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Age
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          placeholder="Enter age"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          value={formData.age}
                          onChange={(e) =>
                            setFormData({ ...formData, age: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Skin Type
                      </label>
                      <div className="relative">
                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                        <select
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none bg-white cursor-pointer"
                          value={formData.skinType}
                          onChange={(e) =>
                            setFormData({ ...formData, skinType: e.target.value })
                          }
                        >
                          <option value="">Select skin type</option>
                          <option value="Oily">Oily</option>
                          <option value="Dry">Dry</option>
                          <option value="Combination">Combination</option>
                          <option value="Sensitive">Sensitive</option>
                          <option value="Normal">Normal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* City */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City / Pincode
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter city or pincode"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Pay ₹{selectedOffer.price.toLocaleString()}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Your information is secure and will be kept confidential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPackages;