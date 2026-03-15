import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Get orders that contain at least one product belonging to the logged-in vendor
 */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorProductIds = await Product.find({ vendor: req.user.id })
      .select("_id")
      .lean();
    const ids = vendorProductIds.map((p) => p._id);

    const orders = await Order.find({
      "items.product": { $in: ids },
    })
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
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

/**
 * Get single order – only if it contains at least one product from this vendor
 */
export const getVendorOrderById = async (req, res) => {
  try {
    const vendorProductIds = await Product.find({ vendor: req.user.id })
      .select("_id")
      .lean();
    const ids = vendorProductIds.map((p) => p._id);

    const order = await Order.findOne({
      _id: req.params.id,
      "items.product": { $in: ids },
    })
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
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

/**
 * Update order status – only for orders that contain vendor's products
 */
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const vendorProductIds = await Product.find({ vendor: req.user.id })
      .select("_id")
      .lean();
    const ids = vendorProductIds.map((p) => p._id);

    const order = await Order.findOne({
      _id: req.params.id,
      "items.product": { $in: ids },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const { orderStatus, paymentStatus } = req.body;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
