import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data.data;
  },

  async getProductBySlug(slug) {
    const res = await api.get(`/products/${slug}`);
    return res.data.data;
  },

  async searchProducts(q, limit = 8) {
    const res = await api.get('/products/search', { params: { q, limit } });
    return res.data.data.products;
  },

  async getFilterOptions() {
    const res = await api.get('/products/filter-options');
    return res.data.data.filters;
  },
};

export default productService;
