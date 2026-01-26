import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, formatPrice } from '../utils/config';

const ProductCard = ({ product }) => {
  const hasDiscount = product.has_active_discount && product.discount_amount > 0;
  
  // Calculate discount info if not provided by backend
  const originalPrice = product.original_price || product.price;
  const finalPrice = product.final_price || product.price;
  const savings = product.savings || product.discount_amount || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 w-full h-64 bg-gray-200">
            {product.main_image ? (
              <img
                src={getImageUrl(product.main_image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>No Image</span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              -{product.discount_percentage}%
            </div>
          )}


        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center space-x-2 mb-2">
            {hasDiscount ? (
              <>
                {/* Discounted Price */}
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(finalPrice)}
                </span>
                {/* Original Price (crossed out) */}
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Savings */}
          {hasDiscount && savings > 0 && (
            <div className="text-sm text-green-600 font-medium mb-2">
              You save {formatPrice(savings)}
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;