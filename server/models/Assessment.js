const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // User Input Data
  skinType: {
    type: String,
    enum: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
  },
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
      'Uneven Texture',
      'Hyperpigmentation'
    ]
  }],
  skinGoals: [{
    type: String,
  }],
  currentRoutine: {
    morning: [String],
    evening: [String],
  },
  allergies: [String],
  lifestyle: {
    sleepHours: Number,
    waterIntake: String,
    exercise: String,
    stress: String,
    diet: String,
  },
  // Photo Analysis
  photos: [{
    url: String,
    publicId: String,
    type: { type: String, enum: ['front', 'left', 'right', 'close-up'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // AI Analysis Results
  aiAnalysis: {
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    detectedSkinType: String,
    detectedConcerns: [String],
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
    },
    recommendations: {
      products: [{
        category: String,
        recommendation: String,
      }],
      routine: {
        morning: [String],
        evening: [String],
      },
      lifestyle: [String],
    },
    analysis: {
      type: String,
    },
    processedAt: Date,
  },
  // Recommended Products
  recommendedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  // Status
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Pending Review', 'Rejected'],
    default: 'Pending',
  },
  // Admin Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  reviewNotes: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
  // Follow-up
  followUpDate: {
    type: Date,
  },
  followUpNotes: {
    type: String,
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

// Generate assessment ID before saving
assessmentSchema.pre('save', async function(next) {
  if (!this.assessmentId) {
    const count = await mongoose.model('Assessment').countDocuments();
    this.assessmentId = `ASS-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;