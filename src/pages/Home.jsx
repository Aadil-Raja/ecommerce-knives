import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BannerSlider from '../components/BannerSlider';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { debugLog } from '../utils/config';
import { useHomePage } from '../context/HomePageContext';

function Home() {
  const { 
    featuredProducts: cachedProducts, 
    isCached, 
    cacheFeaturedProducts,
    saveScrollPosition,
    getScrollPosition 
  } = useHomePage();
  
  const [featuredProducts, setFeaturedProducts] = useState(cachedProducts);
  const [imagesLoaded, setImagesLoaded] = useState(isCached);

  useEffect(() => {
    // Only fetch if not cached
    if (!isCached) {
      const fetchFeaturedProducts = async () => {
        try {
          const products = await api.getFeaturedProducts();
          
          debugLog('🚀 FRONTEND: Received ONLY featured products from backend');
          debugLog('📊 FRONTEND: Number of featured products received:', products.length);
          debugLog('📦 FRONTEND: Featured products data:', products);
          
          if (products.length > 0) {
            debugLog('🔑 FRONTEND: Fields in each product:', Object.keys(products[0]));
            debugLog('📋 FRONTEND: Sample featured product:', products[0]);
          }
          
          debugLog('📏 FRONTEND: Payload size (approx):', JSON.stringify(products).length, 'characters');
          debugLog('✅ FRONTEND: No filtering needed - backend sent only featured products!');
          
          setFeaturedProducts(products);
          cacheFeaturedProducts(products); // Cache for future visits
          setImagesLoaded(true);
        } catch (error) {
          console.error('Error fetching featured products:', error);
          setImagesLoaded(true);
        }
      };

      fetchFeaturedProducts();
    } else {
      // Use cached data
      setFeaturedProducts(cachedProducts);
      setImagesLoaded(true);
    }
  }, [isCached, cachedProducts, cacheFeaturedProducts]);

  // Restore scroll position after render
  useEffect(() => {
    if (isCached && imagesLoaded) {
      const savedPosition = getScrollPosition('/');
      console.log('🔄 Restoring scroll position:', savedPosition);
      if (savedPosition > 0) {
        // Multiple attempts to ensure scroll restoration
        const restoreScroll = () => {
          window.scrollTo(0, savedPosition);
          console.log('✅ Scrolled to:', savedPosition, 'Current:', window.scrollY);
        };

        // Immediate attempt
        restoreScroll();
        
        // Backup attempts with delays
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 100);
      }
    }
  }, [isCached, imagesLoaded, getScrollPosition]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Slider Section */}
        <BannerSlider />

        {/* Featured Products */}
        <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 bg-white min-h-[600px] sm:min-h-[700px] md:min-h-[800px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-10 md:mb-12">Featured Products</h2>
            {!imagesLoaded || featuredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-6"></div>
                <p className="text-gray-600 text-xl mb-4">Loading featured products...</p>
                <p className="text-gray-500 text-sm">Please wait while we fetch the latest products</p>
                
                {/* Skeleton Loading Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
      
      {/* Fixed WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}

export default Home;
