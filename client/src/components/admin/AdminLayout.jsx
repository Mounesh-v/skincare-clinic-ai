import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Check if admin is authenticated
  const isAuthenticated = localStorage.getItem("adminToken");

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={isOpen} setOpen={setIsOpen} />
      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${isOpen ? "lg:ml-64" : "lg:ml-20"}`}
      >
        {/* Header */}
        <AdminHeader isOpen={isOpen} setOpen={setIsOpen} />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
