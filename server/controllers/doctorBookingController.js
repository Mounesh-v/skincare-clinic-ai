import DoctorBooking from "../models/DoctorBooking.js";
import Doctor from "../models/Doctor.js";
import { notifyAdmin } from "./notificationController.js";

export const createDoctorBooking = async (req, res) => {
  try {
    const { doctorId, patientName, patientEmail, patientPhone, consultationType, preferredDate, preferredTime, reason } = req.body;

    if (!doctorId || !patientName || !patientEmail || !patientPhone || !consultationType || !preferredDate || !preferredTime) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const booking = await DoctorBooking.create({
      doctorId,
      doctorName: doctor.name,
      patientName,
      patientEmail,
      patientPhone,
      consultationType,
      preferredDate,
      preferredTime,
      reason,
    });

    notifyAdmin({
      type: "booking",
      title: "New Doctor Appointment",
      message: `${patientName} booked a ${consultationType} consultation with Dr. ${doctor.name} on ${new Date(preferredDate).toLocaleDateString()}.`,
      data: { bookingId: booking._id, doctorId, doctorName: doctor.name, patientEmail, actions: [{ action: "open", title: "View" }, { action: "dismiss", title: "Dismiss" }] },
      link: `/admin/doctor-bookings`,
    }).catch(() => {});

    res.status(201).json({ success: true, message: "Appointment booked successfully", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorBookings = async (req, res) => {
  try {
    const bookings = await DoctorBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
