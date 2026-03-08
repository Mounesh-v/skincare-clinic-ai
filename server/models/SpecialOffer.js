const mongoose = require('mongoose');

/**
 * Special Offer Schema
 * Manages banner offers that admin can create/edit
 */
const specialOfferSchema = new mongoose.Schema({
  // Product Reference
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Offer Details
  badge: {
    type: String,
    enum: ['FLASH SALE', 'BEST SELLER', 'LIMITED', 'HOT DEAL', 'TRENDING', 'NEW ARRIVAL'],
    required: true
  },

  badgeColor: {
    type: String,
    enum: ['bg-red-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-violet-500', 'bg-blue-500'],
    default: 'bg-red-500'
  },

  discount: {
    type: String,
    required: true,
    match: /^\d+%$/  // Format: "30%", "50%"
  },

  offerPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // Timer
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  // Position in banner (1-5 for display order)
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    unique: true
  },

  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },

  clicks: {
    type: Number,
    default: 0
  },

  conversions: {
    type: Number,
    default: 0
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for time left
specialOfferSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const diff = this.expiresAt - now;
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
});

// Index for efficient querying
specialOfferSchema.index({ isActive: 1, expiresAt: 1, position: 1 });

// Method to check if offer is expired
specialOfferSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Static method to get active offers
specialOfferSchema.statics.getActiveOffers = async function() {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  })
  .populate('productId', 'name description images price category')
  .sort({ position: 1 })
  .limit(5);
};

// Auto-deactivate expired offers (runs before find queries)
specialOfferSchema.pre(/^find/, function(next) {
  this.find({ 
    $or: [
      { expiresAt: { $gt: new Date() } },
      { isActive: false }
    ]
  });
  next();
});

// Set virtuals to JSON
specialOfferSchema.set('toJSON', { virtuals: true });
specialOfferSchema.set('toObject', { virtuals: true });

const SpecialOffer = mongoose.model('SpecialOffer', specialOfferSchema);

module.exports = SpecialOffer;