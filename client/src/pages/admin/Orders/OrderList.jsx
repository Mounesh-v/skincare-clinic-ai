import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import DataTable from '../../../components/admin/DataTable';
import toast from 'react-hot-toast';

const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'Priya Sharma',
      email: 'priya@example.com',
      products: 'Vitamin C Serum, Cleanser',
      totalAmount: 2798,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      date: '2024-02-06',
      shippingAddress: 'Mumbai, Maharashtra',
    },
    {
      id: 'ORD-002',
      customer: 'Rahul Kumar',
      email: 'rahul@example.com',
      products: 'Hydrating Cleanser',
      totalAmount: 899,
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      date: '2024-02-06',
      shippingAddress: 'Delhi, India',
    },
    {
      id: 'ORD-003',
      customer: 'Anita Desai',
      email: 'anita@example.com',
      products: 'Retinol Night Cream',
      totalAmount: 2299,
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      date: '2024-02-05',
      shippingAddress: 'Bangalore, Karnataka',
    },
    {
      id: 'ORD-004',
      customer: 'Vikram Singh',
      email: 'vikram@example.com',
      products: 'Mineral SPF 50, Clay Mask',
      totalAmount: 1798,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      date: '2024-02-05',
      shippingAddress: 'Pune, Maharashtra',
    },
    {
      id: 'ORD-005',
      customer: 'Neha Patel',
      email: 'neha@example.com',
      products: 'Clay Mask',
      totalAmount: 699,
      paymentStatus: 'Failed',
      orderStatus: 'Cancelled',
      date: '2024-02-04',
      shippingAddress: 'Ahmedabad, Gujarat',
    },
  ]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, orderStatus: newStatus } : order
    ));
    toast.success(`Order ${newStatus.toLowerCase()} successfully`);
  };

  const handleExport = () => {
    toast.success('Exporting orders data...');
  };

  const columns = [
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
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Products',
      accessor: 'products',
      render: (value) => (
        <span className="text-sm text-slate-600 line-clamp-1">{value}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">₹{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (value) => {
        const statusColors = {
          Paid: 'bg-green-100 text-green-700',
          Pending: 'bg-yellow-100 text-yellow-700',
          Failed: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'orderStatus',
      render: (value) => {
        const statusColors = {
          Delivered: 'bg-green-100 text-green-700',
          Shipped: 'bg-blue-100 text-blue-700',
          Processing: 'bg-purple-100 text-purple-700',
          Pending: 'bg-yellow-100 text-yellow-700',
          Cancelled: 'bg-red-100 text-red-700',
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {orders.filter(o => o.orderStatus === 'Delivered').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Shipped</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {orders.filter(o => o.orderStatus === 'Shipped').length}
              </p>
            </div>
            <Truck className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Processing</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {orders.filter(o => o.orderStatus === 'Processing').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {orders.filter(o => o.orderStatus === 'Cancelled').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        searchPlaceholder="Search orders by ID, customer, or product..."
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/orders/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
            
            {row.orderStatus !== 'Delivered' && row.orderStatus !== 'Cancelled' && (
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(row.id, e.target.value);
                }}
                value={row.orderStatus}
                className="text-xs px-2 py-1 border border-slate-200 rounded hover:bg-slate-50"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </>
        )}
      />
    </div>
  );
};

export default OrderList;