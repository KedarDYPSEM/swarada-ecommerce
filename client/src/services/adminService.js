import api from './api';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard/stats');
    return res.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const res = await api.get('/admin/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await api.get(`/admin/products/${id}`);
    return res.data;
  },
  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },
  updateProduct: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data;
  },
  toggleProductStatus: async (id) => {
    const res = await api.patch(`/admin/products/${id}/toggle-status`);
    return res.data;
  },
  duplicateProduct: async (id) => {
    const res = await api.post(`/admin/products/${id}/duplicate`);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },
  adjustStock: async (id, data) => {
    const res = await api.post(`/admin/products/${id}/adjust-stock`, data);
    return res.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, data) => {
    const res = await api.put(`/admin/orders/${id}/status`, data);
    return res.data;
  },
  updateShipmentTracking: async (id, data) => {
    const res = await api.put(`/admin/orders/${id}/shipment`, data);
    return res.data;
  },
  cancelOrder: async (id, data) => {
    const res = await api.post(`/admin/orders/${id}/cancel`, data);
    return res.data;
  },

  // Customers
  getCustomers: async (params = {}) => {
    const res = await api.get('/admin/customers', { params });
    return res.data;
  },
  getCustomerById: async (id) => {
    const res = await api.get(`/admin/customers/${id}`);
    return res.data;
  },
  updateCustomer: async (id, data) => {
    const res = await api.put(`/admin/customers/${id}`, data);
    return res.data;
  },
  toggleCustomerStatus: async (id) => {
    const res = await api.patch(`/admin/customers/${id}/status`);
    return res.data;
  },

  // Coupons
  getCoupons: async () => {
    const res = await api.get('/admin/coupons');
    return res.data;
  },
  createCoupon: async (couponData) => {
    const res = await api.post('/admin/coupons', couponData);
    return res.data;
  },
  updateCoupon: async (id, couponData) => {
    const res = await api.put(`/admin/coupons/${id}`, couponData);
    return res.data;
  },
  deleteCoupon: async (id) => {
    const res = await api.delete(`/admin/coupons/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  createCategory: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData);
    return res.data;
  },
  updateCategory: async (id, categoryData) => {
    const res = await api.put(`/admin/categories/${id}`, categoryData);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },

  // Banners
  getBanners: async () => {
    const res = await api.get('/admin/banners');
    return res.data;
  },
  createBanner: async (bannerData) => {
    const res = await api.post('/admin/banners', bannerData);
    return res.data;
  },
  updateBanner: async (id, bannerData) => {
    const res = await api.put(`/admin/banners/${id}`, bannerData);
    return res.data;
  },
  deleteBanner: async (id) => {
    const res = await api.delete(`/admin/banners/${id}`);
    return res.data;
  },

  // Reviews
  getReviews: async (params = {}) => {
    const res = await api.get('/admin/reviews', { params });
    return res.data;
  },
  toggleReviewApproval: async (id, isApproved) => {
    const res = await api.put(`/admin/reviews/${id}/approval`, { isApproved });
    return res.data;
  },
  deleteReview: async (id) => {
    const res = await api.delete(`/admin/reviews/${id}`);
    return res.data;
  },

  // Reports
  getSalesReport: async (params = {}) => {
    const res = await api.get('/admin/reports/sales', { params });
    return res.data;
  },

  // Media Upload (Images & Videos)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    const res = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Settings & Menu Management
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (settingsData) => {
    const res = await api.put('/settings', settingsData);
    return res.data;
  },
  getPublicSettings: async () => {
    const res = await api.get('/settings/public');
    return res.data;
  },
};

export const adminOrderService = adminService;
export default adminService;
