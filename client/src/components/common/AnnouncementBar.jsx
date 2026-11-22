import React, { useState } from 'react';
import { X, Sparkles, Truck } from 'lucide-react';

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#641B32] text-[#FFF9F0] text-xs font-medium py-2 px-4 relative z-50 border-b border-[#C5A05A]/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="w-6 hidden sm:block" />

        <div className="flex-1 flex items-center justify-center space-x-2 text-center overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A05A] animate-pulse shrink-0" />
          <span className="tracking-wide truncate">
            Free Express All-India Shipping on Orders Above ₹2,999 | Use Code{' '}
            <strong className="text-[#C5A05A] font-semibold underline">FIRST10</strong> for 10% Off
          </span>
          <Truck className="w-3.5 h-3.5 text-[#C5A05A] shrink-0 hidden md:inline" />
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-300 hover:text-white p-1 transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
