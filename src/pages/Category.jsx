import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { getImageUrl, formatPrice } from '../utils/config';

function Category() {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Immediately clear old data when category changes
    setCategory(null);
    setProducts([]);
    setLoading(true);
    setImagesLoaded(false);
    
    const fetchData = async () => {
      try {
        const data = await api.getCategoryBySlug(categoryName);
        
        console.log('🚀 FRONTEND: Received lightweight category products');
        console.log('📂 FRONTEND: Category:', data.category);
        console.log('📊 FRONTEND: Number of products received:', data.products.length);
        console.log('📦 FRONTEND: Full category response:', data);
        
        if (data.products.length > 0) {
          console.log('🔑 FRONTEND: Fields in each product:', Object.keys(data.products[0]));
          console.log('📋 FRONTEND: Sample product:', data.products[0]);
        }
        
        console.log('📏 FRONTEND: Products payload size (approx):', JSON.stringify(data.products).length, 'characters');
        console.log('📏 FRONTEND: Total payload size (approx):', JSON.stringify(data).length, 'characters');
        
        setCategory(data.category);
        setProducts(data.products);
        setImagesLoaded(true); // Show content immediately, let images load lazily
      } catch (error) {
        console.error('Error fetching products:', error);
        setImagesLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

  if (loading || !imagesLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center uppercase tracking-wide">
              {categoryName ? categoryName.replace(/-/g, ' ') : 'Category'}
            </h1>
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-600 text-xl">Loading products...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center uppercase tracking-wide">{category?.name || 'Category'}</h1>
          <p className="text-xl text-gray-600 mb-12 text-center">{category?.description}</p>
          
          {products.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-12 text-center">
              <p className="text-gray-600 text-lg">
                No product found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={getImageUrl(product.main_image || product.image_name)} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={(e) => e.target.style.opacity = '1'}
                      style={{ opacity: '0', transition: 'opacity 0.3s ease-in-out' }}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{product.name}</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-600">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Category;
