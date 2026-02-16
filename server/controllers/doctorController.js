import Doctor from "../models/Doctor.js";
import asyncHandler from "express-async-handler";

/* CREATE */
export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    success: true,
    data: doctor,
  });
});

/* GET ALL */
export const getDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
      { qualification: { $regex: search, $options: "i" } },
    ];
  }

  const doctors = await Doctor.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Doctor.countDocuments(query);

  res.json({
    success: true,
    total,
    data: doctors,
  });
});

/* GET ONE */
export const getDoctor = asyncHandler(async (req, res) => {
  const doctor =
    (await Doctor.findById(req.params.id)) ||
    (await Doctor.findOne({ slug: req.params.id }));

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json({ success: true, data: doctor });
});

/* UPDATE */
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "specialization",
    "qualification",
    "experience",
    "consultationFee",
    "address",
    "gender",
    "availability",
    "languages",
    "about",
    "consultationType",
    "image",
    "status",
    "featured",
    "location",
    "nextAvailable",
    "timeSlots",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      doctor[field] = req.body[field];
    }
  });

  await doctor.save();

  res.json({ success: true, data: doctor });
});

/* DELETE */
export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  await doctor.deleteOne();

  res.json({ success: true, message: "Doctor deleted successfully" });
});

/* =====================================================
   TOGGLE FEATURED
===================================================== */
export const toggleFeatured = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  doctor.featured = !doctor.featured;
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor featured status updated",
    featured: doctor.featured,
  });
});

/* =====================================================
   UPDATE RATING
===================================================== */
export const updateDoctorRating = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  doctor.ratings.count += 1;
  doctor.ratings.average =
    (doctor.ratings.average * (doctor.ratings.count - 1) + rating) /
    doctor.ratings.count;

  doctor.reviews += 1;

  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Rating updated",
    ratings: doctor.ratings,
  });
});
