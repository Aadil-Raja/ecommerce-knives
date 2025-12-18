const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

class AdminAPI {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async logout() {
    return this.request('/admin/logout', {
      method: 'POST',
    });
  }

  async checkAuth() {
    return this.request('/admin/check-auth');
  }

  // Dashboard
  async getDashboard() {
    return this.request('/admin/dashboard');
  }

  // Products
  async getProducts() {
    return this.request('/admin/products');
  }

  async createProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/admin/categories');
  }

  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: categoryData,
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: categoryData,
    });
  }

  async deleteCategory(id) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request('/admin/orders');
  }

  async updateOrderStatus(id, status) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  // Banners
  async getBanners() {
    return this.request('/admin/banners');
  }

  async createBanner(bannerData) {
    return this.request('/admin/banners', {
      method: 'POST',
      body: bannerData,
    });
  }

  async updateBanner(id, bannerData) {
    return this.request(`/admin/banners/${id}`, {
      method: 'PUT',
      body: bannerData,
    });
  }

  async deleteBanner(id) {
    return this.request(`/admin/banners/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Images
  async getProductImages(productId) {
    return this.request(`/admin/products/${productId}/images`);
  }

  async addProductImage(productId, file, isMain = false, displayOrder = 0, altText = '') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_main', isMain.toString());
    formData.append('display_order', displayOrder.toString());
    formData.append('alt_text', altText);

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/upload-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async addProductImagesBulk(productId, files, isMain = false, displayOrder = 0) {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('images', file);
    });
    
    formData.append('is_main', isMain.toString());
    formData.append('display_order', displayOrder.toString());

    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/upload-images-bulk`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Bulk upload failed');
    }

    return response.json();
  }

  async updateProductImage(imageId, data) {
    return this.request(`/admin/product-images/${imageId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteProductImage(imageId) {
    return this.request(`/admin/product-images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // Image Upload
  async uploadImage(file, categoryName = null, productName = null, barcode = null, imageType = 'product') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('image_type', imageType);
    
    if (categoryName) formData.append('category_name', categoryName);
    if (productName) formData.append('product_name', productName);
    if (barcode) formData.append('barcode', barcode);

    const response = await fetch(`${API_BASE_URL}/admin/upload-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();