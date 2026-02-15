import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, trim: true, lowercase: true },

    phone: { type: String, trim: true },

    slug: { type: String, unique: true, lowercase: true },

    specialization: { type: String, required: true, trim: true },

    qualification: { type: String, required: true, trim: true },

    experience: { type: Number, required: true, min: 0 },

    consultationFee: { type: Number, required: true, min: 0 },

    address: { type: String, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    availability: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: [],
    },

    languages: { type: [String], default: [] },

    about: { type: String, required: true },

    image: { type: String, required: true },

    consultationType: {
      type: [String],
      enum: ["In-clinic", "Video", "Home Visit"],
      default: ["In-clinic"],
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    reviews: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
    nextAvailable: {
      type: Date,
    },

    timeSlots: {
      type: [String],
      default: [],
    },

    featured: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

doctorSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

doctorSchema.virtual("isAvailable").get(function () {
  if (!this.availability) return false;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  return this.availability.includes(today);
});

export default mongoose.model("Doctor", doctorSchema);
