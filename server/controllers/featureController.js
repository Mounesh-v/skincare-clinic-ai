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
    const features = await Feature.find();
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
