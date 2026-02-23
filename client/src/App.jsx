import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/admin/AdminLayout";

// Public Pages
import TrayaStyleHome from './pages/home';
import StartAssessment from './pages/assessment/StartAssessment.jsx';
import AnalysisResults from './pages/assessment/Analysisresults.jsx';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import Contact from './pages/Contact';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login.jsx';
import AuthCallback from './pages/auth/AuthCallback.jsx';
import FindDoctors from './pages/FindDoctors';
import OurScience from './pages/OurScience';
import Ingredients from './pages/Ingredients';
import ClinicalStudies from './pages/ClinicalStudies';
import About from './pages/about';
import Story from './pages/story.jsx';

// Admin Pages
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRoute from "./pages/auth/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";

// Admin - Users
import UserList from "./pages/admin/Users/UserList";
import UserDetail from "./pages/admin/Users/UserDetail";

// Admin - Products
import ProductList from "./pages/admin/Products/ProductList";
import ProductCreate from "./pages/admin/Products/ProductCreate";
import ProductView from "./pages/admin/Products/ProductView";
import ProductEdit from "./pages/admin/Products/ProductEdit";

// Admin - Orders
import OrderList from "./pages/admin/Orders/OrderList";
import OrderDetail from "./pages/admin/Orders/OrderDetail";

// Admin - Assessments
import AssessmentList from "./pages/admin/Assessments/AssessmentList";

// Admin - Doctors
import DoctorList from "./pages/admin/Doctors/DoctorList";
import DoctorDetails from "./pages/admin/Doctors/DoctorDetails";
import DoctorCreate from "./pages/admin/Doctors/DoctorCreate";

function App() {
  const [assessmentData, setAssessmentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncAuthState = () => {
      const storedToken = window.localStorage.getItem("authToken");
      const storedUser = window.localStorage.getItem("authUser");
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          window.localStorage.removeItem("authUser");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    syncAuthState();
    window.addEventListener("auth:updated", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth:updated", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const handleAssessmentComplete = (data) => {
    setAssessmentData(data);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("authUser");
      window.dispatchEvent(new Event("auth:updated"));
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
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
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* ============================================ */}
          {/* ADMIN ROUTES (No Header/Footer) */}
          {/* ============================================ */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Users Management */}
            <Route path="users" element={<UserList />} />
            <Route path="users/:id" element={<UserDetail />} />

            {/* Products Management */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductView />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />

            {/* Orders Management */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />

            {/* Assessments Management */}
            <Route path="assessments" element={<AssessmentList />} />

            {/* Doctors Management */}
            <Route path="doctors" element={<DoctorList />} />
            <Route path="doctors/create" element={<DoctorCreate />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
            <Route path="doctors/:id/edit" element={<DoctorCreate />} />

            {/* Placeholder Routes */}
            <Route
              path="content"
              element={<ComingSoon title="Content Management" />}
            />
            <Route
              path="analytics"
              element={<ComingSoon title="Analytics & Reports" />}
            />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* ============================================ */}
          {/* PUBLIC ROUTES (With Header/Footer) */}
          {/* ============================================ */}
          <Route
            path="/*"
            element={
              <PublicAppRoutes
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogout}
                assessmentData={assessmentData}
                onAssessmentComplete={handleAssessmentComplete}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Public Routes Component (with Header/Footer)
 */
function PublicAppRoutes({
  isAuthenticated,
  user,
  onLogout,
  assessmentData,
  onAssessmentComplete,
}) {
  return (
    <Layout isAuthenticated={isAuthenticated} user={user} onLogout={onLogout}>
      <Routes>
        {/* Home */}
        <Route path="/" element={<TrayaStyleHome />} />

        {/* New Pages */}
        <Route path="/science" element={<OurScience />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/ClinicalStudies" element={<ClinicalStudies />} />
        <Route path="/about" element={<About />} />
        <Route path="/story" element={<Story />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* Assessment Flow */}
        <Route
          path="/assessment"
          element={<AssessmentWrapper onComplete={onAssessmentComplete} />}
        />

        {/* Results Page */}
        <Route
          path="/results"
          element={
            assessmentData ? (
              <AnalysisResults assessmentData={assessmentData} />
            ) : (
              <Navigate to="/assessment" replace />
            )
          }
        />

        {/* Find Doctors */}
        <Route path="/find-doctors" element={<FindDoctors />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetail />} />

        {/* Checkout */}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

/**
 * Layout Component - Conditionally renders Header/Footer
 */
function Layout({ isAuthenticated, user, onLogout, children }) {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/assessment";

  return (
    <>
      {!hideHeaderFooter && (
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={onLogout}
        />
      )}
      <main className="flex-grow">{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

/**
 * Assessment Wrapper Component
 */
function AssessmentWrapper({ onComplete }) {
  const navigate = useNavigate();

  const handleComplete = (data) => {
    onComplete(data);
    navigate("/results");
  };

  return <StartAssessment onComplete={handleComplete} />;
}

/**
 * Coming Soon Component (for admin placeholder pages)
 */
function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600">This page is under construction</p>
      </div>
    </div>
  );
}

/**
 * 404 Not Found Component
 */
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-6xl font-display font-bold text-slate-900 mb-4">
          404
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg"
        >
          <span>Go Home</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default App;