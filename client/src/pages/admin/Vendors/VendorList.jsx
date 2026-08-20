import React, { useState, useEffect, useCallback } from "react";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import DataTable from "../../../components/admin/DataTable";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.get("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data.vendors || []);
    } catch (error) {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.patch(
        `/api/admin/vendors/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? res.data.vendor : v)),
      );
      toast.success(
        `${res.data.vendor.businessName} ${
          status === "Approved" ? "approved" : "rejected"
        } successfully`,
      );
    } catch (error) {
      toast.error("Failed to update vendor status");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = vendors.filter((v) => v.status === "Pending").length;
  const approvedCount = vendors.filter((v) => v.status === "Approved").length;
  const rejectedCount = vendors.filter((v) => v.status === "Rejected").length;

  const columns = [
    {
      header: "Vendor",
      accessor: "businessName",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">
              {row.ownerName} · {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "phone",
      render: (value, row) => (
        <div className="text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {value || "-"}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {[row.city, row.state].filter(Boolean).join(", ") || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Registered",
      accessor: "createdAt",
      render: (value) => (
        <span className="text-sm text-slate-600">
          {value
            ? new Date(value).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1">
            Review vendor registrations and manage their status
          </p>
        </div>
        <button
          onClick={fetchVendors}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {rejectedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-slate-500">Loading vendors...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={vendors}
          searchPlaceholder="Search vendors by name, email, or phone..."
          actions={(row) => (
            <div className="flex items-center gap-2">
              {row.status !== "Approved" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(row._id, "Approved");
                  }}
                  disabled={updatingId === row._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}
              {row.status !== "Rejected" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(row._id, "Rejected");
                  }}
                  disabled={updatingId === row._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}
              <a
                href={`mailto:${row.email}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                title="Send Email"
              >
                <Mail className="w-4 h-4 text-slate-600" />
              </a>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default VendorList;