import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { getImageUrl, formatPrice, debugLog } from '../../utils/config';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    barcode: '',
    stock: '',
    is_featured: false,
    featured_order: 999,
    specifications: {}
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '', order: 1 }]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        adminAPI.getProducts(),
        adminAPI.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields for image path generation
    if (!formData.name.trim()) {
      alert('Product name is required for image path generation');
      return;
    }
    
    if (!formData.category_id) {
      alert('Category is required for image path generation');
      return;
    }
    
    if (!formData.barcode.trim()) {
      alert('Barcode is required for image path generation');
      return;
    }
    
    // For new products, image is required
    if (!editingProduct && !imageFile) {
      alert('Image is required for new products');
      return;
    }
    
    // Validate specifications have order values
    const hasEmptyOrders = specifications.some(spec => 
      spec.key.trim() && spec.value.trim() && (spec.order === '' || spec.order === null || spec.order === undefined)
    );
    
    if (hasEmptyOrders) {
      alert('All specifications must have an order number (1-100)');
      return;
    }
    
    setUploading(true);

    try {
      let imageName = formData.image_name || '';
      
      // Upload image if selected
      if (imageFile) {
        const selectedCategory = categories.find(c => c.id === parseInt(formData.category_id));
        const uploadResult = await adminAPI.uploadImage(
          imageFile, 
          selectedCategory?.name, 
          formData.name, 
          formData.barcode,
          'product'
        );
        imageName = uploadResult.filename;
      }

      // Convert specifications array to object with order
      const specificationsObj = {};
      
      // Sort by order and normalize to sequential
      const sortedSpecs = specifications
        .filter(spec => spec.key.trim() && spec.value.trim())
        .map(spec => ({
          ...spec,
          order: spec.order === '' || spec.order === null || spec.order === undefined ? 999 : spec.order
        }))
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .map((spec, index) => ({
          ...spec,
          order: index + 1 // Normalize to sequential order
        }));
      
      sortedSpecs.forEach(spec => {
        specificationsObj[spec.key.trim()] = {
          value: spec.value.trim(),
          order: spec.order
        };
      });

      const productData = {
        ...formData,
        image_name: imageName,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        specifications: specificationsObj
      };

      // Debug logging
      debugLog('Product data being sent:', productData);
      debugLog('Specifications object:', specificationsObj);
      debugLog('Specifications type:', typeof specificationsObj);

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, productData);
      } else {
        await adminAPI.createProduct(productData);
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id?.toString() || '',
      barcode: product.barcode || '',
      stock: product.stock?.toString() || '0',
      is_featured: product.is_featured || false,
      featured_order: product.featured_order || 999,
      image_name: product.image_name || '',
      specifications: product.specifications || {}
    });
    
    // Convert specifications object to array for editing
    const specsArray = Object.entries(product.specifications || {}).map(([key, value]) => {
      // Handle both old format (string) and new format (object with order)
      if (typeof value === 'string') {
        return { key, value, order: 999 }; // Legacy format - will be auto-converted
      }
      return {
        key,
        value: value.value || value,
        order: value.order || 999 // Will be auto-converted if 999
      };
    }).sort((a, b) => a.order - b.order); // Sort by order for editing
    
    // Auto-convert legacy 999 orders to valid range (1-100)
    const convertedSpecs = specsArray.map((spec, index) => {
      if (spec.order > 100) {
        return { ...spec, order: index + 1 }; // Assign sequential order
      }
      return spec;
    });
    
    setSpecifications(convertedSpecs.length > 0 ? convertedSpecs : [{ key: '', value: '', order: 1 }]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      barcode: '',
      stock: '',
      is_featured: false,
      featured_order: 999,
      specifications: {}
    });
    setSpecifications([{ key: '', value: '', order: 1 }]);
    setEditingProduct(null);
    setImageFile(null);
    setShowModal(false);
  };

  const addSpecification = () => {
    const nextOrder = Math.max(...specifications.map(s => s.order || 0)) + 1;
    setSpecifications([...specifications, { key: '', value: '', order: nextOrder }]);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      setSpecifications(specifications.filter((_, i) => i !== index));
    }
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    
    if (field === 'order') {
      // Allow empty value during editing
      if (value === '' || value === null || value === undefined) {
        updated[index][field] = '';
        setSpecifications(updated);
        return;
      }
      
      // Validate order input
      let orderValue = parseInt(value);
      
      // Reject invalid inputs (but allow empty)
      if (isNaN(orderValue) || orderValue <= 0) {
        return; // Don't update if invalid
      }
      
      // Handle legacy values (999) by converting to valid range
      if (orderValue > 100) {
        // Find the next available order in valid range (1-100)
        const existingOrders = updated
          .filter((_, i) => i !== index)
          .map(spec => spec.order)
          .filter(order => order !== '' && !isNaN(order) && order <= 100);
        
        // Find next available slot from 1-100
        orderValue = 1;
        while (existingOrders.includes(orderValue) && orderValue <= 100) {
          orderValue++;
        }
        
        // If all 1-100 are taken, use the input value but cap at 100
        if (orderValue > 100) {
          orderValue = 100;
        }
      }
      
      // Check for duplicates and auto-resolve within valid range
      const existingOrders = updated
        .filter((_, i) => i !== index)
        .map(spec => spec.order)
        .filter(order => order !== '' && !isNaN(order) && order <= 100);
      
      let finalOrder = orderValue;
      while (existingOrders.includes(finalOrder) && finalOrder <= 100) {
        finalOrder++;
      }
      
      // Cap at 100
      if (finalOrder > 100) {
        finalOrder = 100;
      }
      
      updated[index][field] = finalOrder;
    } else {
      updated[index][field] = value;
    }
    
    setSpecifications(updated);
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.image_name && (
                      <img
                        className="h-10 w-10 rounded-md object-cover mr-3"
                        src={getImageUrl(product.image_name)}
                        alt={product.name}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category_name || 'No Category'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.barcode || 'No Barcode'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_featured ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <Link
                    to={`/admin/products/${product.id}/images`}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    Images
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter unique product barcode (e.g., BU-001)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for organizing images: product_images/Category/Barcode/
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required={!editingProduct}
                  />
                  {editingProduct && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep current image
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Specifications</label>
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      + Add
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Key (e.g., Material)"
                          value={spec.key}
                          onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., Steel)"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={spec.order || ''}
                          onChange={(e) => updateSpecification(index, 'order', e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          min="1"
                          max="100"
                          title="Order (1-100)"
                        />
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Add product specifications as key-value pairs with display order (1-100)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
                </div>

                {formData.is_featured && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Featured Order</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={formData.featured_order}
                      onChange={(e) => setFormData({...formData, featured_order: parseInt(e.target.value) || 999})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Order for featured products display (1-999). Lower numbers appear first.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;