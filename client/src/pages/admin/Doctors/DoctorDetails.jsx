import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Clock,
  Globe,
  DollarSign,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = "http://localhost:5005/api"; // ← adjust port if needed

const DoctorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(`${API_BASE_URL}/doctors/${id}`, {
          timeout: 10000,
        });

        if (!data?.success || !data?.data) {
          throw new Error("Invalid response format");
        }

        const doc = data.data;

        setDoctor({
          id: doc._id,
          name: doc.name || "—",
          image: doc.image || "/api/placeholder/240/240",
          specialization: doc.specialization || "Not specified",
          qualification: doc.qualification || "—",
          experience: doc.experience ? `${doc.experience} years` : "—",
          rating: Number(doc.ratings?.average?.toFixed(1)) || 0,
          reviewCount: doc.reviews || 0,
          status: doc.status || "Inactive",
          address: doc.address || "—",
          availability: doc.availability?.length
            ? doc.availability.join(" • ")
            : null,
          languages: doc.languages || [],
          fee: doc.consultationFee || 0,
          joined: doc.createdAt
            ? new Date(doc.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—",
          about: doc.about?.trim() || null,
          email: doc.email || null,
          phone: doc.phone || null,
        });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load doctor profile";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this doctor profile permanently?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/doctors/${id}`);
      toast.success("Doctor profile deleted");
      navigate("/admin/doctors", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleStatus = async () => {
    if (!doctor) return;

    const newStatus = doctor.status === "Active" ? "Inactive" : "Active";

    try {
      setDoctor((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Doctor marked as ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (loading) {
    return <DoctorDetailSkeleton />;
  }

  if (error || !doctor) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  const statusStyle =
    doctor.status === "Active"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : doctor.status === "On Leave"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Doctors</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/doctors/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit size={16} />
              Edit Profile
            </button>

            <button
              onClick={toggleStatus}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors shadow-sm ${
                doctor.status === "Active"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {doctor.status === "Active" ? (
                <UserX size={16} />
              ) : (
                <UserCheck size={16} />
              )}
              {doctor.status === "Active" ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left + Center – Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Hero Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 lg:p-8 flex flex-col sm:flex-row gap-6 lg:gap-8">
                <div className="shrink-0">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl object-cover border-4 border-white shadow-md"
                    onError={(e) => (e.target.src = "/api/placeholder/240/240")}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                        {doctor.name}
                      </h1>
                      <p className="text-xl text-emerald-600 font-semibold mt-1">
                        {doctor.specialization}
                      </p>
                      <p className="text-slate-600 mt-1">
                        {doctor.qualification}
                      </p>
                    </div>

                    <span
                      className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium border ${statusStyle}`}
                    >
                      {doctor.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-5 mt-5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star
                        size={18}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="font-semibold text-slate-900">
                        {doctor.rating}
                      </span>
                      <span className="text-slate-500">
                        ({doctor.reviewCount}{" "}
                        {doctor.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      <BriefcaseBusiness size={18} />
                      <span>{doctor.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <StatCard
                label="Consultation Fee"
                value={`₹${doctor.fee.toLocaleString()}`}
                icon={<DollarSign size={24} className="text-blue-600" />}
                bg="from-blue-50 to-cyan-50"
              />
              <StatCard
                label="Average Rating"
                value={`${doctor.rating} ★`}
                icon={
                  <Star size={24} className="text-yellow-500 fill-yellow-500" />
                }
                bg="from-amber-50 to-orange-50"
              />
              <StatCard
                label="Reviews"
                value={doctor.reviewCount.toLocaleString()}
                icon={<span className="text-2xl">💬</span>}
                bg="from-emerald-50 to-teal-50"
              />
            </div>

            {/* About */}
            {doctor.about && (
              <section className="bg-white rounded-xl shadow-sm border p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Professional Summary
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {doctor.about}
                </p>
              </section>
            )}

            {/* Placeholder for future sections */}
            <section className="bg-white rounded-xl shadow-sm border p-6 lg:p-8 text-center text-slate-500 py-12">
              <p className="text-lg">
                Education • Specialties • Awards • Reviews
              </p>
              <p className="mt-2">Additional profile sections coming soon</p>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6 lg:space-y-8">
            {/* Contact & Availability */}
            <div className="bg-white rounded-xl shadow-sm border divide-y divide-slate-100">
              <div className="p-6 lg:p-7">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Contact Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail size={18} className="text-slate-400" />
                    <span>{doctor.email || "Not provided"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone size={18} className="text-slate-400" />
                    <span>{doctor.phone || "Not provided"}</span>
                  </div>

                  <div className="flex items-start gap-3 text-slate-700">
                    <MapPin size={18} className="text-slate-400 mt-0.5" />
                    <span>{doctor.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-7">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Availability
                </h3>
                <div className="space-y-4">
                  {doctor.availability ? (
                    <div className="flex items-start gap-3 text-slate-700">
                      <Clock size={18} className="text-slate-400 mt-0.5" />
                      <span>{doctor.availability}</span>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      Availability not specified
                    </p>
                  )}

                  {doctor.languages.length > 0 && (
                    <div className="flex items-start gap-3 text-slate-700">
                      <Globe size={18} className="text-slate-400 mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {doctor.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6 lg:p-7">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Doctor ID</dt>
                  <dd className="font-mono font-medium text-slate-900 mt-0.5">
                    {doctor.id.substring(0, 8)}...
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Joined</dt>
                  <dd className="flex items-center gap-2 text-slate-900 mt-0.5">
                    <Calendar size={16} className="text-slate-400" />
                    {doctor.joined}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Reusable Components
───────────────────────────────────────────────── */

function StatCard({ label, value, icon, bg }) {
  return (
    <div
      className={`bg-gradient-to-br ${bg} border border-slate-200/70 rounded-xl p-5 lg:p-6 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1.5">
            {value}
          </p>
        </div>
        <div className="opacity-90">{icon}</div>
      </div>
    </div>
  );
}

function DoctorDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border h-48" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-80 bg-slate-100 rounded-xl" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Something went wrong
      </h2>
      <p className="text-slate-600 mb-8">
        {error || "We couldn't load this doctor's profile."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default DoctorDetail;
