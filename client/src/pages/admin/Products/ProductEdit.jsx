import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import api from "../../../utils/api.js";
import toast from "react-hot-toast";

// ===== helper =====
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // existing + new
  const [newFiles, setNewFiles] = useState([]); // only new

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    featured: false,
    status: "Active",
    ingredients: "",
    howToUse: "",
    benefits: "",
  });

  // ===== FETCH OLD DATA =====
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const p = res.data.product;

        setFormData({
          name: p.name,
          category: p.category,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          sku: p.sku || "",
          featured: p.featured,
          status: p.status,
          ingredients: (p.ingredients || []).join("\n"),
          benefits: (p.benefits || []).join("\n"),
          howToUse: p.howToUse || "",
        });

        // existing images
        setImages(p.images || []);
      } catch (err) {
        toast.error("Failed to load product");
      }
    };

    load();
  }, [id]);

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ===== NEW IMAGE SELECT =====
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36),
    }));

    setNewFiles([...newFiles, ...previews]);
  };

  // ===== REMOVE OLD IMAGE =====
  const removeOldImage = async (index) => {
    const confirmDelete = window.confirm("Delete this image?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/products/${id}/image/${index}`);

      // remove from UI
      setImages((prev) => prev.filter((_, i) => i !== index));

      toast.success("Image deleted");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  // ===== REMOVE NEW IMAGE =====
  const removeNewImage = (id) => {
    setNewFiles(newFiles.filter((f) => f.id !== id));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // convert new → base64
      const base64New = await Promise.all(
        newFiles.map((f) => toBase64(f.file)),
      );

      const payload = {
        ...formData,

        ingredients: formData.ingredients.split("\n").filter(Boolean),

        benefits: formData.benefits.split("\n").filter(Boolean),

        // keep old + new
        images: [...images.map((i) => i.url), ...base64New],
      };

      await api.put(`/api/products/${id}`, payload);

      toast.success("Product updated");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  //UI
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
                Edit Product
              </h1>
              <p className="text-slate-500 text-sm">
                Update product details & images
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFO CARD */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Product Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Category
                </label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Price
                </label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Stock
                </label>
                <input
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Ingredients (one per line)
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                How To Use
              </label>
              <textarea
                name="howToUse"
                value={formData.howToUse}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition p-3 rounded-xl"
              />
            </div>
          </div>

          {/* IMAGE SECTION */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Product Images
            </h3>

            {/* Existing Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.url}
                    className="h-32 w-full object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={() => removeOldImage(i)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* New Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newFiles.map((f) => (
                <div key={f.id} className="relative group">
                  <img
                    src={f.preview}
                    className="h-32 w-full object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(f.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload */}
            <label className="cursor-pointer border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center hover:bg-emerald-50 transition">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Upload className="mx-auto text-emerald-600" />
              <p className="mt-2 text-sm text-slate-600">
                Click to upload product images
              </p>
            </label>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl shadow-lg hover:shadow-xl transition font-medium"
            >
              <Save className="inline w-4 mr-2" />
              {loading ? "Saving..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
