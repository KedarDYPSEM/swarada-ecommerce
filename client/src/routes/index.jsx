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

// Admin Portal
import AdminLogin from '../admin/AdminLogin';
import AdminDashboard from '../admin/AdminDashboard';

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
          <Route path="profile" element={<CustomerDashboard />} />
          <Route path="password" element={<CustomerDashboard />} />
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
        <Route path="products" element={<AdminDashboard />} />
        <Route path="products/new" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminDashboard />} />
        <Route path="customers" element={<AdminDashboard />} />
        <Route path="coupons" element={<AdminDashboard />} />
        <Route path="banners" element={<AdminDashboard />} />
        <Route path="reviews" element={<AdminDashboard />} />
        <Route path="reports" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminDashboard />} />
      </Route>

      {/* ─── 404 Catch-All ───────────────────────────────────── */}
      <Route path="*" element={<StoreLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
