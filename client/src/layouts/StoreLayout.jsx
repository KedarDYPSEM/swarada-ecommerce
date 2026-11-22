import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import CartDrawer from '../components/cart/CartDrawer';

export const StoreLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
};

export default StoreLayout;
