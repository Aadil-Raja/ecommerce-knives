import { getBackendUrl } from '../utils/config';

const API_BASE = getBackendUrl();

export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: async (email) => {
    try {
      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      return data;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      throw error;
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email) => {
    try {
      const response = await fetch(`${API_BASE}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unsubscribe');
      }

      return data;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      throw error;
    }
  },
};