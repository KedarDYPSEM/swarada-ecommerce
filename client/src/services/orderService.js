import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders');
    return res.data.data.orders;
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data.order;
  },

  async trackOrder(orderNumber) {
    const res = await api.get(`/orders/track/${orderNumber}`);
    return res.data.data.order;
  },

  async getAddresses() {
    const res = await api.get('/customer/addresses');
    return res.data.data.addresses;
  },

  async addAddress(data) {
    const res = await api.post('/customer/addresses', data);
    return res.data.data.address;
  },

  async deleteAddress(id) {
    const res = await api.delete(`/customer/addresses/${id}`);
    return res.data.data.addresses;
  },

  async getWishlist() {
    const res = await api.get('/wishlist');
    return res.data.data.items;
  },

  async addToWishlist(productId) {
    const res = await api.post('/wishlist/items', { productId });
    return res.data.data.items;
  },

  async removeFromWishlist(productId) {
    const res = await api.delete(`/wishlist/items/${productId}`);
    return res.data.data.items;
  },

  async initiatePayment(orderId) {
    const res = await api.post('/payment/initiate', { orderId });
    return res.data.data;
  },

  async verifyPayment(verificationData) {
    const res = await api.post('/payment/verify', verificationData);
    return res.data;
  },
};

export default orderService;
