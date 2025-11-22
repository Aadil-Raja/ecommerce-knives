import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

function Category() {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getCategoryBySlug(categoryName);
        setCategory(data.category);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">{category?.name || 'Category'}</h1>
          <p className="text-xl text-gray-400 mb-12">{category?.description}</p>
          
          {products.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">
                No products available in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-orange-600 transition-colors">
                  <div className="aspect-square bg-zinc-800 flex items-center justify-center">
                    <img 
                      src={`/${product.image_name}`} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/knives-bg.jpg';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">${product.price}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
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
