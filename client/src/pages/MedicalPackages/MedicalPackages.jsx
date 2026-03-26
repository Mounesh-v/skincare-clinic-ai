import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../../utils/api";

const MedicalPackages = () => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    age: "",
    skinType: "",
    city: "",
  });

  const fetchOffers = async () => {
    try {
      const res = await api.get("/api/offers");
      setOffers(res.data);
    } catch (error) {
      toast.error("Failed to load offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.fullName || !formData.mobile) {
        return toast.error("Please fill required fields");
      }

      const res = await api.post("/api/offers/booking", {
        userDetails: formData,
        packageId: selectedOffer._id,
      });

      console.log("Result of the Formdata", res);

      toast.success("Booking created!");

      setSelectedOffer(null);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error while Booking", error);
    }
  };

  return (
    <div className="px-6 py-12 bg-gray-50">
      <h2 className="text-3xl font-bold mb-8">Medical Packages</h2>

      {/* Offer Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="bg-white rounded-2xl shadow p-5 cursor-pointer hover:shadow-lg"
            onClick={() => setSelectedOffer(offer)}
          >
            <h3 className="text-xl font-semibold">{offer.title}</h3>
            <p className="text-sm text-gray-500">{offer.subtitle}</p>

            <div className="mt-3">
              <span className="text-2xl font-bold text-green-600">
                ₹{offer.price}
              </span>
              <span className="line-through ml-2 text-gray-400">
                ₹{offer.originalPrice}
              </span>
            </div>

            <div className="mt-3 text-sm text-green-600">{offer.discount}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            {/* Close */}
            <button
              onClick={() => setSelectedOffer(null)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold">{selectedOffer.title}</h2>
            <p className="text-gray-500">{selectedOffer.subtitle}</p>

            {/* Price */}
            <div className="mt-4">
              <span className="text-3xl font-bold text-green-600">
                ₹{selectedOffer.price}
              </span>
              <span className="line-through ml-2 text-gray-400">
                ₹{selectedOffer.originalPrice}
              </span>
              <span className="ml-3 text-green-600">
                {selectedOffer.discount}
              </span>
            </div>

            {/* Includes */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">What's Included</h3>
              <ul className="grid grid-cols-2 gap-2">
                {selectedOffer.includes.map((item, i) => (
                  <li key={i} className="bg-gray-100 p-2 rounded">
                    ✔ {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Journey */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Your Journey</h3>
              {selectedOffer.journey.map((step) => (
                <div key={step.stepNumber} className="flex gap-3 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                    {step.stepNumber}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {selectedOffer.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Your Details</h3>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="border p-2 rounded"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Mobile"
                  className="border p-2 rounded"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Age"
                  className="border p-2 rounded"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />

                <select
                  className="border p-2 rounded"
                  value={formData.skinType}
                  onChange={(e) =>
                    setFormData({ ...formData, skinType: e.target.value })
                  }
                >
                  <option value="">Select Skin Type</option>
                  <option>Oily</option>
                  <option>Dry</option>
                  <option>Combination</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="City / Pincode"
                className="border p-2 rounded mt-3 w-full"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              {/* Final Submit */}
              <button
                onClick={handleSubmit}
                className="w-full mt-6 bg-green-600 text-white font-bold text-xl py-3 rounded-xl"
              >
                Confirm & Pay ₹{selectedOffer.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalPackages;
