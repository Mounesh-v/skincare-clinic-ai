import mongoose from "mongoose";

const MedicalPackages = mongoose.Schema(
  {
    title: String, // Acne Reduction Pack
    subtitle: String, // SKIN • 60 DAYS

    price: Number,
    originalPrice: Number,
    discount: String, // Save 33%

    duration: String, // 60 Days

    includes: [String], // what's included

    journey: [
      {
        stepNumber: Number,
        title: String,
        description: String,
      },
    ],

    tags: [String], 
  },
  { timestamps: true },
);

export default mongoose.model("MedicalPackages", MedicalPackages);
