import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    topic: { type: String, default: "other" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
