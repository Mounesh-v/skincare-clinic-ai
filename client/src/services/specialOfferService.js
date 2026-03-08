import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Special Offers Service
 * Frontend API service for special offers
 */

const specialOfferService = {
  // Get active offers for banner (Public)
  getActiveOffers: async () => {
    try {
      const response = await axios.get(`${API_URL}/special-offers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active offers:', error);
      throw error.response?.data || error.message;
    }
  },

  // Track offer view (Public)
  trackView: async (offerId) => {
    try {
      const response = await axios.post(`${API_URL}/special-offers/${offerId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw - analytics tracking failures shouldn't break UI
      return null;
    }
  },

  // Track offer click (Public)
  trackClick: async (offerId) => {
    try {
      const response = await axios.post(`${API_URL}/special-offers/${offerId}/click`);
      return response.data;
    } catch (error) {
      console.error('Error tracking click:', error);
      return null;
    }
  },

  // ADMIN METHODS (Require authentication)

  // Get all offers (Admin)
  getAllOffers: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/special-offers/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all offers:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get single offer (Admin)
  getOffer: async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/special-offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create offer (Admin)
  createOffer: async (offerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/special-offers/create`,
        offerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update offer (Admin)
  updateOffer: async (offerId, offerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/special-offers/${offerId}`,
        offerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete offer (Admin)
  deleteOffer: async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/special-offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error.response?.data || error.message;
    }
  },

  // Toggle offer status (Admin)
  toggleStatus: async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/special-offers/${offerId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling offer status:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get analytics (Admin)
  getAnalytics: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/special-offers/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default specialOfferService;