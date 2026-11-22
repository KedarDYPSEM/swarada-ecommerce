import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Maharani Yeola Pure Silk Paithani Saree in Royal Maroon',
    slug: 'maharani-yeola-pure-silk-paithani-saree-royal-maroon',
    sku: 'S7B3',
    mrp: 18500,
    sellingPrice: 14999,
    fabric: 'Pure Mulberry Silk',
    colour: 'Maroon & Gold',
    category: 'paithani-sarees',
    isNewArrival: true,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'paithani-sarees',
    isNewArrival: true,
    isBestSeller: false,
    images: [{ url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'banarasi-silk',
    isNewArrival: false,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'nauvari-sarees',
    isNewArrival: true,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'sarees',
    isNewArrival: true,
    isBestSeller: false,
    images: [{ url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'dresses',
    isNewArrival: false,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
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
    category: 'kurtis',
    isNewArrival: true,
    isBestSeller: false,
    images: [{ url: 'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
  },
  {
    id: 8,
    name: 'Handcrafted Velvet Zardozi Bridal Potli Handbag',
    slug: 'handcrafted-velvet-zardozi-bridal-potli-handbag',
    sku: 'H101',
    mrp: 2800,
    sellingPrice: 1999,
    fabric: 'Micro Velvet',
    colour: 'Maroon',
    category: 'handbags',
    isNewArrival: false,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
  },
  {
    id: 9,
    name: 'Kolhapuri Saaj Inspired 24K Gold Plated Necklace Set',
    slug: 'kolhapuri-saaj-inspired-24k-gold-plated-necklace-set',
    sku: 'A401',
    mrp: 5200,
    sellingPrice: 3850,
    fabric: '24K Gold Polish',
    colour: 'Antique Gold',
    category: 'accessories',
    isNewArrival: true,
    isBestSeller: true,
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', isPrimary: true }],
  },
];

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all');

  let filtered = ALL_PRODUCTS;
  if (categoryParam) {
    filtered = filtered.filter((p) => p.category === categoryParam || categoryParam === 'sarees');
  }

  if (priceFilter === 'under10k') {
    filtered = filtered.filter((p) => p.sellingPrice < 10000);
  } else if (priceFilter === 'above10k') {
    filtered = filtered.filter((p) => p.sellingPrice >= 10000);
  }

  if (selectedSort === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (selectedSort === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.sellingPrice - a.sellingPrice);
  }

  return (
    <div className="py-8 sm:py-12 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Swarada Handloom Collections
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            {categoryParam ? categoryParam.replace('-', ' ').toUpperCase() : 'All Ethnic Fashion & Sarees'}
          </h1>
          <p className="mt-2 text-xs text-[#594E4E]">
            Showing {filtered.length} mastercrafted creations from Kolhapur & Yeola.
          </p>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-white border border-[#C5A05A]/30 p-4 rounded-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#292323] flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-[#C5A05A]" />
              <span>Filter Price:</span>
            </span>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="text-xs border border-neutral-300 rounded px-2.5 py-1.5 bg-[#FFF9F0] text-[#292323] focus:outline-none focus:border-[#641B32]"
            >
              <option value="all">All Prices</option>
              <option value="under10k">Under ₹10,000</option>
              <option value="above10k">₹10,000 & Above</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-[#292323] flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A05A]" />
              <span>Sort By:</span>
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="text-xs border border-neutral-300 rounded px-2.5 py-1.5 bg-[#FFF9F0] text-[#292323] focus:outline-none focus:border-[#641B32]"
            >
              <option value="featured">Featured Treasures</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
