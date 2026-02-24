import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  toggleFeatured,
  updateDoctorRating,
} from "../controllers/doctorController.js";
import { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// Public reads
router.get("/", getDoctors);
router.get("/:id", getDoctor);

// Admin-only mutations
router.post("/", verifyAdmin, createDoctor);
router.put("/:id", verifyAdmin, updateDoctor);
router.delete("/:id", verifyAdmin, deleteDoctor);
router.patch("/:id/featured", verifyAdmin, toggleFeatured);
router.patch("/:id/rating", verifyAdmin, updateDoctorRating);

export default router;
