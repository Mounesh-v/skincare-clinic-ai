import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  UserCheck,
  UserX,
  Award,
} from "lucide-react";
import DataTable from "../../../components/admin/DataTable";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = "http://localhost:5005/api";

const DoctorList = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/doctors`);
        const formmatedDoctors = res.data.data.map((doc) => ({
          id: doc._id,
          slug: doc.slug, // useful for public profile links if needed
          name: doc.name,
          image: doc.image, // base64 or cloud URL
          specialization: doc.specialization,
          qualification: doc.qualification,
          experience: `${doc.experience} years`,
          rating: doc.ratings?.average?.toFixed(1) || 0,
          consultations: doc.reviews || 0, // using reviews count as proxy
          status: doc.status,
          languages: doc.languages || [],
        }));
        setDoctors(formmatedDoctors);
        console.log(formmatedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", err);
        const message = err.response?.data?.message || "Could not load doctors";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/doctors/${id}`);
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Doctor deleted successfully");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete doctor";
      toast.error(msg);
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      setDoctors(
        doctors.map((doc) =>
          doc.id === id ? { ...doc, status: newStatus } : doc,
        ),
      );
      toast.success(
        `Doctor ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    toast.success("Export feature coming soon...");
  };

  const columns = [
    {
      header: "Doctor",
      accessor: "name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || "/api/placeholder/100/100"}
            alt={value}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
            onError={(e) => {
              e.target.src = "/api/placeholder/100/100";
            }}
          />
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Qualification",
      accessor: "qualification",
      render: (value) => (
        <span
          className="text-sm text-slate-700 max-w-xs block truncate"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Experience",
      accessor: "experience",
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-slate-900">{value}</span>
          </div>
          <span className="text-xs text-slate-500">({row.consultations})</span>
        </div>
      ),
    },
    {
      header: "Reviews",
      accessor: "consultations",
      render: (value) => (
        <span className="font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => {
        const statusColors = {
          Active: "bg-green-100 text-green-700",
          Inactive: "bg-slate-100 text-slate-700",
          "On Leave": "bg-yellow-100 text-yellow-700",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-700"}`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-2">Error loading doctors</p>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage all doctors and their profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => navigate("/admin/doctors/create")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Doctors</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {doctors.length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active Doctors</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {doctors.filter((d) => d.status === "Active").length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Reviews</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {doctors
              .reduce((sum, d) => sum + d.consultations, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Avg Rating</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {doctors.length > 0
              ? (
                  doctors.reduce((sum, d) => sum + Number(d.rating), 0) /
                  doctors.length
                ).toFixed(1)
              : "—"}{" "}
            ⭐
          </p>
        </div>
      </div>

      {/* Doctors Table */}
      <DataTable
        columns={columns}
        data={doctors}
        onRowClick={(row) => navigate(`/admin/doctors/${row.id}`)} // or use slug: `/admin/doctors/${row.slug}`
        searchPlaceholder="Search by name, specialization, qualification..."
        isLoading={loading}
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/doctors/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/doctors/${row.id}/edit`);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row.id, row.status);
              }}
              className={`p-2 hover:${row.status === "Active" ? "bg-red-50" : "bg-green-50"} rounded-lg transition-colors`}
              title={row.status === "Active" ? "Deactivate" : "Activate"}
            >
              {row.status === "Active" ? (
                <UserX className="w-4 h-4 text-red-600" />
              ) : (
                <UserCheck className="w-4 h-4 text-green-600" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default DoctorList;
