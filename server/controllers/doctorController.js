import Doctor from "../models/Doctor.js";
import asyncHandler from "express-async-handler";

/* =====================================================
   CREATE DOCTOR
===================================================== */
export const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    specialization,
    qualification,
    experience,
    consultationFee,
    address,
    location,
    availability,
    nextAvailable,
    gender,
    languages,
    about,
    consultationType,
    featured,
    timeSlots,
    image,
  } = req.body;

  // ✅ Validate Base64 image
  if (!image || !image.startsWith("data:image")) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid base64 image",
    });
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    qualification,
    experience,
    consultationFee,
    address,
    location,
    availability,
    nextAvailable,
    gender,
    languages,
    about,
    consultationType,
    featured,
    timeSlots,
    image, // storing base64
  });

  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    data: doctor,
  });
});

/* =====================================================
   GET ALL DOCTORS (Search + Filter + Pagination)
===================================================== */
export const getDoctors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    specialization,
    gender,
    featured,
    search,
  } = req.query;

  const query = {};

  if (specialization) query.specialization = specialization;
  if (gender) query.gender = gender;
  if (featured) query.featured = featured;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const doctors = await Doctor.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Doctor.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: doctors,
  });
});

/* =====================================================
   GET SINGLE DOCTOR (by ID or Slug)
===================================================== */
export const getDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor =
    (await Doctor.findById(id)) || (await Doctor.findOne({ slug: id }));

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

/* =====================================================
   UPDATE DOCTOR
===================================================== */
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  Object.assign(doctor, req.body);
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

/* =====================================================
   DELETE DOCTOR
===================================================== */
export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
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
