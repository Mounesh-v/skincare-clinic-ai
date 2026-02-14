import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide doctor name"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    specialization: {
      type: String,
      required: [true, "Please provide specialization"],
      trim: true,
    },

    qualification: {
      type: String,
      required: [true, "Please provide qualification"],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, "Please provide experience in years"],
      min: 0,
    },

    consultationFee: {
      type: Number,
      required: [true, "Please provide consultation fee"],
      min: 0,
    },

    address: {
      type: String,
      required: [true, "Please provide clinic address"],
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },

    availability: [
      {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    ],

    nextAvailable: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    languages: [
      {
        type: String,
      },
    ],

    about: {
      type: String,
      required: [true, "Please provide doctor description"],
    },

    image: {
      type: String,
      required: [true, "Please provide doctor image"],
    },
    consultationType: [
      {
        type: String,
        enum: ["In-clinic", "Video", "Home Visit"],
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    timeSlots: [
      {
        type: String,
      },
    ],

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

    reviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

// ✅ SLUG GENERATION
doctorSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

// ✅ AUTO STATUS CHECK (If no availability → On Leave)
doctorSchema.pre("save", function () {
  if (this.availability.length === 0) {
    this.status = "On Leave";
  }
});

// ✅ VIRTUAL FIELD: Is Available Today
doctorSchema.virtual("isAvailable").get(function () {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  return this.availability.includes(today);
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
