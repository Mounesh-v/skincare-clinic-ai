import SpecialOffer from "../models/SpecialOffer.js";
import Product from "../models/Product.js";

/**
 * Special Offer Controller
 * Handles all special offer operations
 */

// @desc    Get all active special offers for banner
// @route   GET /api/special-offers
// @access  Public
export const getActiveOffers = async (req, res) => {
  try {
    const offers = await SpecialOffer.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate(
        "productId",
        "name description images price originalPrice category skinType",
      )
      .sort({ position: 1 })
      .limit(5)
      .lean();

    // Format offers for frontend
    const formattedOffers = offers.map((offer) => {
      const product = offer.productId;

      return {
        id: offer._id,
        productId: product._id,
        name: product.name,
        shortDesc: product.description
          ? product.description.substring(0, 50)
          : "",
        image:
          product.images && product.images[0]
            ? product.images[0]
            : "/api/placeholder/120/120",
        originalPrice: product.originalPrice || product.price,
        offerPrice: offer.offerPrice,
        discount: offer.discount,
        badge: offer.badge,
        badgeColor: offer.badgeColor,
        timeLeft: calculateTimeLeft(offer.expiresAt),
        expiresAt: offer.expiresAt,
        views: offer.views,
        clicks: offer.clicks,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedOffers.length,
      data: formattedOffers,
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch special offers",
      error: error.message,
    });
  }
};

// @desc    Get all offers (Admin)
// @route   GET /api/special-offers/admin
// @access  Private/Admin
export const getAllOffers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Filter by status
    if (status === "active") {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (status === "expired") {
      query.expiresAt = { $lte: new Date() };
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const offers = await SpecialOffer.find(query)
      .populate("productId", "name images price")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SpecialOffer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching all offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
};

// @desc    Get single offer
// @route   GET /api/special-offers/:id
// @access  Private/Admin
export const getOffer = async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id)
      .populate("productId")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offer",
      error: error.message,
    });
  }
};

// @desc    Create new special offer
// @route   POST /api/special-offers
// @access  Private/Admin
export const createOffer = async (req, res) => {
  try {
    const {
      productId,
      badge,
      badgeColor,
      discount,
      offerPrice,
      expiresAt,
      position,
      isActive,
    } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if position is already taken
    const existingPosition = await SpecialOffer.findOne({
      position,
      isActive: true,
    });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message: `Position ${position} is already occupied. Please choose a different position (1-5).`,
      });
    }

    // Validate offer price is less than product price
    if (offerPrice >= product.price) {
      return res.status(400).json({
        success: false,
        message: "Offer price must be less than original product price",
      });
    }

    // Create offer
    const offer = await SpecialOffer.create({
      productId,
      badge,
      badgeColor,
      discount,
      offerPrice,
      expiresAt,
      position,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    // Populate product details
    await offer.populate("productId", "name images price");

    res.status(201).json({
      success: true,
      message: "Special offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);

    // Handle duplicate position error
    if (error.code === 11000 && error.keyPattern.position) {
      return res.status(400).json({
        success: false,
        message:
          "Position is already taken. Please choose a different position.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create offer",
      error: error.message,
    });
  }
};

// @desc    Update special offer
// @route   PUT /api/special-offers/:id
// @access  Private/Admin
export const updateOffer = async (req, res) => {
  try {
    const {
      productId,
      badge,
      badgeColor,
      discount,
      offerPrice,
      expiresAt,
      position,
      isActive,
    } = req.body;

    let offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // If position is being changed, check if new position is available
    if (position && position !== offer.position) {
      const existingPosition = await SpecialOffer.findOne({
        position,
        isActive: true,
        _id: { $ne: req.params.id },
      });

      if (existingPosition) {
        return res.status(400).json({
          success: false,
          message: `Position ${position} is already occupied.`,
        });
      }
    }

    // If productId is being changed, validate new product
    if (productId && productId !== offer.productId.toString()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // Update fields
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    offer = await SpecialOffer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("productId", "name images price");

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message,
    });
  }
};

// @desc    Delete special offer
// @route   DELETE /api/special-offers/:id
// @access  Private/Admin
export const deleteOffer = async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message,
    });
  }
};

// @desc    Toggle offer active status
// @route   PATCH /api/special-offers/:id/toggle
// @access  Private/Admin
export const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.isActive = !offer.isActive;
    offer.updatedBy = req.user._id;
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"} successfully`,
      data: offer,
    });
  } catch (error) {
    console.error("Error toggling offer status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle offer status",
      error: error.message,
    });
  }
};

// @desc    Track offer view
// @route   POST /api/special-offers/:id/view
// @access  Public
export const trackView = async (req, res) => {
  try {
    const offer = await SpecialOffer.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { views: offer.views },
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track view",
      error: error.message,
    });
  }
};

// @desc    Track offer click
// @route   POST /api/special-offers/:id/click
// @access  Public
export const trackClick = async (req, res) => {
  try {
    const offer = await SpecialOffer.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true },
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { clicks: offer.clicks },
    });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track click",
      error: error.message,
    });
  }
};

// @desc    Get offer analytics
// @route   GET /api/special-offers/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const activeOffers = await SpecialOffer.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate("productId", "name");

    const expiredOffers = await SpecialOffer.countDocuments({
      expiresAt: { $lte: new Date() },
    });

    const totalViews = await SpecialOffer.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const totalClicks = await SpecialOffer.aggregate([
      { $group: { _id: null, total: { $sum: "$clicks" } } },
    ]);

    const totalConversions = await SpecialOffer.aggregate([
      { $group: { _id: null, total: { $sum: "$conversions" } } },
    ]);

    const clickThroughRate =
      totalViews[0]?.total > 0
        ? (((totalClicks[0]?.total || 0) / totalViews[0].total) * 100).toFixed(
            2,
          )
        : 0;

    const conversionRate =
      totalClicks[0]?.total > 0
        ? (
            ((totalConversions[0]?.total || 0) / totalClicks[0].total) *
            100
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        activeOffers: activeOffers.length,
        expiredOffers,
        totalViews: totalViews[0]?.total || 0,
        totalClicks: totalClicks[0]?.total || 0,
        totalConversions: totalConversions[0]?.total || 0,
        clickThroughRate: `${clickThroughRate}%`,
        conversionRate: `${conversionRate}%`,
        offers: activeOffers,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// Helper function to calculate time left
function calculateTimeLeft(expiresAt) {
  const now = new Date();
  const diff = expiresAt - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default {
  getActiveOffers,
  getAllOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  trackView,
  trackClick,
  getAnalytics,
};
