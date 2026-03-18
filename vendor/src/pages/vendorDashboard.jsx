import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowUp,
} from 'lucide-react';
import { productApi, orderApi } from '../api';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productApi.getAll(),
          orderApi.getAll(),
        ]);
        if (cancelled) return;
        const products = productsRes.products || [];
        const orders = ordersRes.orders || [];
        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const totalOrders = orders.length;
        const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const productSales = {};
        orders.forEach((o) => {
          (o.items || []).forEach((item) => {
            const name = item.product?.name || item.name || 'Product';
            if (!productSales[name]) productSales[name] = { sales: 0, revenue: 0 };
            productSales[name].sales += item.quantity || 0;
            productSales[name].revenue += (item.price || 0) * (item.quantity || 0);
          });
        });
        const top = Object.entries(productSales)
          .map(([name, d]) => ({ name, ...d }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setStats({
          totalSales: totalRevenue,
          totalOrders,
          totalProducts: products.length,
          totalRevenue,
          salesGrowth: 0,
          ordersGrowth: 0,
          avgOrderValue: avgOrder,
        });
        setRecentOrders(orders.slice(0, 5).map((o) => ({
          id: o.orderNumber || o._id,
          customer: o.user?.name || o.user?.email || 'Customer',
          product: (o.items && o.items[0]) ? (o.items[0].product?.name || o.items[0].name) : '—',
          amount: o.total || 0,
          status: o.orderStatus || 'Pending',
        })));
        setTopProducts(top);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

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
          
          {/* Sales Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sales Overview</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <p className="text-slate-500">
                Total revenue: ₹{stats.totalRevenue.toLocaleString()}
              </p>
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