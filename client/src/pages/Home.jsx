import React from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromoBanner from '../components/home/PromoBanner';
import WhyShopWithUs from '../components/home/WhyShopWithUs';
import Testimonials from '../components/home/Testimonials';
import InstagramGallery from '../components/home/InstagramGallery';
import Newsletter from '../components/home/Newsletter';

export const Home = () => {
  return (
    <div className="space-y-0">
      {/* 6. Multi-Slide Hero Banner */}
      <HeroBanner />

      {/* 7. Shop by Category */}
      <CategoryShowcase />

      {/* 8, 9, 10, 11. Featured Collections & New Arrivals & Trending Sarees */}
      <FeaturedProducts title="New Arrivals & Trending Sarees" defaultTab="new" />

      {/* 12, 13. Festival Collections & Promotional Sale Banner */}
      <PromoBanner />

      {/* Best Sellers Showcase */}
      <FeaturedProducts title="Best Selling Handlooms" defaultTab="bestseller" />

      {/* 14. Why Shop With Us */}
      <WhyShopWithUs />

      {/* 15. Customer Testimonials */}
      <Testimonials />

      {/* 16. Instagram Gallery */}
      <InstagramGallery />

      {/* 17. Newsletter Subscription */}
      <Newsletter />
    </div>
  );
};

export default Home;
