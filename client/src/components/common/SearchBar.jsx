import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

// Static preview catalog for instant client-side search autocomplete
const SEARCH_INDEX = [
  {
    name: 'Maharani Yeola Pure Silk Paithani Saree in Royal Maroon',
    sku: 'S7B3',
    slug: 'maharani-yeola-pure-silk-paithani-saree-royal-maroon',
    category: 'Paithani Sarees',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Peshwai Kathpadar Double Pallu Paithani in Emerald Green',
    sku: 'S8C4',
    slug: 'peshwai-kathpadar-double-pallu-paithani-emerald-green',
    category: 'Paithani Sarees',
    price: 17499,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Regal Banarasi Katan Silk Brocade Saree in Deep Burgundy',
    sku: 'B101',
    slug: 'regal-banarasi-katan-silk-brocade-saree-deep-burgundy',
    category: 'Banarasi Silk',
    price: 12950,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Traditional Kolhapuri Nauvari Silk Saree in Mustard Yellow',
    sku: 'N901',
    slug: 'traditional-kolhapuri-nauvari-silk-saree-mustard-yellow',
    category: 'Nauvari Sarees',
    price: 11200,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Royal Magenta Zari Woven Silk Saree with Temple Border',
    sku: 'S5A2',
    slug: 'royal-magenta-zari-woven-silk-saree-temple-border',
    category: 'Silk Sarees',
    price: 6999,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=200&q=80',
  },
];

export const SearchBar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const matched = SEARCH_INDEX.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.sku.toLowerCase().includes(trimmed) ||
        item.category.toLowerCase().includes(trimmed)
    );

    setResults(matched);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleSelect = (slug) => {
    navigate(`/product/${slug}`);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Saree Name, Fabric or SKU (e.g. S7B3)..."
          className="w-full bg-[#FFF9F0]/80 border border-[#C5A05A]/40 rounded-full py-2.5 pl-11 pr-10 text-sm text-[#292323] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-[#641B32] focus:ring-1 focus:ring-[#641B32] transition-all"
        />
        <Search className="w-4 h-4 text-[#C5A05A] absolute left-4 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3.5 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Instant Suggestions Dropdown */}
      {query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#C5A05A]/30 rounded-sm shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-[#FFF9F0] border-b border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#641B32]">
                  Products Found ({results.length})
                </span>
                <span className="text-[10px] text-neutral-400">Press enter to view all</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {results.map((item) => (
                  <div
                    key={item.sku}
                    onClick={() => handleSelect(item.slug)}
                    className="p-3 hover:bg-[#FFF9F0]/60 flex items-center space-x-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-xs border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#292323] truncate hover:text-[#641B32]">
                        {item.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] bg-[#641B32]/10 text-[#641B32] px-1.5 py-0.5 rounded font-mono font-semibold">
                          SKU: {item.sku}
                        </span>
                        <span className="text-xs font-semibold text-[#641B32]">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-xs text-neutral-500">
                No matching sarees found for "{query}". Try searching for "Paithani", "Nauvari", or SKU "S7B3".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
