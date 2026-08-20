import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, TrendingUp, Eye, Edit, Trash2, Store, CheckCircle, XCircle, Bell } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import LineChart from '../../components/admin/Charts/LineChart';
import BarChart from '../../components/admin/Charts/BarChart';
import DataTable from '../../components/admin/DataTable';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pendingVendors, setPendingVendors] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 1248,
    totalOrders: 856,
    totalProducts: 127,
    totalRevenue: '₹4,52,890',
  });

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 },
  ];

  const productData = [
    { name: 'Cleanser', sales: 245 },
    { name: 'Moisturizer', sales: 312 },
    { name: 'Serum', sales: 189 },
    { name: 'Sunscreen', sales: 267 },
    { name: 'Mask', sales: 156 },
  ];

  // Recent orders data
  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'Priya Sharma',
      product: 'Vitamin C Serum',
      amount: '₹1,899',
      status: 'Completed',
      date: '2024-02-06',
    },
    {
      id: 'ORD-002',
      customer: 'Rahul Kumar',
      product: 'Hydrating Cleanser',
      amount: '₹899',
      status: 'Processing',
      date: '2024-02-06',
    },
    {
      id: 'ORD-003',
      customer: 'Anita Desai',
      product: 'Retinol Night Cream',
      amount: '₹2,299',
      status: 'Pending',
      date: '2024-02-05',
    },
    {
      id: 'ORD-004',
      customer: 'Vikram Singh',
      product: 'Mineral SPF 50',
      amount: '₹1,099',
      status: 'Completed',
      date: '2024-02-05',
    },
    {
      id: 'ORD-005',
      customer: 'Neha Patel',
      product: 'Clay Mask',
      amount: '₹699',
      status: 'Shipped',
      date: '2024-02-04',
    },
  ];

  const orderColumns = [
    {
      header: 'Order ID',
      accessor: 'id',
      render: (value) => (
        <span className="font-mono text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900">{value}</span>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">{value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          Completed: 'bg-emerald-100 text-emerald-700',
          Processing: 'bg-blue-100 text-blue-700',
          Pending: 'bg-yellow-100 text-yellow-700',
          Shipped: 'bg-purple-100 text-purple-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
  ];

  useEffect(() => {
    const fetchPendingVendors = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/api/admin/vendors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingVendors(
          (res.data.vendors || []).filter((v) => v.status === 'Pending'),
        );
      } catch (error) {
        // silent - non-critical dashboard widget
      }
    };
    fetchPendingVendors();
  }, []);

  const updateVendorStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.patch(
        `/api/admin/vendors/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingVendors((prev) => prev.filter((v) => v._id !== id));
      toast.success(
        `${res.data.vendor.businessName} ${
          status === 'Approved' ? 'approved' : 'rejected'
        } successfully`,
      );
    } catch (error) {
      toast.error('Failed to update vendor status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12.5}
          icon={Users}
          color="emerald"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={8.2}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          change={-2.4}
          icon={Package}
          color="purple"
        />
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={15.3}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={revenueData}
          dataKey="revenue"
          title="Revenue Overview"
          color="#10b981"
        />
        <BarChart
          data={productData}
          dataKey="sales"
          title="Top Selling Products"
          color="#3b82f6"
        />
      </div>

      {/* Recent Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </button>
        </div>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          searchable={false}
          actions={(row) => (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/orders/${row.id}`);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-slate-600" />
              </button>
            </>
          )}
        />
      </div>

      {/* Pending Vendor Approvals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Pending Vendor Approvals
            {pendingVendors.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                {pendingVendors.length} new
              </span>
            )}
          </h2>
          <button
            onClick={() => navigate('/admin/vendors')}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </button>
        </div>
        {pendingVendors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <p className="text-slate-500">No pending vendor registrations</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-slate-200">
                {pendingVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {vendor.businessName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {vendor.ownerName} · {vendor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vendor.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vendor.createdAt
                        ? new Date(vendor.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateVendorStatus(vendor._id, 'Approved')}
                          disabled={updatingId === vendor._id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateVendorStatus(vendor._id, 'Rejected')}
                          disabled={updatingId === vendor._id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">New Assessment</h3>
          <p className="text-emerald-100 text-sm mb-4">Review pending skin assessments</p>
          <button
            onClick={() => navigate('/admin/assessments')}
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-50 transition-colors"
          >
            View Assessments
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
          <p className="text-blue-100 text-sm mb-4">Add or edit product listings</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
          >
            Manage Products
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Manage Vendors</h3>
          <p className="text-purple-100 text-sm mb-4">Review registrations and approvals</p>
          <button
            onClick={() => navigate('/admin/vendors')}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors"
          >
            View Vendors
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;