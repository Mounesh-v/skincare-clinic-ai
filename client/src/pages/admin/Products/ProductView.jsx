import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Edit,
  AlertCircle,
  Tag,
  Layers,
  Box,
} from "lucide-react";
import api from "../../../utils/api.js";
import toast from "react-hot-toast";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);

      console.log("fetched Product", res.data);

      setProduct(res.data.product);
    } catch (err) {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const handleFocus = () => fetchProduct();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-10 text-center text-slate-600">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg border p-10 text-center text-red-600">
        Product not found
      </div>
    );
  }

  const statusColors = {
    Active: "bg-green-100 text-green-700",
    "Low Stock": "bg-orange-100 text-orange-700",
    "Out of Stock": "bg-red-100 text-red-700",
    Inactive: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-2 bg-white shadow-sm hover:shadow rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {product.name}
              </h1>
              <p className="text-slate-500 text-sm">{product.category}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/admin/products/${id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 
          bg-gradient-to-r from-emerald-600 to-green-500 
          text-white rounded-xl shadow-lg hover:shadow-xl 
          hover:from-emerald-700 hover:to-green-600 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* IMAGES */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Product Images
              </h3>

              {product.images?.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      className="w-full h-40 object-cover rounded-xl border hover:scale-105 transition"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-slate-50 rounded-xl">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>

            {/* INVENTORY */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Inventory Overview
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <MiniStat
                  icon={<Box className="w-5 h-5 text-emerald-600" />}
                  label="Stock"
                  value={product.stock}
                />

                <MiniStat
                  icon={<Tag className="w-5 h-5 text-emerald-600" />}
                  label="Sold"
                  value={product.sold || 0}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* BASIC INFO */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 space-y-4">
              <h3 className="font-semibold text-slate-900 mb-4">
                Basic Information
              </h3>

              <GridRow label="Category" value={product.category} />
              <GridRow label="Price" value={`₹${product.price}`} />

              {product.originalPrice && (
                <GridRow
                  label="Original Price"
                  value={`₹${product.originalPrice}`}
                />
              )}

              <GridRow label="SKU" value={product.sku || "-"} />

              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[product.status]
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <GridRow
                label="Featured"
                value={product.featured ? "Yes" : "No"}
              />
            </div>

            {/* DESCRIPTION */}
            <SectionCard title="Description">
              {product.description || "No description available."}
            </SectionCard>

            {/* INGREDIENTS */}
            <SectionCard title="Ingredients">
              {product.ingredients?.length ? (
                <ul className="list-disc pl-6 space-y-1">
                  {product.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              ) : (
                "Not specified"
              )}
            </SectionCard>

            {/* BENEFITS */}
            <SectionCard title="Benefits">
              {product.benefits?.length ? (
                <ul className="list-disc pl-6 space-y-1">
                  {product.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                "Not specified"
              )}
            </SectionCard>

            {/* HOW TO USE */}
            <SectionCard title="How To Use">
              {product.howToUse || "Not provided"}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== UI COMPONENTS ===== */

const SectionCard = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
    <div className="flex items-center gap-2 mb-4">
      <Layers className="w-4 h-4 text-emerald-600" />
      <h3 className="font-semibold text-slate-900">{title}</h3>
    </div>
    <div className="text-slate-600 whitespace-pre-line">{children}</div>
  </div>
);

const GridRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900">{value}</span>
  </div>
);

const MiniStat = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl">
    <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

export default ProductView;
