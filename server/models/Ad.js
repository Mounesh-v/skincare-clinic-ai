import mongoose from "mongoose";

/**
 * Ad Schema
 * Stores admin created ads. Image links (URLs / base64) are stored in MongoDB.
 */
const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Main image link (first image)
    image: {
      type: String,
      default: "",
    },

    // All image links
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    position: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);



export default mongoose.model("Ad", adSchema);
