import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Images as ImagesIcon,
  Plus,
  X,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Link2,
  Upload,
} from "lucide-react";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per file

const AdsList = () => {
  const navigate = useNavigate();

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [images, setImages] = useState([]);
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params = filter === "all" ? {} : { status: filter };
      const res = await api.get("/api/ads", { params });
      setAds(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Prevent the browser from opening files dropped outside the drop zone
  useEffect(() => {
    if (!showForm) return;
    const stopOpen = (e) => {
      e.preventDefault();
    };
    window.addEventListener("dragover", stopOpen);
    window.addEventListener("drop", stopOpen);
    return () => {
      window.removeEventListener("dragover", stopOpen);
      window.removeEventListener("drop", stopOpen);
    };
  }, [showForm]);

  const resetForm = () => {
    setTitle("");
    setImages([]);
    setPosition(0);
    setIsActive(true);
    setExpiresAt("");
    setUrlInput("");
    setEditingAd(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setImages(ad.images && ad.images.length ? ad.images : ad.image ? [ad.image] : []);
    setPosition(ad.position || 0);
    setIsActive(ad.isActive !== false);
    setExpiresAt(
      ad.expiresAt ? new Date(ad.expiresAt).toISOString().slice(0, 16) : ""
    );
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Only image files are allowed");
      return;
    }
    if (imageFiles.length < files.length) {
      toast.error("Some files were skipped (not images)");
    }

    try {
      const encoded = [];
      for (const file of imageFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is larger than 4MB`);
          continue;
        }
        encoded.push(await toBase64(file));
      }
      if (encoded.length > 0) {
        setImages((prev) => [...prev, ...encoded]);
        toast.success(`${encoded.length} image(s) added`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to read image file");
    }
  };

  const handleFilesChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // ignore leave events caused by moving over child elements
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setUrlInput("");
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ad title is required");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const payload = {
        title: title.trim(),
        images,
        image: images[0],
        position: Number(position) || 0,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (editingAd) {
        await api.put(`/api/ads/${editingAd._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ad updated successfully");
      } else {
        await api.post("/api/ads", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ad created successfully");
      }

      closeForm();
      fetchAds();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          (editingAd ? "Failed to update ad" : "Failed to create ad")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      setDeleting(id);
      const token = localStorage.getItem("authToken");
      await api.delete(`/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ad deleted successfully");
      setAds((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete ad");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (ad) => {
    try {
      setToggling(ad._id);
      const token = localStorage.getItem("authToken");
      const res = await api.patch(
        `/api/ads/${ad._id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds((prev) =>
        prev.map((a) => (a._id === ad._id ? { ...a, isActive: res.data.data.isActive } : a))
      );
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      toast.error("Failed to toggle ad status");
    } finally {
      setToggling(null);
    }
  };

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

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
            <h1 className="text-2xl md:text-3xl font-bold">Ads</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage ad banners for the store.
            </p>
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Create Ad
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              filter === tab.key
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <ImagesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No ads yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first ad banner to get started.
          </p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Create Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const cover = ad.image || (ad.images && ad.images[0]) || "";
            return (
              <div
                key={ad._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {cover ? (
                    <img
                      src={cover}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagesIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  {/* Images count badge */}
                  {ad.images && ad.images.length > 1 && (
                    <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded-full">
                      <ImagesIcon className="h-3.5 w-3.5" />
                      {ad.images.length}
                    </span>
                  )}

                  {/* Position badge */}
                  <span className="absolute top-3 right-3 text-xs font-semibold text-slate-700 bg-white/90 px-2 py-1 rounded-full">
                    #{ad.position || 0}
                  </span>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate mb-1">
                    {ad.title}
                  </h3>
                  <p className="text-xs mb-4">
                    {!ad.expiresAt ? (
                      <span className="text-slate-500">No expiry</span>
                    ) : new Date(ad.expiresAt) < new Date() ? (
                      <span className="font-bold text-red-500">
                        Expired on {new Date(ad.expiresAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Expires {new Date(ad.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleToggle(ad)}
                      disabled={toggling === ad._id}
                      className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 transition-colors disabled:opacity-50"
                      title={ad.isActive !== false ? "Deactivate" : "Activate"}
                    >
                      {toggling === ad._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : ad.isActive !== false ? (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <ToggleRight className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          <ToggleLeft className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(ad)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        disabled={deleting === ad._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === ad._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAd ? "Edit Ad" : "Create Ad"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ad Title
                </label>
                <input
                  type="text"
                  placeholder="Enter ad title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Images
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-emerald-500 bg-emerald-50 scale-[1.02] shadow-lg"
                      : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40"
                  }`}
                >
                  <Upload
                    className={`h-9 w-9 mx-auto mb-2 transition-colors ${
                      dragOver ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      dragOver ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {dragOver
                      ? "Drop images here"
                      : "Drag & drop images here"}
                  </p>
                  <p className="text-xs text-slate-400">
                    or click to browse · multiple files · max 4MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                </div>

                {/* Add by URL */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="relative flex-1">
                    <Link2 className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="Or paste an image URL"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImageUrl();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                      >
                        <img
                          src={img}
                          alt={`ad-${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] font-semibold text-white bg-emerald-600 px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Position + Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Position
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-semibold text-slate-700">
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500 bg-slate-100"
                  }`}
                >
                  {isActive ? (
                    <>
                      <ToggleRight className="h-4 w-4" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4" /> Inactive
                    </>
                  )}
                </button>
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
                  ) : editingAd ? (
                    "Update Ad"
                  ) : (
                    "Create Ad"
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

export default AdsList;
