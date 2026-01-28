import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages - Traya Style
import TrayaStyleHome from './pages/home';
// import SkinAssessmentQuiz from './components/assessment/SkinAssessmentQuiz';
// import AnalysisResults from './pages/AnalysisResults';

// Auth Pages (to be created)
// import Login from './pages/auth/Login';
// import Signup from './pages/auth/Signup';

// Other Pages (to be created)
// import DoctorSelection from './pages/DoctorSelection';
// import Consultation from './pages/Consultation';
// import Checkout from './pages/Checkout';
// import Dashboard from './pages/Dashboard';
// import Profile from './pages/Profile';

// Styles
// import './styles/globals.css';

/**
 * Main App Component - Traya-Style Skincare Clinic
 * 
 * Complete routing with assessment flow
 */
function App() {
  // Assessment state management
  const [assessmentData, setAssessmentData] = useState(null);
  
  // Mock authentication state (replace with actual auth context)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Handle assessment completion
  const handleAssessmentComplete = (data) => {
    console.log('Assessment completed:', data);
    setAssessmentData(data);
    // In production, save to backend/context
  };

  // Mock login (replace with actual auth)
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Mock logout (replace with actual auth)
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Toast Notifications */}
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

        {/* Header - Shows on all pages except assessment */}
        <Routes>
          <Route path="/assessment" element={null} />
          <Route path="*" element={<Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />} />
        </Routes>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<TrayaStyleHome />} />
            
            {/* Assessment Flow */}
            <Route 
              path="/assessment" 
              element={
                <AssessmentWrapper onComplete={handleAssessmentComplete} />
              } 
            />
            
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

            {/* Auth Routes - Uncomment when created */}
            {/* <Route path="/login" element={<Login onLogin={handleLogin} />} /> */}
            {/* <Route path="/signup" element={<Signup />} /> */}

            {/* Other Public Routes - Uncomment when created */}
            {/* <Route path="/doctors" element={<DoctorSelection />} /> */}
            {/* <Route path="/how-it-works" element={<HowItWorks />} /> */}
            {/* <Route path="/pricing" element={<Pricing />} /> */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/contact" element={<Contact />} /> */}

            {/* Checkout - Uncomment when created */}
            {/* <Route path="/checkout" element={<Checkout />} /> */}

            {/* Protected Routes - Uncomment when created */}
            {/* <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
              } 
            /> */}
            {/* <Route 
              path="/consultation" 
              element={
                isAuthenticated ? <Consultation /> : <Navigate to="/login" replace />
              } 
            /> */}
            {/* <Route 
              path="/profile" 
              element={
                isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
              } 
            /> */}

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer - Shows on all pages except assessment */}
        <Routes>
          <Route path="/assessment" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Assessment Wrapper Component
 * Wraps the quiz with navigation capability
 */
const AssessmentWrapper = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleComplete = (data) => {
    onComplete(data);
    navigate('/results');
  };

  return <SkinAssessmentQuiz onComplete={handleComplete} />;
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