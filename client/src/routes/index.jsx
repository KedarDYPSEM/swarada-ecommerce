import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import StoreLayout from '../layouts/StoreLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductPage from '../pages/ProductPage';
import CartPage from '../pages/CartPage';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import TrackOrder from '../pages/TrackOrder';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';

// Customer Auth & Portal
import CustomerLogin from '../customer/Login';
import CustomerRegister from '../customer/Register';
import CustomerDashboard from '../customer/Dashboard';
import CustomerOrders from '../customer/Orders';
import CustomerAddresses from '../customer/Addresses';
import CustomerWishlist from '../customer/Wishlist';
import CustomerProfile from '../customer/Profile';
import CustomerPassword from '../customer/Password';

// Admin Portal
import AdminLogin from '../admin/AdminLogin';
import AdminDashboard from '../admin/AdminDashboard';
import ProductList from '../admin/products/ProductList';
import ProductForm from '../admin/products/ProductForm';
import CategoryManager from '../admin/categories/CategoryManager';
import OrderList from '../admin/orders/OrderList';
import OrderDetail from '../admin/orders/OrderDetail';
import CustomerList from '../admin/customers/CustomerList';
import CouponManager from '../admin/coupons/CouponManager';
import BannerManager from '../admin/banners/BannerManager';
import SettingsManager from '../admin/settings/SettingsManager';
import ReviewManager from '../admin/reviews/ReviewManager';
import ReportsManager from '../admin/reports/ReportsManager';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── Public Storefront Routes ──────────────────────────── */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:slug" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/search" element={<Shop />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<About />} />
        <Route path="/policies" element={<About />} />

        {/* Customer Auth Pages */}
        <Route path="/account/login" element={<CustomerLogin />} />
        <Route path="/account/register" element={<CustomerRegister />} />

        {/* Protected Customer Portal */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="wishlist" element={<CustomerWishlist />} />
          <Route path="addresses" element={<CustomerAddresses />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="password" element={<CustomerPassword />} />
        </Route>
      </Route>

      {/* ─── Admin Portal Routes ──────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="banners" element={<BannerManager />} />
        <Route path="reviews" element={<ReviewManager />} />
        <Route path="reports" element={<ReportsManager />} />
        <Route path="settings" element={<SettingsManager />} />
      </Route>

      {/* ─── 404 Catch-All ───────────────────────────────────── */}
      <Route path="*" element={<StoreLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
