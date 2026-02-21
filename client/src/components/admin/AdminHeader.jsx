import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem("authUser")) || {};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    window.dispatchEvent(new Event("auth:updated"));

    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

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
