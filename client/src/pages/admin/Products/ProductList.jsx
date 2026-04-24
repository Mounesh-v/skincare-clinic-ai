import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Package,
  AlertCircle,
} from "lucide-react";
import DataTable from "../../../components/admin/DataTable";
import toast from "react-hot-toast";
import api from "../../../utils/api.js";

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //  FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/products/all-products");

      setProducts(res.data.products);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/products/${productId}`);

      setProducts((prev) =>
        prev.filter((product) => product._id !== productId),
      );

      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleExport = () => {
    toast.success("Exporting products data...");
  };

  // TABLE COLUMNS
  const columns = [
    {
      header: "Product",
      accessor: "name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            {row.images && row.images.length > 0 ? (
              <img
                src={row.images[0].url}
                className="w-full h-full object-cover"
                alt={value}
              />
            ) : (
              <Package className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div>
            <div className="font-medium text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.category}</div>
          </div>
        </div>
      ),
    },

    {
      header: "Price",
      accessor: "price",
      render: (value, row) => (
        <div>
          <div className="font-semibold text-slate-900">
            ₹{Number(value).toLocaleString()}
          </div>

          {row.originalPrice > value && (
            <div className="text-sm text-slate-500 line-through">
              ₹{Number(row.originalPrice).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },

    {
      header: "Stock",
      accessor: "stock",
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{value}</span>

          {value <= 10 && value > 0 && (
            <AlertCircle className="w-4 h-4 text-orange-500" />
          )}

          {value === 0 && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      ),
    },

    {
      header: "Sold",
      accessor: "sold",
      render: (value) => (
        <span className="font-semibold text-emerald-600">{value || 0}</span>
      ),
    },

    {
      header: "Status",
      accessor: "status",
      render: (value) => {
        const statusColors = {
          Active: "bg-green-100 text-green-700",
          "Low Stock": "bg-orange-100 text-orange-700",
          "Out of Stock": "bg-red-100 text-red-700",
          Inactive: "bg-slate-100 text-slate-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]
              }`}
          >
            {value}
          </span>
        );
      },
    },

    {
      header: "Featured",
      accessor: "featured",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${value
              ? "bg-purple-100 text-purple-700"
              : "bg-slate-100 text-slate-600"
            }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  // RENDER
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your product catalog and inventory
          </p>
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
            onClick={() => navigate("/admin/products/create")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Product</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<Package className="w-6 h-6 text-emerald-600" />}
        />

        <StatCard
          title="Active Products"
          value={products.filter((p) => p.status === "Active").length}
          color="text-green-600"
          icon={<span className="text-xl">✅</span>}
        />

        <StatCard
          title="Low Stock"
          value={products.filter((p) => p.stock > 0 && p.stock <= 10).length}
          color="text-orange-600"
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
        />

        <StatCard
          title="Out of Stock"
          value={products.filter((p) => p.stock === 0).length}
          color="text-red-600"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="bg-white rounded-lg border p-10 text-center">
          Loading products...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          onRowClick={(row) => navigate(`/admin/products/${row._id}`)}
          searchPlaceholder="Search products..."
          actions={(row) => (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/products/${row._id}`);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Eye className="w-4 h-4 text-slate-600" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/products/${row._id}/edit`);
                }}
                className="p-2 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row._id);
                }}
                className="p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        />
      )}
    </div>
  );
};

// STAT CARD COMPONENT
const StatCard = ({ title, value, icon, color = "text-slate-900" }) => (
  <div className="bg-white rounded-lg border p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </div>

      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

export default ProductList;
