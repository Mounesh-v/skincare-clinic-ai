import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegisterUsers",
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
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },
      },
    ],

    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

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
      default: "COD",
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
  }
);

// GENERATE ORDER NUMBER
orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${Date.now()}-${random}`;
  }
});

// ADD TIMELINE ENTRY ON STATUS CHANGE
orderSchema.pre("save", function () {
  if (this.isNew) {
    this.timeline.push({
      status: this.orderStatus || "Pending",
      timestamp: new Date(),
    });
  }

  if (this.isModified("orderStatus") && !this.isNew) {
    this.timeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
