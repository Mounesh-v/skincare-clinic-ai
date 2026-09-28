import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Store,
  CheckCircle,
  XCircle,
  BellRing,
  BellOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import NotificationBell from "../common/NotificationBell";
import { useNotifications } from "../../context/NotificationContext";

const AdminHeader = ({ isOpen, setOpen }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const { isSubscribed, subscribeToPush, pushPermission } = useNotifications();

  const adminUser = JSON.parse(localStorage.getItem("authUser")) || {};

  const fetchPendingVendors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.get("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingVendors(
        (res.data.vendors || []).filter((v) => v.status === "Pending"),
      );
    } catch (error) {
      // silent
    }
  };

  useEffect(() => {
    fetchPendingVendors();
    const interval = setInterval(fetchPendingVendors, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateVendorStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await api.patch(
        `/api/admin/vendors/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingVendors((prev) => prev.filter((v) => v._id !== id));
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    window.dispatchEvent(new Event("auth:updated"));

    navigate("/login");
  };

  const handleEnableNotifications = async () => {
    if (isSubscribed) {
      toast.success("Notifications are already enabled");
      return;
    }
    toast.loading("Enabling notifications...", { id: "push-subscribe" });
    const result = await subscribeToPush();
    toast.dismiss("push-subscribe");
    if (result) {
      toast.success("Notifications enabled! You'll receive device notifications.");
    } else {
      toast.error("Failed to enable notifications. Check console for details.");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!isOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Enable Push Notifications Button */}
          <button
            onClick={handleEnableNotifications}
            className={`relative p-2 rounded-lg transition-colors ${
              isSubscribed
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100 animate-pulse"
            }`}
            title={isSubscribed ? "Push notifications enabled" : "Click to enable push notifications"}
          >
            {isSubscribed ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-lg transition"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                {adminUser.avatar ? (
                  <img src={adminUser.avatar} alt="Admin" />
                ) : (
                  adminUser.name?.charAt(0)?.toUpperCase() || <User />
                )}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold">
                  {adminUser.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {adminUser.role || "administrator"}
                </p>
              </div>
            </button>

            {/* ================= DROPDOWN ================= */}
            {openMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-sm">{adminUser.name}</p>
                  <p className="text-xs text-slate-500">{adminUser.email}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>

                <button
                  onClick={() => navigate("/admin/settings")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
                >
                  <Settings size={18} />
                  Settings
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-sm border-t"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
