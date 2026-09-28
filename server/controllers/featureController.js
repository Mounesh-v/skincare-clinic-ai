import Feature from "../models/Feature.js";

// @desc    Create a new feature
// @route   POST /api/features/add-feature
// @access  Private (Admin only)
export const createFeature = async (req, res) => {
  try {
    const { Adname, Adddescription, Addimage } = req.body;

    if (!Adname || !Adddescription || !Addimage) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newFeature = await Feature.create({
      Adname,
      Adddescription,
      Addimage,
    });

    res.status(201).json({
      success: true,
      data: newFeature,
      message: "Feature created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get all features
export const getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: features,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Update a feature
// @route   PUT /api/features/:id
// @access  Private (Admin only)
export const updateFeature = async (req, res) => {
  try {
    const { Adname, Adddescription, Addimage } = req.body;

    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      { Adname, Adddescription, Addimage },
      { new: true }
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feature,
      message: "Feature updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Delete a feature
// @route   DELETE /api/features/:id
// @access  Private (Admin only)
export const deleteFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
