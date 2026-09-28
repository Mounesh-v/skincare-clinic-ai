import Order from "../models/Order.js";
import Product from "../models/Product.js";
import RegisterUsers from "../models/Register.js";
import { notifyAdmin, createNotification } from "./notificationController.js";

/* ==============================
   CREATE ORDER
============================== */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    const user = await RegisterUsers.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isProfileComplete) {
      return res.status(400).json({
        success: false,
        code: "PROFILE_INCOMPLETE",
        message: "Please complete your profile first",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
        vendor: product.vendor || null,
      });

      // update stock
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Calculate tax and shipping
    const subtotal = totalAmount;
    const shipping = subtotal >= 999 ? 0 : 49;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress: shippingAddress || {},
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      orderStatus: "Pending",
    });

    // Notify admin (fire-and-forget)
    notifyAdmin({
      type: "order",
      title: "New Order Placed",
      message: `${user.name} placed an order worth ₹${total.toLocaleString()} (${orderItems.length} item${orderItems.length > 1 ? "s" : ""})`,
      data: { orderId: order._id, userId: user._id, total, actions: [{ action: "open", title: "View Order" }, { action: "dismiss", title: "Dismiss" }] },
      link: `/admin/orders`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

/* ==============================
   GET ALL ORDERS (Admin)
============================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name price images");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==============================
   GET SINGLE ORDER
============================== */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==============================
   UPDATE ORDER STATUS
============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.orderStatus;

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send notification to customer when order status changes
    if (orderStatus && orderStatus !== previousStatus && order.user) {
      console.log(`[ORDER] Status changed: ${previousStatus} → ${orderStatus} for order ${order.orderNumber}`);

      const statusMessages = {
        Processing: "Your order is being processed.",
        Shipped: "Your order has been shipped!",
        "Out for Delivery": "Your order is out for delivery.",
        Delivered: "Your order has been delivered. Thank you!",
        Cancelled: "Your order has been cancelled.",
        Returned: "Your order has been returned.",
      };

      const message = statusMessages[orderStatus] || `Your order status has been updated to ${orderStatus}.`;

      console.log(`[ORDER] Sending notification to user=${order.user._id}`);

      createNotification({
        recipient: order.user._id,
        recipientModel: "Register",
        type: "order",
        title: `Order ${orderStatus}`,
        message: `Order ${order.orderNumber}: ${message}`,
        data: { orderId: order._id, orderStatus, paymentStatus: order.paymentStatus },
        link: "/products",
        sendPush: true,
      }).catch(() => {});
    } else {
      console.log(`[ORDER] No status change or no user — skipping notification`);
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==============================
   DELETE ORDER
============================== */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==============================
   GET OWN ORDERS (User)
============================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ==============================
   GET VENDOR ORDERS
============================== */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const orders = await Order.find({ "items.vendor": vendorId })
      .populate("user", "name email phone")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    // Filter items to only show this vendor's products
    const filteredOrders = orders.map((order) => ({
      ...order._doc,
      items: order.items.filter(
        (item) => item.vendor && item.vendor.toString() === vendorId
      ),
    }));

    res.json({
      success: true,
      orders: filteredOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
