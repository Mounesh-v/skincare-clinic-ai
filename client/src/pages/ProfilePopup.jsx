import { useState } from "react";
import axios from "axios";
import api from "../utils/api";
import toast from "react-hot-toast";

const ProfilePopup = ({ show, onClose, onSuccess, user }) => {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [locations, setLocations] = useState([]);

  if (!show) return null;

  const fetchAddressFromPincode = async (pin) => {
    try {
      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${pin}`,
      );

      const data = res.data[0];

      if (data.Status === "Success") {
        setLocations(data.PostOffice); // 🔥 store ALL

        // optional: auto select first
        const first = data.PostOffice[0];
        setCity(first.Name);
        setDistrict(first.District);
        setState(first.State);
        setCountry(first.Country);
      } else {
        toast.error("Invalid pincode ❌");
        setLocations([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading("Saving your details...");

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      await api.post(
        "/api/auth/profile",
        { phone, address, pincode, city, district, state, country },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const existingUser = JSON.parse(localStorage.getItem("authUser"));

      const updatedUser = {
        ...existingUser,
        phone,
        address,
        pincode,
        isProfileComplete: true,
      };

      localStorage.setItem("authUser", JSON.stringify(updatedUser));

      toast.dismiss(toastId);
      toast.success("Profile saved successfully 🎉");

      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-1 text-slate-800">
          Complete Your Profile
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Add delivery details to continue your order
        </p>

        {/* CONTACT SECTION */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-600">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* ADDRESS SECTION */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-600">
            Full Address
          </label>
          <textarea
            placeholder="House no, street, area..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* PINCODE */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-600">Pincode</label>
          <input
            type="text"
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e) => {
              const value = e.target.value;
              setPincode(value);

              if (value.length === 6) {
                fetchAddressFromPincode(value);
              }
            }}
            className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* LOCATION SELECT */}
        {locations.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-600">
              Select Your Area
            </label>
            <select
              className="w-full mt-1 p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => {
                const selected = locations.find(
                  (loc) => loc.Name === e.target.value,
                );

                setCity(selected.Name);
                setDistrict(selected.District);
                setState(selected.State);
                setCountry(selected.Country);
              }}
            >
              {locations.map((loc, index) => (
                <option key={index} value={loc.Name}>
                  {loc.Name}, {loc.District}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* AUTO FILLED INFO */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <input
            value={district}
            readOnly
            className="p-3 border border-slate-200 rounded-lg bg-gray-100 text-sm"
          />
          <input
            value={state}
            readOnly
            className="p-3 border border-slate-200 rounded-lg bg-gray-100 text-sm"
          />
          <input
            value={country}
            readOnly
            className="p-3 border border-slate-200 rounded-lg bg-gray-100 text-sm col-span-2"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-md"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;
