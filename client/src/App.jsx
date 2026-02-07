import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import TrayaStyleHome from './pages/home';
import StartAssessment from './pages/assessment/StartAssessment.jsx';
import AnalysisResults from './pages/assessment/Analysisresults.jsx';


import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import Contact from './pages/Contact';

import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login.jsx';

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

        {/* Layout Wrapper with Conditional Header/Footer */}
        <Layout isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<TrayaStyleHome />} />
            <Route path="/contact" element={<Contact />} />
            
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

            {/* Uncomment when these pages are created */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
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
