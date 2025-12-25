const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

export const api = {
  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  getCategoryBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/products/lightweight`);
    return response.json();
  },

  // Products
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/lightweight`);
    return response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  getProductsByCategory: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/products/lightweight?category_id=${categoryId}`);
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
};
