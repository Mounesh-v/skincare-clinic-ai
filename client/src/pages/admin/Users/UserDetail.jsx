import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, 
  FileText, Edit, Trash2, Ban, CheckCircle, TrendingUp 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock user data - replace with API call
  const [user] = useState({
    id: id,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    status: 'Active',
    avatar: null,
    joinedDate: '2024-01-15',
    lastActive: '2024-02-06 10:30 AM',
    address: {
      street: '123, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    stats: {
      totalOrders: 5,
      totalSpent: 12450,
      totalAssessments: 3,
      averageOrderValue: 2490,
    },
  });

  const [orders] = useState([
    {
      id: 'ORD-001',
      product: 'Vitamin C Serum',
      amount: 1899,
      status: 'Delivered',
      date: '2024-02-01',
    },
    {
      id: 'ORD-002',
      product: 'Hydrating Cleanser',
      amount: 899,
      status: 'Shipped',
      date: '2024-01-28',
    },
    {
      id: 'ORD-003',
      product: 'Retinol Night Cream',
      amount: 2299,
      status: 'Delivered',
      date: '2024-01-20',
    },
  ]);

  const [assessments] = useState([
    {
      id: 'ASS-001',
      skinType: 'Combination',
      concerns: ['Acne', 'Dark Spots'],
      date: '2024-01-16',
      status: 'Completed',
    },
    {
      id: 'ASS-002',
      skinType: 'Combination',
      concerns: ['Aging', 'Fine Lines'],
      date: '2024-01-22',
      status: 'Completed',
    },
    {
      id: 'ASS-003',
      skinType: 'Combination',
      concerns: ['Dullness'],
      date: '2024-02-02',
      status: 'In Progress',
    },
  ]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      toast.success('User deleted successfully');
      navigate('/admin/users');
    }
  };

  const handleBan = () => {
    toast.success(user.status === 'Active' ? 'User banned' : 'User activated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
            <p className="text-slate-600 mt-1">View and manage user information</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span className="font-medium">Edit</span>
          </button>
          <button
            onClick={handleBan}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Ban className="w-5 h-5" />
            <span className="font-medium">
              {user.status === 'Active' ? 'Ban User' : 'Activate'}
            </span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-sm text-slate-500">User ID: {user.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-medium text-slate-900">
                    {user.address.city}, {user.address.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Joined</p>
                  <p className="text-sm font-medium text-slate-900">{user.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{user.stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{user.stats.totalSpent.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Assessments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{user.stats.totalAssessments}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{user.stats.averageOrderValue.toLocaleString()}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Orders & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{order.product}</p>
                  <p className="text-xs text-slate-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">₹{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Skin Assessments</h3>
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">{assessment.skinType}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    assessment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assessment.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Concerns: {assessment.concerns.join(', ')}
                </p>
                <p className="text-xs text-slate-500 mt-1">{assessment.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;