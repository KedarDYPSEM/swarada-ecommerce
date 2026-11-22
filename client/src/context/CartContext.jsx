import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async (activeCoupon = couponCode) => {
    try {
      const data = await cartService.getCart(activeCoupon || null);
      if (data) {
        setCart(data);
      }
    } catch (err) {
      // Ignore initial cart errors
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, variantId = null) => {
    setError(null);
    setIsLoading(true);
    try {
      const updatedCart = await cartService.addItem(productId, quantity, variantId);
      setCart(updatedCart);
      setIsDrawerOpen(true);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not add item to cart.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    setIsLoading(true);
    try {
      const updatedCart = await cartService.updateItem(itemId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setIsLoading(true);
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setError(null);
    try {
      const subtotal = cart?.summary?.subtotal || 0;
      await cartService.validateCoupon(code, subtotal);
      setCouponCode(code);
      await fetchCart(code);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid coupon code';
      setError(msg);
      throw new Error(msg);
    }
  };

  const removeCoupon = async () => {
    setCouponCode('');
    await fetchCart('');
  };

  const clearLocalCart = () => {
    setCart(null);
    setCouponCode('');
  };

  const items = cart?.items || [];
  const summary = cart?.summary || {
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 0,
    gstAmount: 0,
    totalAmount: 0,
    itemCount: 0,
    amountNeededForFreeShipping: 2999,
  };

  const value = {
    cart,
    items,
    summary,
    itemCount: summary.itemCount,
    couponCode,
    isDrawerOpen,
    isLoading,
    error,
    openCartDrawer: () => setIsDrawerOpen(true),
    closeCartDrawer: () => setIsDrawerOpen(false),
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
    clearLocalCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
