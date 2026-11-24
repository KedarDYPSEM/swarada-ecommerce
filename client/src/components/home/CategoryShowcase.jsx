import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
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

export const CategoryShowcase = () => {
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
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative overflow-hidden rounded-2xl bg-neutral-900 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 border border-amber-900/10 hover:border-[#D4AF37]/60 ${
                cat.featured ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Image with zoom effect */}
              <div className="aspect-4/5 sm:aspect-3/4 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140F11]/95 via-[#1E1719]/40 to-transparent transition-opacity duration-300 group-hover:from-[#641B32]/95" />
              </div>

              {/* Text Card Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-royal tracking-widest text-[#F3E2B8] uppercase block mb-0.5">
                      Heritage Edition
                    </span>
                    <h3 className="font-heading text-base sm:text-lg font-bold tracking-wide text-[#FFFDF9] group-hover:text-[#F3E2B8] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-300 tracking-wide mt-0.5 line-clamp-1 font-light">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#D4AF37] group-hover:text-[#1E1719] transition-all duration-300 shrink-0 group-hover:scale-110 shadow-md">
                    <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                  </div>
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
