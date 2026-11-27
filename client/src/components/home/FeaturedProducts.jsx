import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Maharani Yeola Pure Silk Paithani Saree in Royal Maroon',
    slug: 'maharani-yeola-pure-silk-paithani-saree-royal-maroon',
    sku: 'S7B3',
    mrp: 18500,
    sellingPrice: 14999,
    fabric: 'Pure Mulberry Silk',
    colour: 'Maroon & Gold',
    isNewArrival: true,
    isBestSeller: true,
    tab: 'new',
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 2,
    name: 'Peshwai Kathpadar Double Pallu Paithani in Emerald Green',
    slug: 'peshwai-kathpadar-double-pallu-paithani-emerald-green',
    sku: 'S8C4',
    mrp: 22000,
    sellingPrice: 17499,
    fabric: 'Pure Katan Silk',
    colour: 'Emerald Green',
    isNewArrival: true,
    isBestSeller: false,
    tab: 'new',
    images: [
      { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 3,
    name: 'Regal Banarasi Katan Silk Brocade Saree in Deep Burgundy',
    slug: 'regal-banarasi-katan-silk-brocade-saree-deep-burgundy',
    sku: 'B101',
    mrp: 16900,
    sellingPrice: 12950,
    fabric: 'Katan Silk',
    colour: 'Burgundy',
    isNewArrival: false,
    isBestSeller: true,
    tab: 'bestseller',
    images: [
      { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 4,
    name: 'Traditional Kolhapuri Nauvari Silk Saree in Mustard Yellow',
    slug: 'traditional-kolhapuri-nauvari-silk-saree-mustard-yellow',
    sku: 'N901',
    mrp: 14500,
    sellingPrice: 11200,
    fabric: 'Semi-Paithani Silk',
    colour: 'Mustard Yellow',
    isNewArrival: true,
    isBestSeller: true,
    tab: 'bestseller',
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 5,
    name: 'Royal Magenta Zari Woven Silk Saree with Temple Border',
    slug: 'royal-magenta-zari-woven-silk-saree-temple-border',
    sku: 'S5A2',
    mrp: 9500,
    sellingPrice: 6999,
    fabric: 'Poly Silk Blend',
    colour: 'Magenta & Gold',
    isNewArrival: true,
    isBestSeller: false,
    tab: 'new',
    images: [
      { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 6,
    name: 'Crimson Red Bridal Anarkali Suit Set with Zardozi Work',
    slug: 'crimson-red-bridal-anarkali-suit-set-zardozi',
    sku: 'D301',
    mrp: 12500,
    sellingPrice: 9450,
    fabric: 'Pure Georgette',
    colour: 'Crimson Red',
    isNewArrival: false,
    isBestSeller: true,
    tab: 'bridal',
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 7,
    name: 'Chanderi Silk Embroidered Straight Kurti with Pants',
    slug: 'chanderi-silk-embroidered-straight-kurti-pants',
    sku: 'K201',
    mrp: 4800,
    sellingPrice: 3499,
    fabric: 'Chanderi Silk',
    colour: 'Pastel Peach',
    isNewArrival: true,
    isBestSeller: false,
    tab: 'new',
    images: [
      { url: 'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
  {
    id: 8,
    name: 'Kolhapuri Saaj Inspired 24K Gold Plated Necklace Set',
    slug: 'kolhapuri-saaj-inspired-24k-gold-plated-necklace-set',
    sku: 'A401',
    mrp: 5200,
    sellingPrice: 3850,
    fabric: '24K Gold Polish',
    colour: 'Antique Gold',
    isNewArrival: true,
    isBestSeller: true,
    tab: 'bridal',
    images: [
      { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', isPrimary: true },
    ],
  },
];

export const FeaturedProducts = ({ title = 'Featured Collections', defaultTab = 'all', products = null }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const displayList = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const filteredProducts =
    activeTab === 'all'
      ? displayList
      : displayList.filter(
          (p) =>
            p.tab === activeTab ||
            (activeTab === 'new' && p.isNewArrival) ||
            (activeTab === 'bestseller' && p.isBestSeller) ||
            (activeTab === 'bridal' && p.sellingPrice >= 10000)
        );

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-amber-900/10 relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-radial from-[#D4AF37]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div>
            <div className="flex items-center space-x-2 text-xs font-royal font-semibold tracking-[0.25em] uppercase text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Royal Maharashtrian Weaves</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-4.5xl font-heading font-bold text-[#641B32] tracking-tight">
              {title}
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent mt-3" />
          </div>

          {/* Tab Filters */}
          <div className="flex items-center space-x-2.5 mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Treasures' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'bestseller', label: 'Best Sellers' },
              { id: 'bridal', label: 'Bridal & Festive' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap cursor-pointer shadow-2xs active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#641B32] to-[#851C3B] text-white shadow-md ring-2 ring-[#D4AF37]/40'
                    : 'bg-[#FAF7F2] text-[#1E1719] hover:bg-white border border-amber-900/10 hover:border-[#D4AF37]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#641B32] via-[#7A1A31] to-[#641B32] text-[#FFFDF9] font-bold text-xs tracking-[0.18em] uppercase shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-103 cursor-pointer group gold-shimmer-btn border border-[#D4AF37]/40"
          >
            <span>Explore Entire Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
