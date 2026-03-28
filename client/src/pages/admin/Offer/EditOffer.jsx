import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../utils/api";

const EditOffer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...state,
    includes: state.includes || [""],
    tags: state.tags || [""],
    journey: state.journey || [{ stepNumber: 1, title: "", description: "" }],
  });

  //  handle change + auto discount
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]: value,
    };

    const price = Number(updated.price);
    const originalPrice = Number(updated.originalPrice);

    if (price > 0 && originalPrice > 0) {
      if (originalPrice > price) {
        const percent = Math.round(
          ((originalPrice - price) / originalPrice) * 100,
        );
        updated.discount = `Save ${percent}%`;
      } else {
        updated.discount = "No discount";
      }
    } else {
      updated.discount = "";
    }

    setForm(updated);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await api.put(`/api/offers/${form._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Offer Updated 🚀");
      navigate("/admin/add-offer");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="px-3 py-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Edit Offer</h1>
          <p className="text-sm text-slate-500">Update your package details</p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-6 shadow-sm">
        {/* BASIC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            disabled
          />
          <Input
            label="Duration"
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
        </div>

        {/* INCLUDES */}
        <Section title="Includes">
          {form.includes.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                value={item}
                onChange={(e) => {
                  const updated = [...form.includes];
                  updated[i] = e.target.value;
                  setForm({ ...form, includes: updated });
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    includes: form.includes.filter((_, idx) => idx !== i),
                  })
                }
                className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                X
              </button>
            </div>
          ))}

          <AddBtn
            onClick={() =>
              setForm({ ...form, includes: [...form.includes, ""] })
            }
          />
        </Section>

        {/* TAGS */}
        <Section title="Tags">
          {form.tags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                value={tag}
                onChange={(e) => {
                  const updated = [...form.tags];
                  updated[i] = e.target.value;
                  setForm({ ...form, tags: updated });
                }}
                className="w-full inputField"
              />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    tags: form.tags.filter((_, idx) => idx !== i),
                  })
                }
                className="h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                X
              </button>
            </div>
          ))}

          <AddBtn
            onClick={() => setForm({ ...form, tags: [...form.tags, ""] })}
          />
        </Section>

        {/* JOURNEY */}
        <Section title="Journey">
          {form.journey.map((step, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl p-4 space-y-2 mb-3 hover:shadow-sm transition">
              <input
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => {
                  const updated = [...form.journey];
                  updated[i].title = e.target.value;
                  setForm({ ...form, journey: updated });
                }}
                className="inputField"
              />

              <input
                placeholder="Description"
                value={step.description}
                onChange={(e) => {
                  const updated = [...form.journey];
                  updated[i].description = e.target.value;
                  setForm({ ...form, journey: updated });
                }}
                className="inputField"
              />

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    journey: form.journey.filter((_, idx) => idx !== i),
                  })
                }
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <AddBtn
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
            label="+ Add Step"
          />
        </Section>

        {/* CTA */}
        <button
          onClick={handleUpdate}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold"
        >
          Update Offer →
        </button>
      </div>
    </div>
  );
};

export default EditOffer;

/* REUSABLE COMPONENTS */

const Input = ({ label, name, value, onChange, type = "text", disabled }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-600">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className="
        w-full 
        rounded-xl 
        border border-slate-200 
        px-4 py-2.5 
        text-sm 
        bg-white
        focus:outline-none 
        focus:ring-2 focus:ring-emerald-500 
        focus:border-transparent
        transition
        disabled:bg-slate-100 disabled:cursor-not-allowed
      "
    />
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-sm font-semibold text-slate-700 tracking-wide">
      {title}
    </h2>
    {children}
  </div>
);

const AddBtn = ({ onClick, label = "+ Add" }) => (
  <button onClick={onClick} className="text-emerald-600 text-sm font-medium">
    {label}
  </button>
);

// const circleBtn = "h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center";
