import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Package, 
  Truck, CheckCircle, Clock, CreditCard, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order] = useState({
    id: id,
    orderNumber: id,
    customer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
    },
    orderDate: '2024-02-06 10:30 AM',
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    shippingAddress: {
      street: '123, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    items: [
      {
        id: '1',
        name: 'Vitamin C Serum',
        category: 'Serums',
        price: 1899,
        quantity: 1,
        image: null,
      },
      {
        id: '2',
        name: 'Hydrating Cleanser',
        category: 'Cleansers',
        price: 899,
        quantity: 1,
        image: null,
      },
    ],
    subtotal: 2798,
    shipping: 0,
    tax: 0,
    total: 2798,
    trackingNumber: 'TRK123456789',
    timeline: [
      { status: 'Order Placed', date: '2024-02-06 10:30 AM', completed: true },
      { status: 'Payment Confirmed', date: '2024-02-06 10:35 AM', completed: true },
      { status: 'Processing', date: '2024-02-06 11:00 AM', completed: true },
      { status: 'Shipped', date: '2024-02-07 09:00 AM', completed: true },
      { status: 'Out for Delivery', date: '2024-02-08 08:00 AM', completed: true },
      { status: 'Delivered', date: '2024-02-08 14:30 PM', completed: true },
    ],
  });

  const updateStatus = (newStatus) => {
    toast.success(`Order status updated to ${newStatus}`);
  };

  const downloadInvoice = () => {
    toast.success('Downloading invoice...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-slate-600 mt-1">Placed on {order.orderDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadInvoice}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Invoice</span>
          </button>
          
          <select
            value={order.orderStatus}
            onChange={(e) => updateStatus(e.target.value)}
            className="px-4 py-2 border-2 border-emerald-500 rounded-lg font-medium text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    <p className="text-sm text-slate-600 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-emerald-600">
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium text-slate-900">₹{order.tax}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-emerald-600 text-lg">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.completed ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                      {event.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div className={`w-0.5 h-12 ${event.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className={`font-medium ${event.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                      {event.status}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-900">{order.customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{order.customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{order.customer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h2>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-slate-900">{order.shippingAddress.street}</p>
                <p className="text-sm text-slate-900">{order.shippingAddress.city}</p>
                <p className="text-sm text-slate-900">{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="text-sm text-slate-900">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Payment Method</p>
                  <p className="text-sm font-medium text-slate-900">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Tracking Number</h3>
              </div>
              <p className="font-mono text-sm font-semibold text-emerald-700">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;