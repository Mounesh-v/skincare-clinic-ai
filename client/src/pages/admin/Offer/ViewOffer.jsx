import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, Tag, Clock } from "lucide-react";

const ViewOffer = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return <div className="p-6">No data found</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {state.title}
            </h1>
            <p className="text-slate-500 text-sm">{state.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(`/admin/offers/edit/${state._id}`, {
              state: state,
            })
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow hover:opacity-90 transition"
        >
          <Edit size={16} /> Edit Offer
        </button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">

          <h2 className="font-semibold text-slate-800">Package Info</h2>

          <div className="space-y-3 text-sm">

            <Info icon={<Clock size={16} />} label="Duration" value={state.duration} />
            <Info icon={<Tag size={16} />} label="Discount" value={state.discount} />
            <Info
              icon={<Calendar size={16} />}
              label="Created"
              value={new Date(state.createdAt).toLocaleDateString()}
            />

          </div>
        </div>

        {/* RIGHT MAIN */}
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">
              Basic Information
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">

              <Card label="Price" value={`₹${state.price}`} highlight />
              <Card label="Original Price" value={`₹${state.originalPrice}`} />
              <Card label="Duration" value={state.duration} />
              <Card label="Discount" value={state.discount} />

            </div>
          </div>

          {/* INCLUDES */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">Includes</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {state.includes?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-sm"
                >
                  <span className="text-emerald-600">✔</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* JOURNEY */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">Journey</h2>

            <div className="space-y-4">
              {state.journey?.map((step, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <p className="font-medium text-slate-800">
                    Step {step.stepNumber}: {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TAGS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">Tags</h2>

            <div className="flex flex-wrap gap-2">
              {state.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewOffer;


/* SMALL COMPONENTS */

const Info = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-slate-600">
    {icon}
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

const Card = ({ label, value, highlight }) => (
  <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
    <span className="text-slate-500">{label}</span>
    <span className={`font-semibold ${highlight ? "text-emerald-600" : ""}`}>
      {value}
    </span>
  </div>
);