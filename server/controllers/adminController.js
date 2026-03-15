import Vendor from "../models/Vendor.js";
import jwt from "jsonwebtoken";

/**
 * Vendor registration – creates vendor with status Pending
 */
export const vendorRegister = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      password,
      confirmPassword,
      phone,
      businessAddress,
      city,
      state,
      zipCode,
      gstNumber,
      panNumber,
      bankAccountNumber,
      ifscCode,
      accountHolderName,
    } = req.body;

    if (!businessName || !ownerName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Business name, owner name, email and password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existing = await Vendor.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this email already exists",
      });
    }

    const vendor = await Vendor.create({
      businessName,
      ownerName,
      email,
      password,
      phone: phone || "",
      businessAddress: businessAddress || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      gstNumber: gstNumber || "",
      panNumber: panNumber || "",
      bankAccountNumber: bankAccountNumber || "",
      ifscCode: ifscCode || "",
      accountHolderName: accountHolderName || "",
      status: "Pending",
    });

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful. Your account is pending approval.",
      token,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Vendor login – only Approved vendors can access dashboard
 */
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const vendor = await Vendor.findOne({ email }).select("+password");
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (vendor.status !== "Approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval. You will be notified once approved.",
        status: vendor.status,
      });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get current vendor (protected)
 */
export const getVendorMe = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    res.json({
      success: true,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        phone: vendor.phone,
        businessAddress: vendor.businessAddress,
        city: vendor.city,
        state: vendor.state,
        zipCode: vendor.zipCode,
        gstNumber: vendor.gstNumber,
        panNumber: vendor.panNumber,
        bankAccountNumber: vendor.bankAccountNumber,
        ifscCode: vendor.ifscCode,
        accountHolderName: vendor.accountHolderName,
        status: vendor.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * List all vendors (platform admin only) – for approval workflow
 */
export const listVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Update vendor status – Approved | Rejected (platform admin only)
 */
export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use Approved, Rejected, or Pending.",
      });
    }
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    res.json({
      success: true,
      message: `Vendor ${status.toLowerCase()} successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
