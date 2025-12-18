import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { getImageUrl } from '../../utils/config';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    is_active: true,
    display_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await adminAPI.getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageName = formData.image_name || '';
      
      // Upload image if selected
      if (imageFile) {
        const uploadResult = await adminAPI.uploadImage(imageFile, null, null, null, 'banner');
        imageName = uploadResult.filename;
      }

      if (!imageName && !editingBanner) {
        alert('Please select an image for the banner');
        setUploading(false);
        return;
      }

      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle,
        link_url: '', // Keep empty - no link functionality
        image_name: imageName,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order)
      };

      if (editingBanner) {
        await adminAPI.updateBanner(editingBanner.id, bannerData);
      } else {
        await adminAPI.createBanner(bannerData);
      }

      await loadBanners();
      resetForm();
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
      image_name: banner.image_name
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await adminAPI.deleteBanner(id);
        await loadBanners();
      } catch (error) {
        console.error('Failed to delete banner:', error);
        alert('Failed to delete banner: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      is_active: true,
      display_order: 0
    });
    setEditingBanner(null);
    setImageFile(null);
    setShowModal(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={getImageUrl(banner.image_name)}
                alt={banner.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{banner.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {banner.subtitle && (
                <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Order: {banner.display_order}</span>
                <span>{new Date(banner.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(banner)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required={!editingBanner}
                  />
                  {editingBanner && formData.image_name && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(formData.image_name)}
                        alt="Current banner"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Banner
                  </label>
                </div>

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

export default AdminBanners;