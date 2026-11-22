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
    <section className="py-16 sm:py-24 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Curated Collections
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A05A] mx-auto mt-4" />
          <p className="mt-3 text-xs sm:text-sm text-[#594E4E]">
            Explore handcrafted ethnic wear tailored with timeless Maharashtrian heritage and contemporary silhouettes.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`group relative overflow-hidden rounded-xs bg-neutral-900 shadow-sm transition-all duration-300 hover:shadow-xl ${
                cat.featured ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Image */}
              <div className="aspect-4/5 sm:aspect-3/4 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#292323]/90 via-[#292323]/30 to-transparent transition-opacity duration-300 group-hover:from-[#641B32]/95" />
              </div>

              {/* Text Card Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-semibold tracking-wide text-[#FFF9F0] group-hover:text-[#C5A05A] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-300 tracking-wide mt-0.5 truncate">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#C5A05A] transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
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
