import Register from "../models/Register.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Assessment from "../models/Assessment.js";
import Order from "../models/Order.js";

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, agreeToTerms } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to terms and conditions",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const userExists = await Register.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await Register.create({
      name,
      email,
      password: hashPassword,
      agreeToTerms,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        agreeToTerms: user.agreeToTerms,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      // Duplicate key - email already exists
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ==========================
      ADMIN LOGIN CHECK
    ========================== */
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        message: "Admin login successful",
        token,
        user: {
          id: "admin",
          name: "Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    /* ==========================
        NORMAL USER LOGIN
    ========================== */

    const user = await Register.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email and password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "user",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = await Register.find()
      .select("-password -confirmPassword")
      .populate("assessments")
      .populate("orders")
      .lean();

    const formattedUsers = user.map((u) => ({
      ...u,
      assessments: u.assessments ? u.assessments.length : 0,
      orders: u.orders ? u.orders.length : 0,
    }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await Register.findById(req.params.id).select(
      "-password -confirmPassword",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await Register.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await Register.findById(req.params.id);

    user.status = user.status === "Active" ? "Banned" : "Active";

    await user.save();

    res.json({ message: "Status updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await Register.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
