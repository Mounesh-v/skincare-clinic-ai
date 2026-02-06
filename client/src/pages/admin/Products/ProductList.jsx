import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Download, Package, AlertCircle } from 'lucide-react';
import DataTable from '../../../components/admin/DataTable';
import toast from 'react-hot-toast';

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Vitamin C Serum',
      category: 'Serums',
      price: 1899,
      originalPrice: 2499,
      stock: 145,
      sold: 245,
      status: 'Active',
      image: null,
      featured: true,
    },
    {
      id: '2',
      name: 'Hydrating Cleanser',
      category: 'Cleansers',
      price: 899,
      originalPrice: 1199,
      stock: 89,
      sold: 312,
      status: 'Active',
      image: null,
      featured: false,
    },
    {
      id: '3',
      name: 'Retinol Night Cream',
      category: 'Moisturizers',
      price: 2299,
      originalPrice: 2999,
      stock: 5,
      sold: 189,
      status: 'Low Stock',
      image: null,
      featured: true,
    },
    {
      id: '4',
      name: 'Mineral SPF 50',
      category: 'Sunscreen',
      price: 1099,
      originalPrice: 1499,
      stock: 234,
      sold: 267,
      status: 'Active',
      image: null,
      featured: false,
    },
    {
      id: '5',
      name: 'Clay Mask',
      category: 'Masks',
      price: 699,
      originalPrice: 999,
      stock: 0,
      sold: 156,
      status: 'Out of Stock',
      image: null,
      featured: false,
    },
  ]);

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    }
  };

  const handleExport = () => {
    toast.success('Exporting products data...');
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-slate-900">₹{value.toLocaleString()}</div>
          {row.originalPrice > value && (
            <div className="text-sm text-slate-500 line-through">₹{row.originalPrice.toLocaleString()}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{value}</span>
          {value <= 10 && value > 0 && (
            <AlertCircle className="w-4 h-4 text-orange-500" />
          )}
          {value === 0 && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      header: 'Sold',
      accessor: 'sold',
      render: (value) => (
        <span className="font-semibold text-emerald-600">{value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          'Active': 'bg-green-100 text-green-700',
          'Low Stock': 'bg-orange-100 text-orange-700',
          'Out of Stock': 'bg-red-100 text-red-700',
          'Inactive': 'bg-slate-100 text-slate-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Featured',
      accessor: 'featured',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-600 mt-1">Manage your product catalog and inventory</p>
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
            onClick={() => navigate('/admin/products/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Products</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Products</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {products.filter(p => p.status === 'Active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {products.filter(p => p.stock > 0 && p.stock <= 10).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
        searchPlaceholder="Search products by name or category..."
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/${row.id}/edit`);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default ProductList;