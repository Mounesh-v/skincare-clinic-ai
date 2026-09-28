import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  ImageIcon,
  Plus,
  X,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const FeatureList = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  // Form state
  const [Adname, setAdname] = useState("");
  const [Adddescription, setAdddescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/features/get-features");
      setFeatures(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load features");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const resetForm = () => {
    setAdname("");
    setAdddescription("");
    setImage(null);
    setImagePreview(null);
    setEditingFeature(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (feature) => {
    setEditingFeature(feature);
    setAdname(feature.Adname);
    setAdddescription(feature.Adddescription);
    setImagePreview(feature.Addimage);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const base64Image = image ? await toBase64(image) : imagePreview;

      const payload = {
        Adname,
        Adddescription,
        Addimage: base64Image,
      };

      if (editingFeature) {
        await api.put(`/api/features/${editingFeature._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Feature updated successfully");
      } else {
        await api.post("/api/features/add-feature", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Feature created successfully");
      }

      closeForm();
      fetchFeatures();
    } catch (error) {
      console.log(error);
      toast.error(editingFeature ? "Failed to update feature" : "Failed to create feature");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feature?")) return;

    try {
      setDeleting(id);
      const token = localStorage.getItem("authToken");
      await api.delete(`/api/features/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Feature deleted successfully");
      setFeatures((prev) => prev.filter((f) => f._id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete feature");
    } finally {
      setDeleting(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Features</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage feature banners for the Product page slider.
            </p>
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Create Feature
        </button>
      </div>

      {/* Features Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : features.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No features yet</h3>
          <p className="text-gray-500 mb-6">Create your first feature banner to get started.</p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Create Feature
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {feature.Addimage ? (
                  <img
                    src={feature.Addimage}
                    alt={feature.Adname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate mb-1">
                  {feature.Adname}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {feature.Adddescription}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {feature.isActive !== false ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ToggleRight className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <ToggleLeft className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(feature)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(feature._id)}
                      disabled={deleting === feature._id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === feature._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {editingFeature ? "Edit Feature" : "Create Feature"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ad Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Ad Name"
                  value={Adname}
                  onChange={(e) => setAdname(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description..."
                  value={Adddescription}
                  onChange={(e) => setAdddescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="mt-3 w-full h-48 object-cover rounded-xl border border-slate-200"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : editingFeature ? (
                    "Update Feature"
                  ) : (
                    "Create Feature"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureList;
