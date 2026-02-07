import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import TrayaStyleHome from './pages/home';
import StartAssessment from './pages/assessment/StartAssessment.jsx';
import AnalysisResults from './pages/assessment/Analysisresults.jsx';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
<<<<<<< HEAD
import Contact from './pages/Contact';

=======
>>>>>>> 1748107362eefabcc9e0650aaad58fcb6f438016
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login.jsx';

import FindDoctors from './pages/FindDoctors';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/admin/Dashboard';

// Admin - Users
import UserList from './pages/admin/Users/UserList';
import UserDetail from './pages/admin/Users/UserDetail';

// Admin - Products
import ProductList from './pages/admin/Products/ProductList';
import ProductCreate from './pages/admin/Products/ProductCreate';

// Admin - Orders
import OrderList from './pages/admin/Orders/OrderList';
import OrderDetail from './pages/admin/Orders/OrderDetail';

// Admin - Assessments
import AssessmentList from './pages/admin/Assessments/AssessmentList';

function App() {
  const [assessmentData, setAssessmentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncAuthState = () => {
      const storedToken = window.localStorage.getItem('authToken');
      const storedUser = window.localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          window.localStorage.removeItem('authUser');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    syncAuthState();
    window.addEventListener('auth:updated', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth:updated', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const handleAssessmentComplete = (data) => {
    console.log('Assessment completed:', data);
    setAssessmentData(data);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      try {
        if (userData?.token) {
          window.localStorage.setItem('authToken', userData.token);
        }
        window.localStorage.setItem('authUser', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth:updated'));
      } catch (error) {
        console.error('Failed to persist auth user', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authUser');
      window.dispatchEvent(new Event('auth:updated'));
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
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />

<<<<<<< HEAD
        {/* Layout Wrapper with Conditional Header/Footer */}
        <Layout isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<TrayaStyleHome />} />
            <Route path="/contact" element={<Contact />} />
=======
        <Routes>
          {/* ============================================ */}
          {/* ADMIN ROUTES (No Header/Footer) */}
          {/* ============================================ */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
>>>>>>> 1748107362eefabcc9e0650aaad58fcb6f438016
            
            {/* Users Management */}
            <Route path="users" element={<UserList />} />
            <Route path="users/:id" element={<UserDetail />} />
            
            {/* Products Management */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/:id/edit" element={<ProductCreate />} />
            
            {/* Orders Management */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            
            {/* Assessments Management */}
            <Route path="assessments" element={<AssessmentList />} />
            
            {/* Placeholder Routes */}
            <Route path="content" element={<ComingSoon title="Content Management" />} />
            <Route path="analytics" element={<ComingSoon title="Analytics & Reports" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* ============================================ */}
          {/* PUBLIC ROUTES (With Header/Footer) */}
          {/* ============================================ */}
          <Route path="/*" element={
            <Layout isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<TrayaStyleHome />} />
                
                {/* Assessment Flow */}
                <Route
                  path="/assessment"
                  element={<AssessmentWrapper onComplete={handleAssessmentComplete} />}
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

                <Route path="/find-doctors" element={<FindDoctors />} />

                {/* Products */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Auth */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Layout Component - Conditionally renders Header/Footer
 */
const Layout = ({ isAuthenticated, user, onLogout, children }) => {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/assessment';

  return (
    <>
      {!hideHeaderFooter && <Header isAuthenticated={isAuthenticated} user={user} onLogout={onLogout} />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
};

/**
 * Assessment Wrapper Component
 */
const AssessmentWrapper = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleComplete = (data) => {
    onComplete(data);
    navigate('/results');
  };

  return <StartAssessment onComplete={handleComplete} />;
};

/**
 * Coming Soon Component (for admin placeholder pages)
 */
const ComingSoon = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600">This page is under construction</p>
      </div>
    </div>
  );
};

/**
 * 404 Not Found Component
 */
const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-6xl font-display font-bold text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg"
        >
          <span>Go Home</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default App;