import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const SAMPLE_PRODUCTS = [
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

export const FeaturedProducts = ({ title = 'Featured Collections', defaultTab = 'all' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const filteredProducts =
    activeTab === 'all'
      ? SAMPLE_PRODUCTS
      : SAMPLE_PRODUCTS.filter((p) => p.tab === activeTab || (activeTab === 'new' && p.isNewArrival) || (activeTab === 'bestseller' && p.isBestSeller));

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-neutral-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handcrafted Treasures</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
              {title}
            </h2>
          </div>

          {/* Tab Filters */}
          <div className="flex items-center space-x-2 mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Treasures' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'bestseller', label: 'Best Sellers' },
              { id: 'bridal', label: 'Bridal & Festive' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#641B32] text-white shadow-xs'
                    : 'bg-[#FFF9F0] text-[#292323] hover:bg-[#FFF4E0] border border-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-[#641B32] hover:text-[#7B1E35] border-b-2 border-[#C5A05A] pb-1 hover:border-[#641B32] transition-colors"
          >
            <span>View All Handloom Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
