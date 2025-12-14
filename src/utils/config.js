// Configuration utilities for environment variables

export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
};

export const getBackendBaseUrl = () => {
  const backendUrl = getBackendUrl();
  
  // For production, images are served from the same API domain but without /api path
  if (backendUrl.includes('api.sharplabbyowais.com')) {
    return 'https://api.sharplabbyowais.com';
  }
  
  // For localhost development, just remove /api
  return backendUrl.replace('/api', '');
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${getBackendBaseUrl()}/${imagePath}`;
};