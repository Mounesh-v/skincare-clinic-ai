import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, UserPlus, Download, Mail, Ban, CheckCircle } from 'lucide-react';
import DataTable from '../../../components/admin/DataTable';
import toast from 'react-hot-toast';

const UserList = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      status: 'Active',
      assessments: 3,
      orders: 5,
      totalSpent: '₹12,450',
      joinedDate: '2024-01-15',
      avatar: null,
    },
    {
      id: '2',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '+91 98765 43211',
      status: 'Active',
      assessments: 2,
      orders: 3,
      totalSpent: '₹8,990',
      joinedDate: '2024-01-20',
      avatar: null,
    },
    {
      id: '3',
      name: 'Anita Desai',
      email: 'anita.desai@example.com',
      phone: '+91 98765 43212',
      status: 'Inactive',
      assessments: 1,
      orders: 1,
      totalSpent: '₹2,299',
      joinedDate: '2024-01-25',
      avatar: null,
    },
    {
      id: '4',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 98765 43213',
      status: 'Active',
      assessments: 4,
      orders: 8,
      totalSpent: '₹18,750',
      joinedDate: '2024-02-01',
      avatar: null,
    },
    {
      id: '5',
      name: 'Neha Patel',
      email: 'neha.patel@example.com',
      phone: '+91 98765 43214',
      status: 'Active',
      assessments: 2,
      orders: 4,
      totalSpent: '₹6,890',
      joinedDate: '2024-02-03',
      avatar: null,
    },
  ]);

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleBan = (userId) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user.status === 'Active' ? 'Banned' : 'Active';
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
    
    toast.success(`User ${newStatus === 'Banned' ? 'banned' : 'activated'} successfully`);
  };

  const handleExport = () => {
    toast.success('Exporting users data...');
    // Implement CSV export logic here
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          Active: 'bg-green-100 text-green-700',
          Inactive: 'bg-slate-100 text-slate-700',
          Banned: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Assessments',
      accessor: 'assessments',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      header: 'Orders',
      accessor: 'orders',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      render: (value) => (
        <span className="text-sm font-semibold text-emerald-600">{value}</span>
      ),
    },
    {
      header: 'Joined',
      accessor: 'joinedDate',
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
          <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-600 mt-1">Manage all registered users and their activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => navigate('/admin/users/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {users.filter(u => u.status === 'Active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Inactive Users</p>
              <p className="text-2xl font-bold text-slate-600 mt-1">
                {users.filter(u => u.status === 'Inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Ban className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">₹49,379</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        searchPlaceholder="Search users by name, email, or phone..."
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${row.id}/edit`);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit User"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${row.email}`;
              }}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="Send Email"
            >
              <Mail className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBan(row.id);
              }}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              title={row.status === 'Active' ? 'Ban User' : 'Activate User'}
            >
              <Ban className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default UserList;