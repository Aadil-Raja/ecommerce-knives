import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { getImageUrl, formatPrice, debugLog } from '../utils/config';

function Category() {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Immediately clear old data when category changes
    setCategory(null);
    setProducts([]);
    setLoading(true);
    setImagesLoaded(false);
    setCurrentPage(1);
    setPagination(null);
    
    const fetchData = async () => {
      try {
        const data = await api.getCategoryBySlug(categoryName, 1, 10);
        
        debugLog('🚀 FRONTEND: Received paginated category products');
        debugLog('📂 FRONTEND: Category:', data.category);
        debugLog('📊 FRONTEND: Number of products received:', data.products.length);
        debugLog('📄 FRONTEND: Pagination info:', data.pagination);
        debugLog('📦 FRONTEND: Full category response:', data);
        
        if (data.products.length > 0) {
          debugLog('🔑 FRONTEND: Fields in each product:', Object.keys(data.products[0]));
          debugLog('📋 FRONTEND: Sample product:', data.products[0]);
        }
        
        debugLog('📏 FRONTEND: Products payload size (approx):', JSON.stringify(data.products).length, 'characters');
        debugLog('📏 FRONTEND: Total payload size (approx):', JSON.stringify(data).length, 'characters');
        
        setCategory(data.category);
        setProducts(data.products);
        setPagination(data.pagination);
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

  const loadMoreProducts = async () => {
    if (!pagination?.has_more || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await api.getCategoryBySlug(categoryName, nextPage, 10);
      
      debugLog('🔄 FRONTEND: Loading more products - Page', nextPage);
      debugLog('📊 FRONTEND: Additional products received:', data.products.length);
      
      setProducts(prevProducts => [...prevProducts, ...data.products]);
      setPagination(data.pagination);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

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
            <>
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
              
              {/* Load More Button */}
              {pagination?.has_more && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded font-semibold transition-colors"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading More...
                      </span>
                    ) : (
                      `Load More Products (${pagination.total - products.length} remaining)`
                    )}
                  </button>
                </div>
              )}
              
              {/* Pagination Info */}
              {pagination && (
                <div className="text-center mt-6 text-gray-600 text-sm">
                  Showing {products.length} of {pagination.total} products
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Category;
