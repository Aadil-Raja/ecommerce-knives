// Configuration utilities for environment variables

export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
};

export const getBackendBaseUrl = () => {
  const backendUrl = getBackendUrl();
  return backendUrl.replace('/api', '');
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${getBackendBaseUrl()}/${imagePath}`;
};