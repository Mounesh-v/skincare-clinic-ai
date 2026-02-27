import api from '../utils/api';

/**
 * Product API Service
 * All product-related API calls
 */
const productService = {
  // Get all products with optional filters
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.skinType && filters.skinType !== 'all') {
        params.append('skinType', filters.skinType);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }

      const response = await api.get(`/api/products/all-products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single product by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get featured products
  getFeatured: async (limit = 6) => {
    try {
      const response = await api.get(`/api/products/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get products by category
  getByCategory: async (category) => {
    try {
      const response = await api.get(`/api/products/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search products
  search: async (searchTerm) => {
    try {
      const response = await api.get(`/api/products/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default productService;
