import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import productService from '../../services/productService';

export const SearchBar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const products = await productService.searchProducts(trimmed, 8);
        setResults(products || []);
      } catch (err) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleSelect = (slug) => {
    navigate(`/product/${slug}`);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sarees, pure Paithani, Banarasi or SKU..."
          className="w-full bg-[#FAF7F2]/90 border border-[#D4AF37]/35 rounded-full py-2.5 pl-11 pr-10 text-xs sm:text-sm text-[#1E1719] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-[#641B32] focus:ring-2 focus:ring-[#641B32]/15 shadow-2xs transition-all duration-300"
        />
        <Search className="w-4 h-4 text-[#D4AF37] group-focus-within:text-[#641B32] absolute left-4 pointer-events-none transition-colors" />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[#641B32] animate-spin absolute right-3.5" />
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </form>

      {/* Autocomplete / Instant Suggestions Dropdown */}
      {query.trim().length > 0 && !isLoading && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-[#FFF9F0] border-b border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#641B32]">
                  Products Found ({results.length})
                </span>
                <span className="text-[10px] text-neutral-400">Press enter for all results</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {results.map((item) => {
                  const thumbnail =
                    item.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
                  return (
                    <div
                      key={item.sku}
                      onClick={() => handleSelect(item.slug)}
                      className="p-3 hover:bg-[#FFF9F0]/60 flex items-center space-x-3 cursor-pointer transition-colors"
                    >
                      <img
                        src={thumbnail}
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
                            {formatPrice(item.sellingPrice)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </div>
                  );
                })}
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
