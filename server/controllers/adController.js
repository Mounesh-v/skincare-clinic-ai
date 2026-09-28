import Ad from "../models/Ad.js";

/**
 * Ad Controller
 * Handles all ad operations. Images are sent as links in the request body
 * and stored directly in MongoDB (same style as specialOfferController).
 */

// Helper: normalize images input (string, JSON array, comma list, array of strings/objects)
const parseImages = (input) => {
  if (!input) return [];

  let arr = Array.isArray(input)
    ? input
    : (() => {
        try {
          const parsed = JSON.parse(input);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return String(input).split(",");
        }
      })();

  return arr
    .map((img) => (typeof img === "string" ? img.trim() : img?.url || ""))
    .filter(Boolean);
};

// @desc    Get active ads (public - website)
// @route   GET /api/ads/public
// @access  Public
export const getPublicAds = async (req, res) => {
  try {
    const ads = await Ad.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .sort({ position: 1, createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching public ads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ads",
      error: error.message,
    });
  }
};

// @desc    Create new ad
// @route   POST /api/ads
// @access  Private/Admin
export const createAd = async (req, res) => {
  try {
    const { title, image, images, position, isActive, expiresAt } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Ad title is required",
      });
    }

    const parsedImages = parseImages(images && images.length ? images : image);

    if (parsedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ad image is required",
      });
    }

    const ad = await Ad.create({
      title: title.trim(),
      image: parsedImages[0],
      images: parsedImages,
      position: position || 0,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ad",
      error: error.message,
    });
  }
};

// @desc    Get all ads
// @route   GET /api/ads
// @access  Private/Admin
export const getAds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const ads = await Ad.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ad.countDocuments(query);

    res.status(200).json({
      success: true,
      count: ads.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ads",
      error: error.message,
    });
  }
};

// @desc    Get single ad
// @route   GET /api/ads/:id
// @access  Private/Admin
export const getAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ad",
      error: error.message,
    });
  }
};

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private/Admin
export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    const updateData = { ...req.body, updatedBy: req.user._id };

    // Re-normalize images when provided
    if (req.body.images !== undefined || req.body.image !== undefined) {
      const parsedImages = parseImages(
        req.body.images && req.body.images.length
          ? req.body.images
          : req.body.image,
      );

      if (parsedImages.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one ad image is required",
        });
      }

      updateData.images = parsedImages;
      updateData.image = parsedImages[0];
    }

    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      data: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ad",
      error: error.message,
    });
  }
};

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private/Admin
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    await ad.deleteOne();

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete ad",
      error: error.message,
    });
  }
};

// @desc    Toggle ad active status
// @route   PATCH /api/ads/:id/toggle
// @access  Private/Admin
export const toggleAdStatus = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    ad.isActive = !ad.isActive;
    ad.updatedBy = req.user._id;
    await ad.save();

    res.status(200).json({
      success: true,
      message: `Ad ${ad.isActive ? "activated" : "deactivated"} successfully`,
      data: ad,
    });
  } catch (error) {
    console.error("Error toggling ad status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle ad status",
      error: error.message,
    });
  }
};

export default {
  createAd,
  getAds,
  getAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  getPublicAds,
};
