import api from './api';

export const cartService = {
  async getCart(coupon = null) {
    const res = await api.get('/cart', { params: { coupon } });
    return res.data.data;
  },

  async addItem(productId, quantity = 1, variantId = null) {
    const res = await api.post('/cart/items', { productId, quantity, variantId });
    return res.data.data;
  },

  async updateItem(itemId, quantity) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  async removeItem(itemId) {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async validateCoupon(code, subtotal) {
    const res = await api.post('/coupons/validate', { code, subtotal });
    return res.data.data;
  },
};

export default cartService;
