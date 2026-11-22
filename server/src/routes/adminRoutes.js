const express = require('express');
const { requireAdmin } = require('../middleware/admin');

const adminDashboard = require('../controllers/adminDashboardController');
const adminProduct = require('../controllers/adminProductController');
const adminOrder = require('../controllers/adminOrderController');
const adminCustomer = require('../controllers/adminCustomerController');
const adminCoupon = require('../controllers/adminCouponController');
const adminCategory = require('../controllers/adminCategoryController');
const adminBanner = require('../controllers/adminBannerController');
const reviewController = require('../controllers/reviewController');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Apply requireAdmin to all admin routes
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', adminDashboard.getStats);

// Products
router.get('/products', adminProduct.listProducts);
router.post('/products', adminProduct.createProduct);
router.get('/products/:id', adminProduct.getProductById);
router.put('/products/:id', adminProduct.updateProduct);
router.delete('/products/:id', adminProduct.deleteProduct);
router.post('/products/:id/duplicate', adminProduct.duplicateProduct);
router.post('/products/:id/adjust-stock', adminProduct.adjustStock);

// Orders
router.get('/orders', adminOrder.listOrders);
router.get('/orders/:id', adminOrder.getOrderById);
router.put('/orders/:id/status', adminOrder.updateOrderStatus);
router.put('/orders/:id/shipment', adminOrder.updateShipmentTracking);
router.post('/orders/:id/cancel', adminOrder.cancelOrder);

// Customers
router.get('/customers', adminCustomer.listCustomers);
router.get('/customers/:id', adminCustomer.getCustomerById);
router.put('/customers/:id', adminCustomer.updateCustomer);
router.patch('/customers/:id/status', adminCustomer.toggleCustomerStatus);

// Coupons
router.get('/coupons', adminCoupon.listCoupons);
router.post('/coupons', adminCoupon.createCoupon);
router.put('/coupons/:id', adminCoupon.updateCoupon);
router.delete('/coupons/:id', adminCoupon.deleteCoupon);

// Categories
router.get('/categories', adminCategory.listCategories);
router.post('/categories', adminCategory.createCategory);
router.put('/categories/:id', adminCategory.updateCategory);
router.delete('/categories/:id', adminCategory.deleteCategory);

// Banners
router.get('/banners', adminBanner.listBanners);
router.post('/banners', adminBanner.createBanner);
router.put('/banners/:id', adminBanner.updateBanner);
router.delete('/banners/:id', adminBanner.deleteBanner);

// Reviews Moderation
router.get('/reviews', reviewController.listAdminReviews);
router.put('/reviews/:id/approval', reviewController.toggleApproval);
router.delete('/reviews/:id', reviewController.deleteReview);

// Reports
router.get('/reports/sales', reportController.getSalesReport);

module.exports = router;
