import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

const AdminDiscounts = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [discountForm, setDiscountForm] = useState({
    discount_percentage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, discountsRes] = await Promise.all([
        adminAPI.getProducts(),
        adminAPI.getAllDiscountsAdmin()
      ]);
      
      setProducts(productsRes);
      setDiscounts(discountsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !discountForm.discount_percentage) {
      alert('Please select a product and enter discount percentage');
      return;
    }

    // Get product name for confirmation
    const selectedProductObj = products.find(p => p.id == selectedProduct);
    const productName = selectedProductObj ? selectedProductObj.name : 'Selected Product';
    const discountPercent = discountForm.discount_percentage;
    
    const confirmMessage = `Apply ${discountPercent}% discount to "${productName}"?\n\nThis will:\n• Show discounted price to customers\n• Override any existing discount for this product\n• Be immediately visible on the website`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await adminAPI.applyDiscount(selectedProduct, discountForm);
      
      // Show success message with details
      const originalPrice = selectedProductObj ? parseFloat(selectedProductObj.price) : 0;
      const discountAmount = originalPrice * (discountPercent / 100);
      const finalPrice = originalPrice - discountAmount;
      
      alert(`✅ Discount Applied Successfully!\n\nProduct: ${productName}\nOriginal Price: Rs. ${originalPrice.toLocaleString()}\nDiscount: ${discountPercent}% (Rs. ${discountAmount.toLocaleString()})\nNew Price: Rs. ${finalPrice.toLocaleString()}\n\nCustomers will now see the discounted price!`);
      
      // Reset form
      setSelectedProduct('');
      setDiscountForm({
        discount_percentage: ''
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('❌ Error applying discount. Please try again.');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const actionTitle = currentStatus ? 'Deactivate' : 'Activate';
    
    const confirmMessage = currentStatus 
      ? `${actionTitle} Discount?\n\nThis will:\n• Hide the discount from customers\n• Show original prices on the website\n• Keep the discount settings for future use\n\nYou can reactivate it anytime.`
      : `${actionTitle} Discount?\n\nThis will:\n• Show discounted prices to customers\n• Make the discount visible on the website\n• Apply immediately to all product displays`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const newStatus = !currentStatus;
      await adminAPI.toggleDiscountStatus(productId, newStatus);
      
      const actionPast = newStatus ? 'activated' : 'deactivated';
      const statusMessage = newStatus 
        ? '✅ Discount Activated!\n\nCustomers can now see the discounted price on the website.'
        : '✅ Discount Deactivated!\n\nCustomers will now see the original price. The discount settings are saved and can be reactivated anytime.';
      
      alert(statusMessage);
      
      fetchData();
    } catch (error) {
      console.error('Error toggling discount status:', error);
      alert('❌ Error updating discount status. Please try again.');
    }
  };

  const handleRemoveDiscount = async (productId, productName) => {
    const confirmMessage = `⚠️ Permanently Delete Discount?\n\nProduct: "${productName}"\n\nThis will:\n• Completely remove the discount from the database\n• Show original prices to customers\n• Delete all discount history for this product\n• CANNOT be undone\n\nAre you sure you want to permanently delete this discount?\n\n(Tip: Consider using "Deactivate" instead to keep the discount settings)`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for permanent deletion
    const doubleConfirm = window.confirm(`🚨 Final Confirmation\n\nYou are about to PERMANENTLY DELETE the discount for "${productName}".\n\nThis action CANNOT be reversed!\n\nClick OK to proceed with permanent deletion, or Cancel to go back.`);
    
    if (!doubleConfirm) {
      return;
    }

    try {
      await adminAPI.deleteDiscountPermanently(productId);
      alert(`✅ Discount Permanently Deleted!\n\nThe discount for "${productName}" has been completely removed from the database.\n\nCustomers will now see the original price.`);
      fetchData();
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('❌ Error deleting discount. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
          <p className="mt-2 text-gray-600">Manage product discounts and promotions</p>
        </div>

        {/* Apply New Discount */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply New Discount</h2>
          
          <form onSubmit={handleApplyDiscount} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountForm.discount_percentage}
                onChange={(e) => setDiscountForm({...discountForm, discount_percentage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 font-medium"
              >
                ✨ Apply Discount
              </button>
            </div>
          </form>
        </div>

        {/* Active Discounts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Discounts</h2>
          </div>

          {discounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No discounts found. Create your first discount above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discounted Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {discount.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(discount.product_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {discount.discount_percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(discount.discounted_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(discount.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          discount.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleStatus(discount.product_id, discount.is_active)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                              discount.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            }`}
                            title={discount.is_active ? 'Hide discount from customers' : 'Show discount to customers'}
                          >
                            {discount.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          <button
                            onClick={() => handleRemoveDiscount(discount.product_id, discount.product_name)}
                            className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-red-700 hover:bg-red-100 border border-red-300 transition-colors duration-200"
                            title="Permanently delete this discount"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDiscounts;