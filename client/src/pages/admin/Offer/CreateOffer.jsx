import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateOffer = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    price: "",
    originalPrice: "",
    discount: "",
    duration: "",
    includes: [""],
    tags: [""],
    journey: [{ stepNumber: 1, title: "", description: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    // Auto discount calculation
    const price = parseFloat(name === "price" ? value : updatedForm.price);
    const originalPrice = parseFloat(
      name === "originalPrice" ? value : updatedForm.originalPrice,
    );

    if (price && originalPrice && originalPrice > price) {
      const discountPercent = Math.round(
        ((originalPrice - price) / originalPrice) * 100,
      );

      updatedForm.discount = `Save ${discountPercent}%`;
    }

    setForm(updatedForm);
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.subtitle.trim()) return "Subtitle is required";
    if (!form.price) return "Price is required";
    if (!form.originalPrice) return "Original Price is required";
    if (!form.duration.trim()) return "Duration is required";

    if (!form.includes.length || form.includes.some((i) => !i.trim()))
      return "All includes must be filled";

    if (!form.tags.length || form.tags.some((t) => !t.trim()))
      return "All tags must be filled";

    if (
      !form.journey.length ||
      form.journey.some(
        (step) => !step.title.trim() || !step.description.trim(),
      )
    )
      return "All journey steps must be filled";

    return null;
  };

  const handleCreate = async () => {
    const error = validateForm();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await axios.post("http://localhost:5005/api/offers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Offer Created 🚀");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="px-3 py-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
              Customize Offer
            </h1>
            <p className="text-sm text-slate-500">
              Fill details to create a new package
            </p>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        {/* BASIC INFO */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <Input
            label="Subtitle"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
          />

          <Input
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />
          <Input
            label="Original Price"
            name="originalPrice"
            type="number"
            value={form.originalPrice}
            onChange={handleChange}
          />

          <Input
            label="Discount"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
          <Input
            label="Duration"
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Includes
          </h2>

          {form.includes.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={item}
                onChange={(e) => {
                  const updated = [...form.includes];
                  updated[i] = e.target.value;
                  setForm({ ...form, includes: updated });
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
              />

              <button
                onClick={() => {
                  const updated = form.includes.filter(
                    (_, index) => index !== i,
                  );
                  setForm({ ...form, includes: updated });
                }}
                className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0"
              >
                X
              </button>
            </div>
          ))}

          <button
            onClick={() =>
              setForm({ ...form, includes: [...form.includes, ""] })
            }
            className="text-sm text-emerald-600 font-medium"
          >
            + Add Include
          </button>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Tags</h2>

          {form.tags.map((tag, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={tag}
                onChange={(e) => {
                  const updated = [...form.tags];
                  updated[i] = e.target.value;
                  setForm({ ...form, tags: updated });
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5"
              />

              <button
                onClick={() => {
                  const updated = form.tags.filter((_, index) => index !== i);
                  setForm({ ...form, tags: updated });
                }}
                className="h-8 w-8 bg-red-500 text-white my-2 rounded-full flex items-center justify-center"
              >
                X
              </button>
            </div>
          ))}

          <button
            onClick={() => setForm({ ...form, tags: [...form.tags, ""] })}
            className="text-sm text-emerald-600 font-medium"
          >
            + Add Tag
          </button>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Journey</h2>

          {form.journey.map((step, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-xl p-3 sm:p-4 mb-3 space-y-2"
            >
              <input
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => {
                  const updated = [...form.journey];
                  updated[i].title = e.target.value;
                  setForm({ ...form, journey: updated });
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />

              <input
                placeholder="Description"
                value={step.description}
                onChange={(e) => {
                  const updated = [...form.journey];
                  updated[i].description = e.target.value;
                  setForm({ ...form, journey: updated });
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />

              <button
                onClick={() => {
                  const updated = form.journey.filter(
                    (_, index) => index !== i,
                  );
                  setForm({ ...form, journey: updated });
                }}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={() =>
              setForm({
                ...form,
                journey: [
                  ...form.journey,
                  {
                    stepNumber: form.journey.length + 1,
                    title: "",
                    description: "",
                  },
                ],
              })
            }
            className="text-sm text-emerald-600 font-medium"
          >
            + Add Step
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleCreate}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Create Offer →
        </button>
      </div>
    </div>
  );
};

export default CreateOffer;

/* INPUT COMPONENT */
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);
