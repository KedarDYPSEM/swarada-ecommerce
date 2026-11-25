import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const STATIC_FALLBACK = [
  {
    name: 'Handloom Sarees',
    subtitle: 'Paithani, Banarasi & Nauvari',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=sarees',
    featured: true,
  },
  {
    name: 'Ethnic Dresses',
    subtitle: 'Anarkalis & Festive Gowns',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=dresses',
  },
  {
    name: 'Designer Kurtis',
    subtitle: 'Chanderi Silk & Thread Work',
    image: 'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=kurtis',
  },
  {
    name: 'Bridal Potlis & Bags',
    subtitle: 'Zardozi & Pearl Embellished',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=handbags',
  },
  {
    name: 'Ethnic Accessories',
    subtitle: 'Kolhapuri Saaj & Jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=accessories',
  },
];

export const CategoryShowcase = ({ categories = [] }) => {
  // Use database categories from admin panel if available, otherwise fallback
  const displayCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.filter((c) => c.isActive !== false).slice(0, 5).map((cat, idx) => ({
          name: cat.name,
          subtitle: cat.description || 'Exclusive Handcrafted Collection',
          image: cat.imageUrl
            ? cat.imageUrl.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1')
            : STATIC_FALLBACK[idx % STATIC_FALLBACK.length].image,
          link: `/shop?category=${cat.slug}`,
          featured: idx === 0,
        }))
      : STATIC_FALLBACK;

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-radial from-[#D4AF37]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs font-royal tracking-[0.25em] uppercase mb-2">
            <span>✦</span>
            <span>Curated Handlooms</span>
            <span>✦</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-4.5xl font-heading font-bold text-[#641B32] tracking-tight">
            Shop by Regal Category
          </h2>
          <div className="flex items-center justify-center space-x-3 my-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">❖</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E51] font-light max-w-lg mx-auto">
            Discover heirloom Paithanis, regal Banarasi brocades, and festive designer apparel handwoven by India's finest master weavers.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayCategories.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-amber-900/10 ${
                cat.featured ? 'col-span-2 lg:col-span-1 sm:row-span-1' : ''
              }`}
            >
              {/* Image Container with Aspect Ratio */}
              <div className="aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-neutral-900 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-[0.88] group-hover:brightness-95"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = STATIC_FALLBACK[0].image;
                  }}
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140F11]/90 via-[#140F11]/25 to-transparent transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[#641B32]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />

                {/* Subtle Gold Corner Accents on Hover */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-[#F3E2B8]" />
                </div>

                {/* Text Content */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <span className="text-[10px] sm:text-[11px] font-royal tracking-[0.18em] text-[#D4AF37] uppercase block mb-1">
                    Collection
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-[#F3E2B8] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300/80 font-light mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
