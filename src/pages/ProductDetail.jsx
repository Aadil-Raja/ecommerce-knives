import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xl">Loading...</p>
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

  // Use product images array if available, otherwise fallback to single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_name, product.image_name, product.image_name, product.image_name, product.image_name, product.image_name];

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
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToImage(index)}
                    className={`w-20 h-20 flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={`/${img}`} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/knives-bg.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Main images - scrollable */}
              <div className="flex-1 max-h-[600px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {productImages.map((img, index) => (
                  <div 
                    key={index}
                    id={`product-image-${index}`}
                    className="bg-white border border-gray-200 rounded overflow-hidden"
                  >
                    <img 
                      src={`/${img}`} 
                      alt={`${product.name} angle ${index + 1}`}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.src = '/knives-bg.jpg';
                      }}
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
                <p className="text-3xl font-bold text-orange-600">
                  RS {product.price} PKR
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Product specifications */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">Blade Length: 11.5 inches</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">Total Length: 17.5 inches</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">Blade Material: High-Quality J2 Steel</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">Handle Material: Premium Composite or Natural Wood (customizable options)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">Weight: 410 g (approx.)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">leather cover and box.</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
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
    </div>
  );
}

export default ProductDetail;
