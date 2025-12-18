import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { getImageUrl } from '../../utils/config';

const AdminProductImages = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    is_main: false,
    display_order: 0,
    alt_text: ''
  });
  const [isMultipleUpload, setIsMultipleUpload] = useState(false);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      const [productsData, imagesData] = await Promise.all([
        adminAPI.getProducts(),
        adminAPI.getProductImages(productId)
      ]);
      
      const currentProduct = productsData.find(p => p.id === parseInt(productId));
      setProduct(currentProduct);
      setImages(imagesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return;

    setUploading(true);
    try {
      if (isMultipleUpload && imageFiles.length > 1) {
        // Bulk upload multiple images
        await adminAPI.addProductImagesBulk(
          productId,
          imageFiles,
          formData.is_main,
          formData.display_order
        );
      } else {
        // Single image upload
        await adminAPI.addProductImage(
          productId,
          imageFiles[0],
          formData.is_main,
          formData.display_order,
          formData.alt_text
        );
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to upload image(s):', error);
      alert('Failed to upload image(s): ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetMain = async (imageId) => {
    try {
      await adminAPI.updateProductImage(imageId, { is_main: true });
      await loadData();
    } catch (error) {
      console.error('Failed to set main image:', error);
      alert('Failed to set main image: ' + error.message);
    }
  };

  const handleUpdateOrder = async (imageId, newOrder) => {
    try {
      await adminAPI.updateProductImage(imageId, { display_order: parseInt(newOrder) });
      await loadData();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order: ' + error.message);
    }
  };

  const handleDelete = async (imageId) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await adminAPI.deleteProductImage(imageId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete image:', error);
        alert('Failed to delete image: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      is_main: false,
      display_order: 0,
      alt_text: ''
    });
    setImageFiles([]);
    setIsMultipleUpload(false);
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setIsMultipleUpload(files.length > 1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/admin/products" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Images: {product?.name}
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Image
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={getImageUrl(image.image_name)}
                alt={image.alt_text || 'Product image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  image.is_main ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {image.is_main ? 'Main' : 'Gallery'}
                </span>
                <span className="text-sm text-gray-500">Order: {image.display_order}</span>
              </div>
              
              {image.alt_text && (
                <p className="text-sm text-gray-600 mb-3 truncate" title={image.alt_text}>
                  {image.alt_text}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={image.display_order}
                    onChange={(e) => handleUpdateOrder(image.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="Order"
                  />
                  {!image.is_main && (
                    <button
                      onClick={() => handleSetMain(image.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Set Main
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => handleDelete(image.id)}
                  className="w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images uploaded yet.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Product Image</h3>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image File(s)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  {imageFiles.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      {imageFiles.length} file(s) selected
                      {isMultipleUpload && " (Multiple upload mode)"}
                    </p>
                  )}
                </div>

                {!isMultipleUpload && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                      <input
                        type="text"
                        value={formData.alt_text}
                        onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Description of the image"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Display Order {isMultipleUpload && "(Starting number)"}
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                  {isMultipleUpload && (
                    <p className="mt-1 text-xs text-gray-500">
                      Images will be numbered sequentially starting from this number
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_main"
                    checked={formData.is_main}
                    onChange={(e) => setFormData({...formData, is_main: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_main" className="text-sm font-medium text-gray-700">
                    {isMultipleUpload ? "Set first image as main" : "Set as main image"}
                  </label>
                </div>

                {isMultipleUpload && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Multiple Upload Mode:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Alt text will be skipped for faster upload</li>
                      <li>• Display order will increment automatically</li>
                      <li>• Only first image can be set as main</li>
                    </ul>
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
                    {uploading 
                      ? `Uploading${isMultipleUpload ? ` ${imageFiles.length} images` : ''}...` 
                      : `Upload ${isMultipleUpload ? `${imageFiles.length} Images` : 'Image'}`
                    }
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

export default AdminProductImages;