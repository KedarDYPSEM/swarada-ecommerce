import api from './api';

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories');
    return res.data.data.categories;
  },

  async getCategoryBySlug(slug) {
    const res = await api.get(`/categories/${slug}`);
    return res.data.data.category;
  },
};

export default categoryService;
