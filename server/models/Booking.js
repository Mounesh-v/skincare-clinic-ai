import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    fullName: String,
    mobile: String,
    age: Number,
    skinType: {
      type: String,
      enum: ["Oily", "Dry", "Combination"],
    },
    city: String,

    // ✅ ADD THESE
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalPackages",
    },
    packageName: String,
    amount: Number,
  },
  { timestamps: true },
);

export default mongoose.model("BookingMedicalPackage", bookingSchema);
