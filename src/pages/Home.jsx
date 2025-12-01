import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();
        const featured = products.filter(p => p.is_featured).slice(0, 3);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/knives-pic2.jpg)' }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 text-center px-6">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
              Sharp Lab by <span className="text-orange-600">OWAIS</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-200 mb-8 font-light tracking-wide drop-shadow-lg">
              Premium Knives. Crafted for Precision.
            </p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded font-bold text-lg transition-colors shadow-xl">
              Explore Collection
            </button>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Featured Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`/${product.image_name}`} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/knives-bg.jpg';
                        }}
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 uppercase tracking-wide">{product.name}</h3>
                      <div className="flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">RS {product.price} PKR</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Sharp Lab</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-700 p-8 rounded">
                <h3 className="text-xl font-semibold text-white mb-4">Premium Quality</h3>
                <p className="text-gray-300">
                  Each knife is crafted with the finest materials and precision engineering for exceptional performance.
                </p>
              </div>
              <div className="bg-gray-700 p-8 rounded">
                <h3 className="text-xl font-semibold text-white mb-4">Expert Craftsmanship</h3>
                <p className="text-gray-300">
                  Years of experience and dedication go into every blade, ensuring unmatched quality and durability.
                </p>
              </div>
              <div className="bg-gray-700 p-8 rounded">
                <h3 className="text-xl font-semibold text-white mb-4">Lifetime Warranty</h3>
                <p className="text-gray-300">
                  We stand behind our products with a comprehensive lifetime warranty on all our knives.
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
