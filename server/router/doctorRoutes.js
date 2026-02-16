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

const router = express.Router();

router.route("/")
  .post(createDoctor)
  .get(getDoctors);

router.route("/:id")
  .get(getDoctor)
  .put(updateDoctor)
  .delete(deleteDoctor);

router.patch("/:id/featured", toggleFeatured);
router.patch("/:id/rating", updateDoctorRating);

export default router;
