import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl, formatPrice, debugLog } from '../utils/config';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(productId);
        debugLog('Product data received:', data);
        debugLog('Specifications:', data.specifications);
        debugLog('Specifications type:', typeof data.specifications);
        setProduct(data);
        
        // Preload all images
        const imagesToLoad = data.gallery_images && data.gallery_images.length > 0 
          ? data.gallery_images.map(img => img.image_name)
          : data.all_images && data.all_images.length > 0 
          ? data.all_images 
          : [data.main_image || data.image_name];
        
        const imagePromises = imagesToLoad.map(imgPath => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve even on error to not block loading
            img.src = getImageUrl(imgPath);
          });
        });
        
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading || !imagesLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 px-6 min-h-[600px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-6"></div>
                <p className="text-gray-600 text-xl mb-4">Loading product...</p>
                <p className="text-gray-500 text-sm mb-12">Please wait while we fetch the product details</p>
                
                {/* Skeleton Loading Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-7xl mt-12">
                  {/* Left side skeleton - Images */}
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-24 h-24 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-96 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Right side skeleton - Details */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xl">Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Use gallery_images from backend if available, fallback to all_images or main_image
  const productImages = product.gallery_images && product.gallery_images.length > 0 
    ? product.gallery_images.map(img => img.image_name)
    : product.all_images && product.all_images.length > 0 
    ? product.all_images 
    : [product.main_image || product.image_name];

  const scrollToImage = (index) => {
    setSelectedImage(index);
    const imageElement = document.getElementById(`product-image-${index}`);
    if (imageElement) {
      imageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Images */}
            <div className="flex gap-4">
              {/* Thumbnail column */}
              <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToImage(index)}
                    className={`w-24 h-24 flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main images - scrollable */}
              <div className="flex-1 max-h-[800px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {productImages.map((img, index) => (
                  <div 
                    key={index}
                    id={`product-image-${index}`}
                    className="bg-white border border-gray-200 rounded overflow-hidden cursor-pointer"
                    onClick={() => setFullscreenImage(img)}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`${product.name} angle ${index + 1}`}
                      className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Description */}
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider mb-2">
                  Sharp Lab
                </p>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                {/* Price Section with Discount */}
                <div className="flex items-center space-x-3 mb-2">
                  {product.has_active_discount && product.discount_amount > 0 ? (
                    <>
                      {/* Discounted Price */}
                      <p className="text-3xl font-bold text-green-600">
                        {formatPrice(product.final_price || product.price)}
                      </p>
                      {/* Original Price (crossed out) */}
                      <p className="text-xl text-gray-500 line-through">
                        {formatPrice(product.original_price || product.price)}
                      </p>
                      {/* Discount Badge */}
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        -{product.discount_percentage}% OFF
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-orange-600">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>
                
                {/* Savings Display */}
                {product.has_active_discount && product.savings > 0 && (
                  <p className="text-green-600 font-medium text-lg">
                    You save {formatPrice(product.savings)}!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>

                {/* Product specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Specifications</h3>
                    
                    {Object.entries(product.specifications)
                      .map(([key, value]) => {
                        // Handle both old format (string) and new format (object with order)
                        if (typeof value === 'string') {
                          return { key, value, order: 999 }; // Legacy format
                        }
                        return {
                          key,
                          value: value.value || value,
                          order: value.order || 999
                        };
                      })
                      .sort((a, b) => a.order - b.order) // Sort by order
                      .map(({ key, value }) => (
                        <div key={key} className="flex items-start">
                          <span className="text-gray-500 mr-2">•</span>
                          <span className="text-gray-700">
                            <span className="font-medium">{key}:</span> {
                              Array.isArray(value) ? value.join(', ') : value
                            }
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-gray-600">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    if (product.stock > 0) {
                      addToCart(product, quantity);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }
                  }}
                  className={`w-full py-4 rounded font-semibold text-lg transition-colors ${
                    product.stock > 0
                      ? addedToCart 
                        ? 'bg-green-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>

                {product.stock > 0 && (
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full mt-3 py-4 rounded font-semibold text-lg border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    View Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-5xl hover:text-gray-300 transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            ×
          </button>
          <img 
            src={getImageUrl(fullscreenImage)} 
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
            Click outside to close
          </div>
        </div>
      )}
      
      {/* Fixed WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}

export default ProductDetail;
