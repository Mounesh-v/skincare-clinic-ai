import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "Cleansers",
        "Moisturizers",
        "Serums",
        "Sunscreen",
        "Masks",
        "Toners",
        "Eye Care",
        "Treatments",
        "Kits",
      ],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
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
      required: [true, "Please provide stock quantity"],
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    ingredients: [{ type: String }],

    howToUse: String,

    benefits: [{ type: String }],

    skinTypes: [
      {
        type: String,
        // ✅ FIX 1: Consistent PascalCase — changed "ALL" → "All"
        enum: ["Normal", "Dry", "Oily", "Combination", "Sensitive", "All"],
      },
    ],

    concerns: [
      {
        type: String,
        enum: [
          "Acne",
          "Aging",
          "Dark Spots",
          "Dullness",
          "Fine Lines",
          "Large Pores",
          "Redness",
          "Dryness",
          "Oiliness",
        ],
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Draft", "Inactive", "Out of Stock"],
      default: "Active",
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
      },
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
      unit: { type: String, default: "ml" },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    // ✅ FIX 2: Enable virtuals in JSON/Object output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// SLUG GENERATE
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

// STOCK STATUS
productSchema.pre("save", function () {
  if (this.stock === 0 && this.status === "Active") {
    this.status = "Out of Stock";
  } else if (this.stock > 0 && this.status === "Out of Stock") {
    this.status = "Active";
  }
});

// ✅ FIX 3: Normalize skinTypes casing before save (prevents future case mismatch bugs)
productSchema.pre("save", function () {
  if (this.skinTypes && this.skinTypes.length > 0) {
    this.skinTypes = this.skinTypes.map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    );
  }
});

// VIRTUAL DISCOUNT
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

const Product = mongoose.model("Product", productSchema);

export default Product;
