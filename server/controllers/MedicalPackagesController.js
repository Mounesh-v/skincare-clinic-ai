import Booking from "../models/Booking.js";
import Offer from "../models/MedicalPackages.js";

export const createOffer = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      duration,
      price,
      originalPrice,
      discount,
      includes,
      journey,
      tags,
    } = req.body;

    if (
      !title ||
      !subtitle ||
      !duration ||
      !price ||
      !discount ||
      !originalPrice ||
      !journey ||
      !includes ||
      !tags
    ) {
      return res.status(400).json("All Fields Are Required");
    }

    const offer = await Offer.create({
      title,
      subtitle,
      duration,
      price,
      originalPrice,
      discount,
      includes,
      journey,
      tags,
    });

    return res.status(200).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.find().sort({ createdAt: -1 });
    return res.json(offer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Offer Updated successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: "Offer Deleted Successfully",
      deleteOffer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    return res.json({
      success: true,
      message: "Offer Fetched successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*

  Booking Medical Packages

*/

export const createBooking = async (req, res) => {
  try {
    const { userDetails, packageId } = req.body;

    if (!userDetails || !packageId) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    // get offer details
    const offer = await Offer.findById(packageId);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    const booking = await Booking.create({
      fullName: userDetails.fullName,
      mobile: userDetails.mobile,
      age: userDetails.age,
      skinType: userDetails.skinType,
      city: userDetails.city,

      packageId: offer._id,
      packageName: offer.title,
      amount: offer.price,
    });

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
