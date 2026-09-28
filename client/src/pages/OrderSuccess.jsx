import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, product, quantity } = location.state || {};

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No order found</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Placed!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-slate-900">Order Details</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Order Number</span>
                <span className="font-mono font-semibold text-slate-900">{orderId}</span>
              </div>
              {product && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Product</span>
                  <span className="font-medium text-slate-900">{product}</span>
                </div>
              )}
              {quantity && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantity</span>
                  <span className="font-medium text-slate-900">{quantity}</span>
                </div>
              )}
              {total && (
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="text-slate-600 font-semibold">Total Paid</span>
                  <span className="font-bold text-emerald-600 text-lg">{formatCurrency(total)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
            >
              Continue Shopping
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
