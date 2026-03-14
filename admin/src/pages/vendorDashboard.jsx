import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Eye,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Line, Bar } from 'recharts';

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 45680,
    totalOrders: 234,
    totalProducts: 45,
    totalRevenue: 156780,
    salesGrowth: 12.5,
    ordersGrowth: 8.3,
    productsViews: 12543,
    avgOrderValue: 670
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: 'ORD-001', customer: 'Priya Sharma', product: 'Vitamin C Serum', amount: 1499, status: 'Processing' },
    { id: 'ORD-002', customer: 'Rahul Kumar', product: 'Retinol Cream', amount: 1799, status: 'Shipped' },
    { id: 'ORD-003', customer: 'Sneha Patel', product: 'Hyaluronic Acid', amount: 1299, status: 'Delivered' }
  ]);

  const [topProducts, setTopProducts] = useState([
    { name: 'Vitamin C Serum', sales: 145, revenue: 217355 },
    { name: 'Retinol Night Cream', sales: 98, revenue: 176302 },
    { name: 'Hyaluronic Moisturizer', sales: 87, revenue: 112913 }
  ]);

  // Sample sales data for chart
  const salesData = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 15000 },
    { month: 'Mar', sales: 18000 },
    { month: 'Apr', sales: 22000 },
    { month: 'May', sales: 28000 },
    { month: 'Jun', sales: 32000 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's your business overview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Last updated</p>
            <p className="font-semibold text-slate-900">Just now</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUp className="h-4 w-4" />
                <span>+{stats.salesGrowth}%</span>
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold">₹{stats.totalSales.toLocaleString()}</p>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUp className="h-4 w-4" />
                <span>+{stats.ordersGrowth}%</span>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <p className="text-violet-100 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-amber-100 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>

        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sales Overview</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-slate-500">Sales chart visualization here</p>
              {/* Add actual chart library like Recharts */}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{order.product}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VendorDashboard;