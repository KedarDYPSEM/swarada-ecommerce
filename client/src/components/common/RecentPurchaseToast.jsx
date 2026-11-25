import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';

const RANDOM_BUYERS = [
  { name: 'Neha Gupta', city: 'Pune' },
  { name: 'Priyanka Patil', city: 'Kolhapur' },
  { name: 'Anjali Deshmukh', city: 'Mumbai' },
  { name: 'Pooja Kulkarni', city: 'Nashik' },
  { name: 'Snehal Shinde', city: 'Satara' },
  { name: 'Kavita Joshi', city: 'Nagpur' },
  { name: 'Swati Jadhav', city: 'Sangli' },
  { name: 'Rutuja Bhosale', city: 'Solapur' },
  { name: 'Meera Shah', city: 'Ahmedabad' },
  { name: 'Radhika Shrikhande', city: 'Thane' },
  { name: 'Aparna Kadam', city: 'Bengaluru' },
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: 'Diamond Party Wear Saree DR420',
    slug: 'diamond-party-wear-saree-dr420',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Pure Yeola Paithani Silk Saree',
    slug: 'pure-yeola-paithani-silk-saree',
    price: 8499,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Royal Banarasi Katan Silk Brocade',
    slug: 'royal-banarasi-katan-silk-brocade',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Traditional Nauvari Kashta Bridal Saree',
    slug: 'traditional-nauvari-kashta-bridal-saree',
    price: 4499,
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=300&auto=format&fit=crop',
  },
];

export const RecentPurchaseToast = () => {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [dismissed, setDismissed] = useState(false);

  // Fetch real products from store catalog
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products?limit=20');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.products && json.data.products.length > 0) {
            const list = json.data.products.map((p) => {
              const primaryImg = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || p.thumbnailUrl;
              return {
                id: p.id,
                title: p.title,
                slug: p.slug,
                price: parseFloat(p.price) || 2499,
                imageUrl: primaryImg || FALLBACK_PRODUCTS[0].imageUrl,
              };
            });
            if (isMounted) setProducts(list);
          }
        }
      } catch (e) {
        // use fallback gracefully
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Interval timer to trigger notification every 14 seconds
  useEffect(() => {
    if (dismissed) return;

    const showRandomPurchase = () => {
      if (!products.length) return;
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomBuyer = RANDOM_BUYERS[Math.floor(Math.random() * RANDOM_BUYERS.length)];
      const randomOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      setCurrentEvent({
        product: randomProduct,
        buyer: randomBuyer,
        orderId: randomOrderId,
      });
      setVisible(true);

      // Hide after 5.5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5500);
    };

    // First display after 3.5 seconds
    const initialTimer = setTimeout(showRandomPurchase, 3500);

    // Then cycle every 14 seconds
    const interval = setInterval(showRandomPurchase, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products, dismissed]);

  if (!visible || !currentEvent || dismissed) return null;

  return (
    <div
      className="fixed bottom-5 left-5 z-50 transition-all duration-500 ease-out transform translate-y-0 opacity-100"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3.5 sm:p-4 max-w-[340px] sm:max-w-[370px] relative overflow-hidden backdrop-blur-md">
        {/* Top Header Strip with Crimson Badge & Close */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
          <div className="inline-flex items-center space-x-1.5 bg-[#E11D48] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>RECENTLY PURCHASED</span>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              setDismissed(true);
            }}
            className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Content */}
        <Link
          to={`/product/${currentEvent.product.slug}`}
          className="flex items-center space-x-3.5 group cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <img
              src={currentEvent.product.imageUrl}
              alt={currentEvent.product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK_PRODUCTS[0].imageUrl;
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-1">
            <h5 className="font-heading text-xs font-bold text-[#1E1719] truncate group-hover:text-[#641B32] transition-colors">
              {currentEvent.product.title}
            </h5>

            <div className="flex items-center space-x-1 text-[11px] text-neutral-500 mt-0.5">
              <span>by {currentEvent.buyer.name}</span>
              <span className="inline-flex items-center text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3 ml-0.5 inline shrink-0" />
                <span className="text-[10px] ml-0.5">Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-[#E11D48]">
                ₹{Number(currentEvent.product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                {currentEvent.orderId}
              </span>
            </div>
          </div>
        </Link>

        {/* Subtle Bottom Accent Indicator */}
        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-[#E11D48] via-[#D4AF37] to-[#641B32]" />
      </div>
    </div>
  );
};

export default RecentPurchaseToast;
