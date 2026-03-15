import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import './index.css';

// Layout & Guard
import VendorLayout from "./layout/VendorLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import VendorRegistration from "./pages/vendorRegistration";
import PendingApproval from "./pages/pendingApproval";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/vendorDashboard";
import ManageProducts from "./pages/manageProducts";
import OrdersManagement from "./pages/orderManagement";
import VendorSettings from "./pages/vendorSettings";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            padding: "16px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<VendorLogin />} />
        <Route path="/register" element={<VendorRegistration />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Protected Layout Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="vendor/products" element={<ManageProducts />} />
          <Route path="vendor/orders" element={<OrdersManagement />} />
          <Route path="vendor/settings" element={<VendorSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">Page not found</p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          <span>Go to Dashboard</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default App;
