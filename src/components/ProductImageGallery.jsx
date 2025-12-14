import { useState } from 'react';

const ProductImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000'}/${images[selectedImage]?.image_name || images[selectedImage]}`}
          alt={images[selectedImage]?.alt_text || productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === index ? 'border-orange-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000'}/${image?.image_name || image}`}
                alt={image?.alt_text || `${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {selectedImage + 1} of {images.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;