import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const fetchOffers = async () => {
    try {
      const res = await api.get("/api/offers");
      setOffers(res.data.data || res.data);
    } catch {
      toast.error("Failed to load offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");

      await api.delete(`/api/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Deleted");
      fetchOffers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredOffers = offers.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.title?.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Offers Management
          </h1>
          <p className="text-slate-500 text-sm">Manage your medical packages</p>
        </div>

        <button
          onClick={() => navigate("/admin/offers/create")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Offer
        </button>
      </div>

      {/* STATS
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat title="Total Offers" value={offers.length} />
        <Stat title="Active" value={offers.length} />
        <Stat title="Discounted" value={offers.length} />
        <Stat title="Packages" value={offers.length} />
      </div> */}

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <input
          placeholder="Search offers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full  rounded-xl p-4  focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
              <th className="text-left p-3">OFFER</th>
              <th>PRICE</th>
              <th>DURATION</th>
              <th>DISCOUNT</th>
              <th>TAGS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredOffers.map((item) => (
              <tr key={item._id} className="border-b hover:bg-slate-50">
                {/* OFFER */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      {item.title.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                </td>

                {/* PRICE */}
                <td className="text-center">
                  <p className="font-semibold text-emerald-600">
                    ₹{item.price}
                  </p>
                  <p className="line-through text-xs text-slate-400">
                    ₹{item.originalPrice}
                  </p>
                </td>

                {/* DURATION */}
                <td className="text-center">{item.duration}</td>

                {/* DISCOUNT */}
                <td className="text-center">{item.discount}</td>

                {/* TAGS */}
                <td className="text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {item.tags?.[0] && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                        {item.tags[0]}
                      </span>
                    )}
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/offers/view/${item._id}`, {
                          state: item,
                        })
                      }
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/offers/edit/${item._id}`, {
                          state: item,
                        })
                      }
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filteredOffers.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-6 text-slate-400">
                No offers found
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
  );
};

export default OfferList;

/* SMALL COMPONENT */
const Stat = ({ title, value }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
    <div>
      <p className="text-xs text-slate-500">{title}</p>
      <h2 className="text-lg sm:text-xl font-bold text-slate-900">{value}</h2>
    </div>

    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
      📊
    </div>
  </div>
);
