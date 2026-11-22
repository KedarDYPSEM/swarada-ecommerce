import api from './api';

export const homepageService = {
  async getHomepageData() {
    const res = await api.get('/homepage');
    return res.data.data;
  },

  async getBanners(type = null) {
    const res = await api.get('/homepage/banners', { params: { type } });
    return res.data.data.banners;
  },
};

export default homepageService;
