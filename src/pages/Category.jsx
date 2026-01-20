import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { api } from '../services/api';
import { getImageUrl, formatPrice, debugLog, PRODUCTS_PER_PAGE } from '../utils/config';

function Category() {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [pagination, setPagination] = useState(null);
  
  // Get current page from URL, default to 1
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Function to properly format category name
  const formatCategoryName = (slug) => {
    if (!slug) return 'Category';
    
    const lowerSlug = slug.toLowerCase();
    
    // Map specific slugs to full names based on actual database slugs
    const categoryMap = {
      'chef': 'Chef Knife',
      'butcher': 'Butcher Knife',
      'kitchen': 'Kitchen Knife', 
      'hunting': 'Hunting Knife'
    };
    
    // If we have a direct mapping, use it
    if (categoryMap[lowerSlug]) {
      return categoryMap[lowerSlug];
    }
    
    // If slug already contains "knife", just capitalize it properly
    if (lowerSlug.includes('knife')) {
      return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Otherwise, add "Knife" to the formatted slug
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${formatted} Knife`;
  };

  useEffect(() => {
    // Debug: Log the categoryName to see what we're getting
    console.log('🔍 DEBUG: categoryName from URL:', categoryName);
    console.log('🔍 DEBUG: formatted name:', formatCategoryName(categoryName));
    
    // Immediately clear old data when category or page changes
    setCategory(null);
    setProducts([]);
    setLoading(true);
    setImagesLoaded(false);
    setPagination(null);
    
    const fetchData = async () => {
      try {
        const data = await api.getCategoryBySlug(categoryName, currentPage, PRODUCTS_PER_PAGE);
        
        debugLog('🚀 FRONTEND: Received paginated category products');
        debugLog('📂 FRONTEND: Category:', data.category);
        debugLog('📄 FRONTEND: Current page:', currentPage);
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
  }, [categoryName, currentPage]);

  const goToPage = (page) => {
    if (page === 1) {
      // Remove page parameter for page 1 (cleaner URLs)
      navigate(`/category/${categoryName}`);
    } else {
      navigate(`/category/${categoryName}?page=${page}`);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const pages = [];
    const totalPages = pagination.total_pages;
    const current = pagination.page;

    // Always show first page
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push('...');
    }

    // Show pages around current page
    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pages.push(i);
    }

    // Always show last page
    if (current < totalPages - 2) {
      if (current < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        {/* Previous Button */}
        <button
          onClick={() => goToPage(current - 1)}
          disabled={current === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => (
          <span key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm font-medium text-gray-700">...</span>
            ) : (
              <button
                onClick={() => goToPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === current
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )}
          </span>
        ))}

        {/* Next Button */}
        <button
          onClick={() => goToPage(current + 1)}
          disabled={current === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading || !imagesLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 px-6 min-h-[800px]">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center uppercase tracking-wide">
              {category?.name || formatCategoryName(categoryName)}
            </h1>
            <div className="flex flex-col items-center justify-center py-20 min-h-[500px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-6"></div>
                <p className="text-gray-600 text-xl mb-4">Loading products...</p>
                <p className="text-gray-500 text-sm mb-12">Fetching the latest {category?.name || formatCategoryName(categoryName)} products</p>
                
                {/* Skeleton Loading Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
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
              
              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Fixed WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}

export default Category;
