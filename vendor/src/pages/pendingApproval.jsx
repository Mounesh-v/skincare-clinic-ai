import React from 'react';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          
          {/* Animated Clock Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 animate-pulse">
              <Clock className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Application Submitted Successfully!
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Your vendor registration is currently under review by our admin team.
          </p>

          {/* Status Timeline */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <div className="space-y-4">
              
              {/* Step 1: Submitted */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">Application Submitted</p>
                  <p className="text-sm text-slate-500">Your details have been received</p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="ml-4 border-l-2 border-amber-300 h-8"></div>

              {/* Step 2: Under Review */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">Under Review</p>
                  <p className="text-sm text-slate-500">Admin is reviewing your application</p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="ml-4 border-l-2 border-slate-200 h-8"></div>

              {/* Step 3: Approval Pending */}
              <div className="flex items-center gap-4 opacity-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">Approval Decision</p>
                  <p className="text-sm text-slate-500">You'll receive an email notification</p>
                </div>
              </div>

            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">What to expect:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Review typically takes 24-48 hours</li>
                  <li>• Check your email (including spam folder)</li>
                  <li>• You can log in once approved</li>
                  <li>• Contact support if you don't hear back in 48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-slate-600 mb-4">Already approved? Sign in to your dashboard.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Sign in
              </Link>
              <a
                href="mailto:vendor-support@skincare.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Mail className="h-5 w-5" />
                Email Support
              </a>
            </div>
          </div>

        </div>

        {/* Additional Help Card */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-slate-900 mb-3">While you wait...</h3>
          <p className="text-slate-600 mb-4">
            Prepare your product listings, images, and pricing so you can start selling immediately after approval!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">📸</p>
              <p className="text-sm font-semibold text-slate-700 mt-2">Prepare Photos</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">📝</p>
              <p className="text-sm font-semibold text-slate-700 mt-2">Write Descriptions</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg">
              <p className="text-2xl font-bold text-violet-600">💰</p>
              <p className="text-sm font-semibold text-slate-700 mt-2">Set Prices</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PendingApproval;