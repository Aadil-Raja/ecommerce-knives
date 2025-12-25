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

// Debug logging utility
export const debugLog = (...args) => {
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log(...args);
  }
};

// Price formatting utility
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'PKR 0';
  
  // Convert to number and remove decimals if they are .00
  const numPrice = parseFloat(price);
  const formattedNumber = numPrice % 1 === 0 ? 
    numPrice.toLocaleString('en-US') : 
    numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return `PKR ${formattedNumber}`;
};