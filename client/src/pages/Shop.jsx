import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { Button } from '../components/ui/Button';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL parameters
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;
  const sortParam = searchParams.get('sort') || 'featured';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  // Component state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState({ fabrics: [], colours: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected filters
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedColours, setSelectedColours] = useState([]);

  // Fetch filter options and live categories from database on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [options, cats] = await Promise.allSettled([
          productService.getFilterOptions(),
          categoryService.getCategories(),
        ]);
        if (options.status === 'fulfilled' && options.value) {
          setFilterOptions(options.value);
        }
        if (cats.status === 'fulfilled' && Array.isArray(cats.value)) {
          setCategories(cats.value);
        }
      } catch (err) {
        // Fallback default options
        setFilterOptions({
          fabrics: ['Pure Mulberry Silk', 'Pure Katan Silk', 'Semi-Paithani Silk Weave', 'Poly Silk Blend', 'Chanderi Silk', 'Pure Georgette'],
          colours: ['Royal Maroon & Antique Gold', 'Emerald Green & Ruby Red', 'Burgundy & Antique Gold', 'Mustard Yellow & Maroon Border', 'Royal Magenta & Gold'],
        });
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever params or filters change
  useEffect(() => {
    let isMounted = true;
    const fetchProductList = async () => {
      setIsLoading(true);
      try {
        const query = {
          page: pageParam,
          limit: 12,
          category: categoryParam || undefined,
          search: searchParam || undefined,
          sort: sortParam !== 'featured' ? sortParam : undefined,
          minPrice: minPriceParam || undefined,
          maxPrice: maxPriceParam || undefined,
          inStock: inStockParam ? 'true' : undefined,
          fabric: selectedFabrics.length ? selectedFabrics : undefined,
          colour: selectedColours.length ? selectedColours : undefined,
        };

        const data = await productService.getProducts(query);
        if (isMounted && data) {
          setProducts(data.products || []);
          setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
        }
      } catch (err) {
        // Graceful error state
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProductList();
    return () => {
      isMounted = false;
    };
  }, [categoryParam, searchParam, pageParam, sortParam, minPriceParam, maxPriceParam, inStockParam, selectedFabrics, selectedColours]);

  // Filter handlers
  const handleSortChange = (newSort) => {
    searchParams.set('sort', newSort);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePriceFilter = (min, max) => {
    if (min) searchParams.set('minPrice', min);
    else searchParams.delete('minPrice');

    if (max) searchParams.set('maxPrice', max);
    else searchParams.delete('maxPrice');

    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFabric = (fabric) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const toggleColour = (col) => {
    setSelectedColours((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const resetAllFilters = () => {
    setSelectedFabrics([]);
    setSelectedColours([]);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(categoryParam) ||
    Boolean(searchParam) ||
    Boolean(minPriceParam) ||
    Boolean(maxPriceParam) ||
    inStockParam ||
    selectedFabrics.length > 0 ||
    selectedColours.length > 0;

  return (
    <div className="py-8 sm:py-14 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-1">
            <span>✦</span>
            <span>Royal Handloom Gallery</span>
            <span>✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#140F11] tracking-tight">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : categoryParam
              ? categoryParam.replace('-', ' ').toUpperCase()
              : 'The Swarada Handloom Vault'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#594E4E] max-w-xl">
            Discover {pagination.total} handcrafted Yeola Paithani, pure Banarasi silk, and heritage sarees woven by India's master artisans.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white/90 backdrop-blur-md border border-[#D4AF37]/30 p-4 rounded-2xl mb-8 flex items-center justify-between shadow-sm gap-4">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 text-xs font-bold text-[#641B32] px-4 py-2 border border-[#D4AF37] rounded-full cursor-pointer hover:bg-amber-50/50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Active Filter Tags */}
          <div className="hidden lg:flex items-center space-x-2 flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center space-x-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold mr-2 cursor-pointer bg-rose-50 px-3 py-1 rounded-full border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
            {searchParam && (
              <span className="bg-amber-50/80 border border-[#D4AF37]/40 text-[#641B32] text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs">
                <span>Search: {searchParam}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-700 transition-colors"
                  onClick={() => {
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }}
                />
              </span>
            )}
            {categoryParam && (
              <span className="bg-amber-50/80 border border-[#D4AF37]/40 text-[#641B32] text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs">
                <span>Category: {categoryParam}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-700 transition-colors"
                  onClick={() => {
                    searchParams.delete('category');
                    setSearchParams(searchParams);
                  }}
                />
              </span>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-xs font-semibold text-neutral-600 hidden sm:inline flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs border border-[#D4AF37]/35 rounded-full px-4 py-2 bg-white text-[#140F11] font-medium focus:outline-none focus:ring-1 focus:ring-[#641B32] shadow-2xs"
            >
              <option value="featured">Featured Treasures</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Best Sellers First</option>
            </select>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white/95 backdrop-blur-md border border-[#D4AF37]/30 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-amber-100/70 pb-3.5">
                <h3 className="font-heading text-base font-bold text-[#641B32] flex items-center space-x-2">
                  <span className="text-[#D4AF37]">❖</span>
                  <span>Filter Collections</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-[#D4AF37] hover:text-[#641B32] font-semibold cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#140F11] mb-3">
                  Categories
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => {
                        searchParams.delete('category');
                        searchParams.set('page', '1');
                        setSearchParams(searchParams);
                      }}
                      className={`text-left w-full py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                        !categoryParam
                          ? 'bg-[#641B32] text-white font-bold shadow-xs'
                          : 'text-[#594E4E] hover:bg-amber-50/60 hover:text-[#641B32]'
                      }`}
                    >
                      <span>All Sarees & Attire</span>
                      {!categoryParam && <span>✦</span>}
                    </button>
                  </li>
                  {(categories.length > 0 ? categories : [
                    { name: 'Paithani Sarees', slug: 'paithani-sarees' },
                    { name: 'Banarasi Silk', slug: 'banarasi-silk' },
                    { name: 'Nauvari Sarees', slug: 'nauvari-sarees' },
                    { name: 'Dresses', slug: 'dresses' },
                    { name: 'Kurtis', slug: 'kurtis' },
                    { name: 'Handbags & Potlis', slug: 'handbags' },
                    { name: 'Accessories', slug: 'accessories' },
                  ]).map((c) => (
                    <li key={c.id || c.slug}>
                      <button
                        onClick={() => {
                          if (c.slug) searchParams.set('category', c.slug);
                          else searchParams.delete('category');
                          searchParams.set('page', '1');
                          setSearchParams(searchParams);
                        }}
                        className={`text-left w-full py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                          categoryParam === c.slug
                            ? 'bg-[#641B32] text-white font-bold shadow-xs'
                            : 'text-[#594E4E] hover:bg-amber-50/60 hover:text-[#641B32]'
                        }`}
                      >
                        <span>{c.name}</span>
                        {categoryParam === c.slug && <span>✦</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="border-t border-amber-100/70 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#140F11] mb-3">
                  Price Range
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-[#423838] hover:text-[#641B32] transition-colors">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={!minPriceParam && !maxPriceParam}
                      onChange={() => handlePriceFilter('', '')}
                      className="accent-[#641B32]"
                    />
                    <span>All Prices</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer text-[#423838] hover:text-[#641B32] transition-colors">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={maxPriceParam === '5000'}
                      onChange={() => handlePriceFilter('', '5000')}
                      className="accent-[#641B32]"
                    />
                    <span>Under ₹5,000</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer text-[#423838] hover:text-[#641B32] transition-colors">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={minPriceParam === '5000' && maxPriceParam === '15000'}
                      onChange={() => handlePriceFilter('5000', '15000')}
                      className="accent-[#641B32]"
                    />
                    <span>₹5,000 – ₹15,000</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer text-[#423838] hover:text-[#641B32] transition-colors">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={minPriceParam === '15000'}
                      onChange={() => handlePriceFilter('15000', '')}
                      className="accent-[#641B32]"
                    />
                    <span>₹15,000 & Above</span>
                  </label>
                </div>
              </div>

              {/* Fabric Filter */}
              {filterOptions.fabrics.length > 0 && (
                <div className="border-t border-amber-100/70 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#140F11] mb-3">
                    Fabric
                  </h4>
                  <div className="space-y-2 text-xs max-h-44 overflow-y-auto pr-1">
                    {filterOptions.fabrics.map((fabric) => (
                      <label key={fabric} className="flex items-center space-x-2.5 cursor-pointer text-[#423838] hover:text-[#641B32] transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fabric)}
                          onChange={() => toggleFabric(fabric)}
                          className="rounded accent-[#641B32]"
                        />
                        <span className="truncate">{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* In Stock Toggle */}
              <div className="border-t border-amber-100/70 pt-4">
                <label className="flex items-center space-x-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => {
                      if (e.target.checked) searchParams.set('inStock', 'true');
                      else searchParams.delete('inStock');
                      setSearchParams(searchParams);
                    }}
                    className="rounded accent-[#641B32]"
                  />
                  <span className="font-bold text-[#140F11]">In Stock Treasures Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 cols desktop) */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#D4AF37]/20 rounded-2xl aspect-3/4 animate-pulse flex flex-col justify-between p-4 shadow-sm"
                  >
                    <div className="bg-amber-50/80 h-2/3 rounded-xl" />
                    <div className="space-y-2 pt-4">
                      <div className="bg-amber-100/60 h-4 rounded-full w-3/4" />
                      <div className="bg-amber-100/40 h-4 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="w-10 h-10 rounded-full border border-[#D4AF37]/35 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 text-[#641B32] transition-colors flex items-center justify-center shadow-xs"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex space-x-2 text-xs font-bold">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                              pagination.page === pageNum
                                ? 'bg-gradient-to-r from-[#641B32] to-[#851C3B] text-white shadow-md ring-2 ring-[#D4AF37]/50'
                                : 'bg-white border border-neutral-200 text-[#140F11] hover:bg-amber-50 hover:border-[#D4AF37]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="w-10 h-10 rounded-full border border-[#D4AF37]/35 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 text-[#641B32] transition-colors flex items-center justify-center shadow-xs"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/95 backdrop-blur-md border border-[#D4AF37]/30 p-12 text-center rounded-3xl shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-[#641B32] flex items-center justify-center mx-auto text-2xl border border-[#D4AF37]/30">
                  ❖
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#641B32]">
                  No Matching Sarees Found
                </h3>
                <p className="text-xs sm:text-sm text-[#594E4E] max-w-sm mx-auto leading-relaxed">
                  We could not find any handlooms matching your selected criteria. Try broadening your price range or clearing fabric selections.
                </p>
                <Button onClick={resetAllFilters} variant="primary" size="sm" className="rounded-full shadow-md">
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FAF7F2] h-full shadow-2xl p-6 z-10 overflow-y-auto space-y-6 border-r border-[#D4AF37]/30">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <h3 className="font-heading text-lg font-bold text-[#641B32]">Filter Sarees</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In mobile, allow closing and applying */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => setMobileFilterOpen(false)}
                variant="primary"
                className="w-full text-xs rounded-full shadow-md"
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
                variant="secondary"
                className="w-full text-xs rounded-full"
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
