import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = "http://localhost:5005/api";

const DoctorCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // we'll use only first image for now
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    address: "",
    gender: "Male",
    availability: [],
    languages: ["English"],
    about: "",
    consultationType: ["In-clinic"],
    featured: false,
    status: "Active",
    image: "",

    location: {
      lat: "",
      lng: "",
    },
    nextAvailable: "",
    timeSlots: [],
  });

  const availabilityOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // For edit mode – fetch existing doctor
  useEffect(() => {
    if (isEditMode) {
      const fetchDoctor = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/doctors/${id}`);
          const doc = res.data.data;

          setFormData({
            name: doc.name || "",
            specialization: doc.specialization || "",
            qualification: doc.qualification || "",
            experience: doc.experience?.toString() || "",
            consultationFee: doc.consultationFee?.toString() || "",
            address: doc.address || "",
            location: doc.location || { lat: "", lng: "" },
            availability: doc.availability || [],
            gender: doc.gender || "Other",
            languages: doc.languages || ["English"],
            about: doc.about || "",
            consultationType: doc.consultationType || ["In-clinic"],
            featured: doc.featured || false,
            timeSlots: doc.timeSlots || [],
            image: doc.image || "",
          });

          // Show existing image preview if available
          if (doc.image) {
            setImages([
              {
                id: "existing",
                preview: doc.image,
                file: null,
              },
            ]);
          }
        } catch (err) {
          toast.error("Failed to load doctor data");
        }
      };
      fetchDoctor();
    }
  }, [id, isEditMode]);

  const specializationOptions = [
    "Dermatologist",
    "Cosmetologist",
    "Trichologist",
    "Aesthetic Physician",
    "Hair Transplant Surgeon",
    "Laser Specialist",
    "Skin Care Expert",
    "Anti-Aging Specialist",
  ];

  const genderOptions = ["Male", "Female", "Other"];
  const consultationTypeOptions = ["In-clinic", "Video", "Home Visit"];
  const languageOptions = [
    "English",
    "Hindi",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Malayalam",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setImages([
        {
          id: Date.now(),
          file,
          preview: reader.result,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImages([]);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const toggleArrayItem = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.specialization)
      return toast.error("Specialization is required");
    if (!formData.qualification.trim())
      return toast.error("Qualification is required");
    if (!formData.experience) return toast.error("Experience is required");
    if (!formData.consultationFee)
      return toast.error("Consultation fee is required");
    if (!formData.address.trim()) return toast.error("Address is required");
    if (images.length === 0 && !isEditMode)
      return toast.error("Doctor image is required");

    setLoading(true);

    try {
      const payload = {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        // location: formData.location.lat && formData.location.lng ? formData.location : undefined,
      };

      let res;

      if (isEditMode) {
        res = await axios.put(`${API_BASE_URL}/doctors/${id}`, payload);
        toast.success("Doctor updated successfully!");
      } else {
        res = await axios.post(`${API_BASE_URL}/doctors`, payload);
        toast.success("Doctor created successfully!");
      }

      navigate("/admin/doctors");
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Doctor" : "Add New Doctor"}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode
                ? "Update doctor information"
                : "Fill in the details to add a new doctor"}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left + Center columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select...</option>
                  {specializationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Qualification *
                </label>
                <input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="MBBS, MD Dermatology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Experience (years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleNumberChange}
                  min="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleNumberChange}
                  min="0"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Clinic Address *
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="bg-white rounded-xl border p-6">
                <h2>Status</h2>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div>
                <label>Next Available Date</label>
                <input
                  type="date"
                  name="nextAvailable"
                  value={formData.nextAvailable}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">About Doctor</h2>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Brief professional summary..."
            />
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Languages Spoken</h2>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayItem("languages", lang)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    formData.languages.includes(lang)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Availability</h2>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleArrayItem("availability", day)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    formData.availability.includes(day)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Time Slots</h2>

            <input
              type="time"
              onBlur={(e) => {
                if (e.target.value) {
                  setFormData((prev) => ({
                    ...prev,
                    timeSlots: [...prev.timeSlots, e.target.value],
                  }));
                  e.target.value = "";
                }
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <div className="flex flex-wrap gap-2">
              {formData.timeSlots.map((time, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* Consultation Types */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Consultation Types</h2>
            <div className="flex flex-wrap gap-2">
              {consultationTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem("consultationType", type)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    formData.consultationType.includes(type)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Doctor Photo *</h2>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-500">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Upload Photo</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {images.length > 0 && (
                <div className="relative">
                  <img
                    src={images[0].preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
              />
              Featured Doctor
            </label>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || (!formData.image && !isEditMode)}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Doctor"
                    : "Create Doctor"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/doctors")}
                className="w-full py-3 border rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorCreate;
