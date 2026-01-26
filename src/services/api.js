const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

// Import pagination config
import { PRODUCTS_PER_PAGE } from '../utils/config';

export const api = {
  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  getCategoryBySlug: async (slug, page = 1, limit = PRODUCTS_PER_PAGE) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/products/lightweight?page=${page}&limit=${limit}`);
    return response.json();
  },

  // Products
  getProducts: async (page = 1, limit = PRODUCTS_PER_PAGE) => {
    const response = await fetch(`${API_BASE_URL}/products/lightweight?page=${page}&limit=${limit}`);
    return response.json();
  },

  getFeaturedProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    return response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  getProductsByCategory: async (categoryId, page = 1, limit = PRODUCTS_PER_PAGE) => {
    const response = await fetch(`${API_BASE_URL}/products/lightweight?category_id=${categoryId}&page=${page}&limit=${limit}`);
    return response.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  getOrderByNumber: async (orderNumber) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}`);
    return response.json();
  },

  // Helper function to get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    return `${BACKEND_BASE_URL}/${imagePath}`;
  },

  // Gallery
  getGalleryImages: async () => {
    const response = await fetch(`${API_BASE_URL}/gallery`);
    return response.json();
  },
};
