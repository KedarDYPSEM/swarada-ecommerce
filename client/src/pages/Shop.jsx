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
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState({ fabrics: [], colours: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected filters
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedColours, setSelectedColours] = useState([]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const options = await productService.getFilterOptions();
        if (options) setFilterOptions(options);
      } catch (err) {
        // Fallback default options
        setFilterOptions({
          fabrics: ['Pure Mulberry Silk', 'Pure Katan Silk', 'Semi-Paithani Silk Weave', 'Poly Silk Blend', 'Chanderi Silk', 'Pure Georgette'],
          colours: ['Royal Maroon & Antique Gold', 'Emerald Green & Ruby Red', 'Burgundy & Antique Gold', 'Mustard Yellow & Maroon Border', 'Royal Magenta & Gold'],
        });
      }
    };
    fetchFilters();
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
    <div className="py-8 sm:py-12 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Swarada Handloom Catalog
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : categoryParam
              ? categoryParam.replace('-', ' ').toUpperCase()
              : 'All Ethnic Fashion & Sarees'}
          </h1>
          <p className="mt-2 text-xs text-[#594E4E]">
            {pagination.total} handcrafted creations found
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white border border-[#C5A05A]/30 p-4 rounded-xs mb-8 flex items-center justify-between shadow-2xs">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 text-xs font-semibold text-[#641B32] px-3 py-2 border border-[#C5A05A] rounded cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Active Filter Tags */}
          <div className="hidden lg:flex items-center space-x-2 flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 font-semibold mr-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
            {searchParam && (
              <span className="bg-[#FFF9F0] border border-[#C5A05A]/40 text-[#641B32] text-xs px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>Search: {searchParam}</span>
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }}
                />
              </span>
            )}
            {categoryParam && (
              <span className="bg-[#FFF9F0] border border-[#C5A05A]/40 text-[#641B32] text-xs px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>Category: {categoryParam}</span>
                <X
                  className="w-3 h-3 cursor-pointer"
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
            <span className="text-xs font-semibold text-neutral-600 hidden sm:inline flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A05A]" />
              <span>Sort:</span>
            </span>
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs border border-neutral-300 rounded px-3 py-2 bg-[#FFF9F0] text-[#292323] focus:outline-none focus:border-[#641B32]"
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
            <div className="bg-white border border-[#C5A05A]/30 p-6 rounded-xs shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-heading text-base font-bold text-[#641B32]">
                  Filter Collections
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-[#C5A05A] hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292323] mb-3">
                  Categories
                </h4>
                <ul className="space-y-2 text-xs">
                  {[
                    { label: 'All Categories', slug: '' },
                    { label: 'Paithani Sarees', slug: 'paithani-sarees' },
                    { label: 'Banarasi Silk', slug: 'banarasi-silk' },
                    { label: 'Nauvari Sarees', slug: 'nauvari-sarees' },
                    { label: 'Dresses', slug: 'dresses' },
                    { label: 'Kurtis', slug: 'kurtis' },
                    { label: 'Handbags & Potlis', slug: 'handbags' },
                    { label: 'Accessories', slug: 'accessories' },
                  ].map((c) => (
                    <li key={c.label}>
                      <button
                        onClick={() => {
                          if (c.slug) searchParams.set('category', c.slug);
                          else searchParams.delete('category');
                          searchParams.set('page', '1');
                          setSearchParams(searchParams);
                        }}
                        className={`text-left w-full transition-colors cursor-pointer ${
                          categoryParam === c.slug
                            ? 'text-[#641B32] font-bold'
                            : 'text-[#594E4E] hover:text-[#641B32]'
                        }`}
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="border-t border-neutral-100 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292323] mb-3">
                  Price Range
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={!minPriceParam && !maxPriceParam}
                      onChange={() => handlePriceFilter('', '')}
                      className="text-[#641B32]"
                    />
                    <span>All Prices</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={maxPriceParam === '5000'}
                      onChange={() => handlePriceFilter('', '5000')}
                      className="text-[#641B32]"
                    />
                    <span>Under ₹5,000</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={minPriceParam === '5000' && maxPriceParam === '15000'}
                      onChange={() => handlePriceFilter('5000', '15000')}
                      className="text-[#641B32]"
                    />
                    <span>₹5,000 – ₹15,000</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceFilter"
                      checked={minPriceParam === '15000'}
                      onChange={() => handlePriceFilter('15000', '')}
                      className="text-[#641B32]"
                    />
                    <span>₹15,000 & Above</span>
                  </label>
                </div>
              </div>

              {/* Fabric Filter */}
              {filterOptions.fabrics.length > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292323] mb-3">
                    Fabric
                  </h4>
                  <div className="space-y-2 text-xs max-h-40 overflow-y-auto">
                    {filterOptions.fabrics.map((fabric) => (
                      <label key={fabric} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fabric)}
                          onChange={() => toggleFabric(fabric)}
                          className="rounded text-[#641B32]"
                        />
                        <span className="truncate">{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* In Stock Toggle */}
              <div className="border-t border-neutral-100 pt-4">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => {
                      if (e.target.checked) searchParams.set('inStock', 'true');
                      else searchParams.delete('inStock');
                      setSearchParams(searchParams);
                    }}
                    className="rounded text-[#641B32]"
                  />
                  <span className="font-semibold text-[#292323]">In Stock Only</span>
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
                    className="bg-white border border-neutral-200 rounded-xs aspect-3/4 animate-pulse flex flex-col justify-between p-4"
                  >
                    <div className="bg-neutral-200 h-2/3 rounded-xs" />
                    <div className="space-y-2 pt-4">
                      <div className="bg-neutral-200 h-4 rounded w-3/4" />
                      <div className="bg-neutral-200 h-4 rounded w-1/2" />
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
                  <div className="mt-12 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="p-2.5 rounded border border-neutral-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF9F0] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex space-x-1.5 text-xs font-semibold">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded transition-all cursor-pointer ${
                              pagination.page === pageNum
                                ? 'bg-[#641B32] text-white shadow-xs'
                                : 'bg-white border border-neutral-200 text-[#292323] hover:bg-[#FFF9F0]'
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
                      className="p-2.5 rounded border border-neutral-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFF9F0] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-[#C5A05A]/30 p-12 text-center rounded-xs space-y-4">
                <h3 className="font-heading text-xl font-bold text-[#641B32]">
                  No Matching Sarees Found
                </h3>
                <p className="text-xs text-[#594E4E] max-w-sm mx-auto">
                  We could not find any handlooms matching your selected filters. Try broadening your price range or clearing fabric selections.
                </p>
                <Button onClick={resetAllFilters} variant="primary" size="sm">
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
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 z-10 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading text-lg font-bold text-[#641B32]">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In mobile, allow closing and applying */}
            <div className="space-y-4">
              <Button
                onClick={() => setMobileFilterOpen(false)}
                variant="primary"
                className="w-full text-xs"
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
                variant="secondary"
                className="w-full text-xs"
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
