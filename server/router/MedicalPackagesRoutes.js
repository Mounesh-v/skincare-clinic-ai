import express from "express";
import {
  createBooking,
  createOffer,
  deleteOffer,
  getOffer,
  getSingleOffer,
  updateOffer,
} from "../controllers/MedicalPackagesController.js";
import { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// USER
router.get("/", getOffer);
router.get("/:id", getSingleOffer);
router.post("/booking", createBooking);

// ADMIN
router.post("/", verifyAdmin, createOffer);
router.put("/:id", verifyAdmin, updateOffer);
router.delete("/:id", verifyAdmin, deleteOffer);

export default router;
