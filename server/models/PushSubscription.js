import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Register", "Vendor", "Admin"],
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
