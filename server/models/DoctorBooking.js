import mongoose from "mongoose";

const doctorBookingSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ["In-clinic", "Video", "Home Visit"],
      required: true,
    },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DoctorBooking", doctorBookingSchema);
