import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Video, Sparkles } from 'lucide-react';

const FALLBACK_IMAGES = {
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
  'paithani-sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
  'banarasi-silk': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
  'nauvari-sarees': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=400&auto=format&fit=crop',
  dresses: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
  kurtis: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
  handbags: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=400&auto=format&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop',
  blouse: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
  jewellery: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop',
};

const resolveCategoryImage = (cat) => {
  if (cat?.imageUrl && cat.imageUrl.trim() !== '') {
    // Sanitize any full-url upload paths to relative
    return cat.imageUrl.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1');
  }
  const slug = (cat?.slug || '').toLowerCase();
  for (const [key, url] of Object.entries(FALLBACK_IMAGES)) {
    if (slug.includes(key)) return url;
  }
  return FALLBACK_IMAGES.sarees;
};

export const CircularCategoryScroll = ({ categories = [] }) => {
  const scrollRef = useRef(null);

  // Build dynamic category list:
  // 1. "Today's Live" always first
  const items = [
    {
      id: 'live-stream-special',
      name: "Today's Live",
      href: '#live-showcase',
      isAnchor: true,
      isLive: true,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop',
    },
  ];

  // 2. Add categories loaded dynamically from Admin Panel / Database
  if (Array.isArray(categories) && categories.length > 0) {
    categories
      .filter((c) => c.isActive !== false)
      .forEach((cat) => {
        items.push({
          id: cat.id || cat.slug,
          name: cat.name,
          href: `/shop?category=${cat.slug}`,
          image: resolveCategoryImage(cat),
        });
      });

    // Check if there's already a sale category; if not, add SALE badge
    const hasSale = categories.some((c) => c.slug?.toLowerCase().includes('sale'));
    if (!hasSale) {
      items.splice(3, 0, {
        id: 'special-sale',
        name: 'SALE',
        href: '/shop?sale=true',
        isSale: true,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop',
      });
    }
  } else {
    // Default fallback while loading
    items.push(
      {
        id: 'sarees',
        name: 'Sarees',
        href: '/shop?category=sarees',
        image: FALLBACK_IMAGES.sarees,
      },
      {
        id: 'dresses',
        name: 'Dress Sets',
        href: '/shop?category=dresses',
        image: FALLBACK_IMAGES.dresses,
      },
      {
        id: 'sale',
        name: 'SALE',
        href: '/shop?sale=true',
        isSale: true,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'kurtis',
        name: 'Kurtis',
        href: '/shop?category=kurtis',
        image: FALLBACK_IMAGES.kurtis,
      },
      {
        id: 'handbags',
        name: 'Handbags & Potlis',
        href: '/shop?category=handbags',
        image: FALLBACK_IMAGES.handbags,
      },
      {
        id: 'accessories',
        name: 'Maharashtrian Jewellery',
        href: '/shop?category=accessories',
        image: FALLBACK_IMAGES.accessories,
      }
    );
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.65;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleLiveClick = (e, item) => {
    if (item.isAnchor) {
      e.preventDefault();
      const el = document.getElementById('live-showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/shop?live=true';
      }
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-amber-900/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Left / Right Scroll Buttons (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#D4AF37]/40 shadow-md items-center justify-center text-[#641B32] hover:bg-[#641B32] hover:text-white transition-all hover:scale-105 cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#D4AF37]/40 shadow-md items-center justify-center text-[#641B32] hover:bg-[#641B32] hover:text-white transition-all hover:scale-105 cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Container with Smooth Touch & Mouse Wheel */}
        <div
          ref={scrollRef}
          className="flex items-center space-x-6 sm:space-x-8 md:space-x-10 overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 justify-start sm:justify-center"
        >
          {items.map((cat) => {
            const content = (
              <div className="flex flex-col items-center group cursor-pointer shrink-0">
                {/* Circle Avatar Frame with Gold Accent */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E2B8] to-[#9A7836] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:from-[#641B32] group-hover:to-[#D4AF37]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.sarees;
                      }}
                    />

                    {/* Today's Live Highlight Badge */}
                    {cat.isLive && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 flex items-center justify-center shadow-md animate-pulse">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white mt-1 drop-shadow-md">
                          LIVE
                        </span>
                      </div>
                    )}

                    {/* SALE Highlight Badge */}
                    {cat.isSale && (
                      <div className="absolute inset-0 bg-red-900/35 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                          SALE
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Label */}
                <span className="mt-2 text-xs sm:text-sm font-medium text-[#1E1719] group-hover:text-[#641B32] transition-colors text-center tracking-tight whitespace-nowrap max-w-[110px] truncate">
                  {cat.name}
                </span>
              </div>
            );

            if (cat.isAnchor) {
              return (
                <a
                  key={cat.id}
                  href={cat.href}
                  onClick={(e) => handleLiveClick(e, cat)}
                  className="block shrink-0"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={cat.id} to={cat.href} className="block shrink-0">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CircularCategoryScroll;
