import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
      },
    ],

    subtotal: Number,
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number,

    paymentMethod: {
      type: String,
      enum: [
        "COD",
        "Credit Card",
        "Debit Card",
        "UPI",
        "Net Banking",
        "Wallet",
      ],
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },

    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// GENERATE ORDER NUMBER
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// TIMELINE UPDATE
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.timeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }

  if (this.isModified("orderStatus")) {
    this.timeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
