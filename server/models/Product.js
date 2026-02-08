const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Cleansers',
      'Moisturizers',
      'Serums',
      'Sunscreen',
      'Masks',
      'Toners',
      'Eye Care',
      'Treatments',
      'Kits'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  ingredients: [{
    type: String,
  }],
  howToUse: {
    type: String,
  },
  benefits: [{
    type: String,
  }],
  skinTypes: [{
    type: String,
    enum: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All']
  }],
  concerns: [{
    type: String,
    enum: [
      'Acne',
      'Aging',
      'Dark Spots',
      'Dullness',
      'Fine Lines',
      'Large Pores',
      'Redness',
      'Dryness',
      'Oiliness'
    ]
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Inactive', 'Out of Stock'],
    default: 'Active',
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    }
  },
  sold: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'ml' }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0 && this.status === 'Active') {
    this.status = 'Out of Stock';
  } else if (this.stock > 0 && this.status === 'Out of Stock') {
    this.status = 'Active';
  }
  next();
});

// Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;