import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CircularCategoryScroll from '../components/home/CircularCategoryScroll';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedProducts from '../components/home/FeaturedProducts';
import YouTubeLiveSection from '../components/home/YouTubeLiveSection';
import PromoBanner from '../components/home/PromoBanner';
import WhyShopWithUs from '../components/home/WhyShopWithUs';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';
import PromoPopup from '../components/home/PromoPopup';
import RecentPurchaseToast from '../components/common/RecentPurchaseToast';
import homepageService from '../services/homepageService';

export const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const homeData = await homepageService.getHomepageData();
        if (isMounted && homeData) {
          setData(homeData);
        }
      } catch (err) {
        // Fallback silently to high-fidelity initial display
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-0">
      {/* 1. Multi-Slide Hero Banner */}
      <HeroBanner banners={data?.banners?.hero} />

      {/* 2. Infinite Circular Categories Scroll Row */}
      <CircularCategoryScroll categories={data?.categories} />

      {/* 3. Shop by Category Showcase */}
      <CategoryShowcase categories={data?.categories} />

      {/* 4. New Arrivals & Trending Sarees */}
      <FeaturedProducts
        title="New Arrivals & Trending Sarees"
        defaultTab="new"
        products={data?.newArrivals}
      />

      {/* 5. Live YouTube Showcase & Shopping */}
      <YouTubeLiveSection />

      {/* 6. Festival Collections & Promotional Sale Banner */}
      <PromoBanner banners={data?.banners?.promotional} />

      {/* 7. Best Sellers Showcase */}
      <FeaturedProducts
        title="Best Selling"
        defaultTab="bestseller"
        products={data?.bestSellers}
      />

      {/* 8. Why Shop With Us (10,000+ Orders Delivered Counter) */}
      <WhyShopWithUs />

      {/* 9. Customer Testimonials */}
      <Testimonials />

      {/* 10. Newsletter Subscription */}
      <Newsletter />

      {/* Promotional / Announcement Modal Popup */}
      <PromoPopup banners={data?.banners?.popup} />

      {/* Live Social Proof "Recently Purchased" Notification Toast */}
      <RecentPurchaseToast />
    </div>
  );
};

export default Home;
