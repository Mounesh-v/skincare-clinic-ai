import api from "../utils/api";

const addressService = {
  getAddresses: async () => {
    const res = await api.get("/api/addresses");
    return res.data;
  },

  addAddress: async (address) => {
    const res = await api.post("/api/addresses", address);
    return res.data;
  },

  updateAddress: async (addressId, address) => {
    const res = await api.put(`/api/addresses/${addressId}`, address);
    return res.data;
  },

  deleteAddress: async (addressId) => {
    const res = await api.delete(`/api/addresses/${addressId}`);
    return res.data;
  },

  setDefault: async (addressId) => {
    const res = await api.put(`/api/addresses/${addressId}/default`);
    return res.data;
  },
};

export default addressService;
