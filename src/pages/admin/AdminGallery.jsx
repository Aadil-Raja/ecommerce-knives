import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { getImageUrl } from '../../utils/config';

function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    alt_text: '',
    is_active: true,
    display_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGalleryImages();
      setImages(response);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      alert('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const checkImageNameExists = async (filename) => {
    try {
      const response = await adminAPI.checkGalleryImageName(filename);
      return response.exists;
    } catch (error) {
      console.error('Error checking image name:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingImage && !imageFile) {
      alert('Please select an image file');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    // Check for duplicate names when uploading new image
    if (!editingImage && imageFile) {
      const exists = await checkImageNameExists(imageFile.name);
      if (exists) {
        alert('An image with this name already exists. Please rename the file or choose a different image.');
        return;
      }
    }

    try {
      setUploading(true);
      
      if (editingImage) {
        // Update existing image
        await adminAPI.updateGalleryImage(editingImage.id, formData);
        alert('Gallery image updated successfully');
      } else {
        // Create new image
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        uploadData.append('title', formData.title);
        uploadData.append('alt_text', formData.alt_text);
        uploadData.append('is_active', formData.is_active);
        uploadData.append('display_order', formData.display_order);
        
        await adminAPI.createGalleryImage(uploadData);
        alert('Gallery image uploaded successfully');
      }
      
      // Reset form and refresh
      resetForm();
      fetchImages();
      
    } catch (error) {
      console.error('Error saving gallery image:', error);
      alert(error.response?.data?.error || 'Failed to save gallery image');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      alt_text: image.alt_text || '',
      is_active: image.is_active,
      display_order: image.display_order
    });
    setShowUploadForm(true);
  };

  const handleDelete = async (image) => {
    if (!confirm(`Are you sure you want to delete "${image.title}"?`)) {
      return;
    }
    
    try {
      await adminAPI.deleteGalleryImage(image.id);
      alert('Gallery image deleted successfully');
      fetchImages();
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      alert('Failed to delete gallery image');
    }
  };

  const toggleActive = async (image) => {
    try {
      await adminAPI.updateGalleryImage(image.id, {
        is_active: !image.is_active
      });
      fetchImages();
    } catch (error) {
      console.error('Error updating gallery image:', error);
      alert('Failed to update gallery image status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      alt_text: '',
      is_active: true,
      display_order: 0
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingImage(null);
    setShowUploadForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
        >
          {showUploadForm ? 'Cancel' : 'Add New Image'}
        </button>
      </div>

      {/* Upload/Edit Form */}
      {showUploadForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {editingImage ? 'Edit Gallery Image' : 'Upload New Gallery Image'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  required={!editingImage}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) => setFormData({...formData, alt_text: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the image for accessibility"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (visible on frontend)
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {uploading ? 'Saving...' : (editingImage ? 'Update' : 'Upload')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Images Grid */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Gallery Images ({images.length})</h2>
          
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No gallery images found. Upload your first image to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getImageUrl(image.image_name)}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate" title={image.title}>
                      {image.title}
                    </h3>
                    
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>Order: {image.display_order}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        image.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(image)}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(image)}
                        className={`flex-1 px-3 py-1 rounded text-sm ${
                          image.is_active
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {image.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleDelete(image)}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGallery;