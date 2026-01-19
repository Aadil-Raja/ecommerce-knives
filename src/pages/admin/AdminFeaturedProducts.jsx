import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { getImageUrl } from '../../utils/config';

const AdminFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingChanges, setPendingChanges] = useState({}); // Track pending order changes
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await adminAPI.getFeaturedProducts();
      setProducts(data);
      setPendingChanges({}); // Clear pending changes when loading fresh data
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderInputChange = (productId, value) => {
    // Allow empty value during editing (like specifications)
    if (value === '' || value === null || value === undefined) {
      setPendingChanges(prev => ({ ...prev, [productId]: '' }));
      setHasChanges(true);
      return;
    }

    // Validate order input
    let orderValue = parseInt(value);
    
    // Reject invalid inputs (but allow empty)
    if (isNaN(orderValue) || orderValue <= 0) {
      return; // Don't update if invalid
    }
    
    // Validate range (1-999 for featured products)
    if (orderValue > 999) {
      orderValue = 999;
    }
    
    // Check for duplicates and auto-resolve
    const currentOrders = Object.values(pendingChanges)
      .filter(order => order !== '' && !isNaN(order))
      .map(order => parseInt(order));
    
    const existingOrders = products
      .filter(p => p.id !== productId)
      .map(p => pendingChanges[p.id] !== undefined ? parseInt(pendingChanges[p.id]) || p.featured_order : p.featured_order)
      .filter(order => !isNaN(order));
    
    const allExistingOrders = [...currentOrders, ...existingOrders];
    
    let finalOrder = orderValue;
    while (allExistingOrders.includes(finalOrder) && finalOrder <= 999) {
      finalOrder++;
    }
    
    // Cap at 999
    if (finalOrder > 999) {
      finalOrder = 999;
    }
    
    setPendingChanges(prev => ({ ...prev, [productId]: finalOrder }));
    setHasChanges(true);
  };

  const applyChanges = async () => {
    if (!hasChanges || Object.keys(pendingChanges).length === 0) {
      return;
    }

    setUpdating(prev => ({ ...prev, applying: true }));
    
    try {
      // Apply all pending changes
      const updatePromises = Object.entries(pendingChanges).map(([productId, newOrder]) => {
        const finalOrder = newOrder === '' ? 999 : parseInt(newOrder) || 999;
        return adminAPI.updateFeaturedOrder(parseInt(productId), finalOrder);
      });

      await Promise.all(updatePromises);
      
      // Show success message
      setSuccessMessage(`Featured product orders updated successfully`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Reload data and clear pending changes
      await loadFeaturedProducts();
    } catch (error) {
      console.error('Failed to apply changes:', error);
      alert('Failed to apply changes: ' + error.message);
    } finally {
      setUpdating(prev => ({ ...prev, applying: false }));
    }
  };

  const cancelChanges = () => {
    setPendingChanges({});
    setHasChanges(false);
  };

  const handleFeaturedToggle = async (productId, currentStatus) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      await adminAPI.updateFeaturedStatus(productId, !currentStatus);
      
      // Show success message
      setSuccessMessage(`Product ${!currentStatus ? 'added to' : 'removed from'} featured products`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      await loadFeaturedProducts();
    } catch (error) {
      console.error('Failed to update featured status:', error);
      alert('Failed to update featured status: ' + error.message);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getDisplayOrder = (product) => {
    // Show pending change if exists, otherwise show current order
    return pendingChanges[product.id] !== undefined ? pendingChanges[product.id] : product.featured_order;
  };

  const isOrderChanged = (productId) => {
    return pendingChanges[productId] !== undefined;
  };

  if (loading) {
    return <div className="text-center py-8">Loading featured products...</div>;
  }

  return (
    <div>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Featured Products</h1>
        <div className="flex items-center space-x-4">
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <button
                onClick={cancelChanges}
                disabled={updating.applying}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel Changes
              </button>
              <button
                onClick={applyChanges}
                disabled={updating.applying}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
              >
                {updating.applying && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{updating.applying ? 'Applying...' : 'Apply Changes'}</span>
              </button>
            </div>
          )}
          <div className="text-sm text-gray-600">
            Total Featured: {products.length}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No featured products found. Go to Products to mark products as featured.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={updating[product.id] ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={getDisplayOrder(product)}
                          onChange={(e) => handleOrderInputChange(product.id, e.target.value)}
                          disabled={updating[product.id] || updating.applying}
                          className={`w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isOrderChanged(product.id) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300'
                          }`}
                          placeholder="Order"
                        />
                        {isOrderChanged(product.id) && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-blue-600 font-medium">Changed</span>
                            <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                        )}
                        {(updating[product.id] || updating.applying) && (
                          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {product.main_image ? (
                            <img
                              className="h-16 w-16 object-cover rounded-lg"
                              src={getImageUrl(product.main_image)}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name || 'No Category'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {parseFloat(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleFeaturedToggle(product.id, product.is_featured)}
                        disabled={updating[product.id]}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                          updating[product.id]
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {updating[product.id] && (
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        <span>Remove from Featured</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Featured Products Order Guidelines:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Order must be between 1 and 999</li>
          <li>• Lower numbers appear first on the website</li>
          <li>• You can clear the field while editing (will default to 999)</li>
          <li>• Duplicate orders are auto-resolved by incrementing</li>
          <li>• Changes are highlighted in blue - click "Apply Changes" to save</li>
          <li>• Use "Cancel Changes" to revert unsaved modifications</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminFeaturedProducts;