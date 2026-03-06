import React, { useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const FeatureList = () => {
  const navigate = useNavigate();
  const [Adname, setAdname] = useState("");
  const [Adddescription, setAdddescription] = useState("");
  const [image, setImage] = useState(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const base64Image = image ? await toBase64(image) : "";

      const payload = {
        Adname,
        Adddescription,
        Addimage: base64Image,
      };

      const res = await api.post("/api/features/add-feature", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      setAdname("");
      setAdddescription("");
      setImage(null);
    } catch (error) {
      console.log(error);
      toast.error("Error creating feature");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-200"
        >
          <ArrowLeft size={24} />
        </button>

        <div>
  <h1 className="text-2xl md:text-3xl font-bold">
    Create Feature
  </h1>

  <p className="text-sm text-gray-500 mt-1 text-justify">
    Add a new feature banner with a title, description, and <br/>image that will be displayed on the Product page slider.
  </p>
</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow w-full max-w-3xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Basic Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Name</label>

              <input
                type="text"
                placeholder="Enter Ad Name"
                value={Adname}
                onChange={(e) => setAdname(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>

              <textarea
                placeholder="Enter description..."
                value={Adddescription}
                onChange={(e) => setAdddescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Image
              </label>
              {/* Add border styling */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full"
              />
              </div>

              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                   className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                />
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg"
            >
              Create Feature
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeatureList;
