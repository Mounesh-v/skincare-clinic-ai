import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { createUser, deleteUser, getAllUsers, getUserById, loginUser, updateUser, updateUserStatus } from "../controllers/register.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Email/Password authentication routes
router.post("/register", createUser);
router.post("/login", loginUser);

// Google OAuth routes
router.get(
    "/google",
    (req, res, next) => {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Google OAuth is not configured on this server. Please check your .env file."
            });
        }
        passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }
);

router.get(
    "/google/callback",
    (req, res, next) => {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return res.status(500).json({ success: false, message: "Google OAuth not configured" });
        }
        passport.authenticate("google", { failureRedirect: "/login" })(req, res, next);
    },
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Redirect to frontend with token in URL
        const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
        res.redirect(`${clientURL}/auth/callback?token=${token}&provider=google`);
    }
);

// Facebook OAuth routes
router.get(
    "/facebook",
    (req, res, next) => {
        if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Facebook OAuth is not configured on this server. Please check your .env file."
            });
        }
        passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
    }
);

router.get(
    "/facebook/callback",
    (req, res, next) => {
        if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
            return res.status(500).json({ success: false, message: "Facebook OAuth not configured" });
        }
        passport.authenticate("facebook", { failureRedirect: "/login" })(req, res, next);
    },
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Redirect to frontend with token in URL
        const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
        res.redirect(`${clientURL}/auth/callback?token=${token}&provider=facebook`);
    }
);

// Logout route
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Session destruction failed" });
            }
            res.json({ success: true, message: "Logged out successfully" });
        });
    });
});

// Get current user
router.get("/me", async (req, res) => {
    try {
        // Check for JWT token in Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const Register = (await import("../models/Register.js")).default;
        const user = await Register.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                provider: user.provider
            }
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

router.get("/users", verifyToken,getAllUsers);

router.get("/user/:id",verifyToken,getUserById);

router.put("/user/:id",verifyToken,updateUser)
router.patch("/users/:id/status",verifyToken,updateUserStatus);
router.delete("/users/:id",verifyToken,deleteUser);

export default router;
