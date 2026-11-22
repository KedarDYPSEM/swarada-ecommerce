import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromoBanner from '../components/home/PromoBanner';
import WhyShopWithUs from '../components/home/WhyShopWithUs';
import Testimonials from '../components/home/Testimonials';
import InstagramGallery from '../components/home/InstagramGallery';
import Newsletter from '../components/home/Newsletter';
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
      {/* 6. Multi-Slide Hero Banner */}
      <HeroBanner banners={data?.banners?.hero} />

      {/* 7. Shop by Category */}
      <CategoryShowcase categories={data?.categories} />

      {/* 8, 10, 11. New Arrivals & Trending Sarees */}
      <FeaturedProducts
        title="New Arrivals & Trending Sarees"
        defaultTab="new"
        products={data?.newArrivals}
      />

      {/* 12, 13. Festival Collections & Promotional Sale Banner */}
      <PromoBanner banners={data?.banners?.promotional} />

      {/* 9. Best Sellers Showcase */}
      <FeaturedProducts
        title="Best Selling Handlooms"
        defaultTab="bestseller"
        products={data?.bestSellers}
      />

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
