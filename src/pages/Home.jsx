import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BannerSlider from '../components/BannerSlider';
import { api } from '../services/api';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();
        const featured = products.filter(p => p.is_featured).slice(0, 3);
        setFeaturedProducts(featured);
        
        // Preload featured product images
        if (featured.length > 0) {
          const imagePromises = featured.map(product => {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = `/${product.main_image || product.image_name}`;
            });
          });
          
          await Promise.all(imagePromises);
        }
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setImagesLoaded(true);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Slider Section */}
        <BannerSlider />

        {/* Featured Products */}
        <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 bg-white min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-10 md:mb-12">Featured Products</h2>
            {!imagesLoaded || featuredProducts.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/${product.main_image || product.image_name}`} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/knives-bg.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 uppercase tracking-wide">{product.name}</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-xl sm:text-2xl font-bold text-orange-600">RS {product.price} PKR</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-10 md:mb-12">Why Choose Sharp Lab</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-700 p-6 sm:p-7 md:p-8 rounded">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Premium Quality</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Each knife is crafted with the finest materials and precision engineering for exceptional performance.
                </p>
              </div>
              <div className="bg-gray-700 p-6 sm:p-7 md:p-8 rounded">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Expert Craftsmanship</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Years of experience and dedication go into every blade, ensuring unmatched quality and durability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
