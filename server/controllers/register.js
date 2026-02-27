import Register from "../models/Register.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      agreeToTerms
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        agreeToTerms: user.agreeToTerms
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
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
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

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
      { expiresIn: "7d" }
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
