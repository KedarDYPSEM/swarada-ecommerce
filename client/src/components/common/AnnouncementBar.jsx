import React, { useState } from 'react';
import { X, Sparkles, Truck, ShieldCheck, Gift, Copy, Check } from 'lucide-react';

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('FIRST10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  const items = [
    { icon: Sparkles, text: 'Authentic Yeola Paithani & Banarasi Handlooms' },
    { icon: Truck, text: 'Free Express Pan-India Delivery on Orders Above ₹2,999' },
    { icon: Gift, text: 'Use Code FIRST10 for Flat 10% Off Your First Saree' },
    { icon: ShieldCheck, text: '100% Silk Mark Certified Purity Guaranteed' },
  ];

  return (
    <div className="bg-gradient-to-r from-[#480C1E] via-[#641B32] to-[#480C1E] text-[#FAF7F2] text-xs py-2 px-3 relative z-50 border-b border-[#D4AF37]/30 shadow-xs overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Decorative Star */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[#D4AF37] text-[11px] font-royal tracking-widest uppercase">
          <span className="text-[#D4AF37] animate-pulse">✦</span>
          <span>Swarada Flagship</span>
        </div>

        {/* Center Marquee / Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center justify-center space-x-3 text-center">
            <span className="inline-flex items-center space-x-1.5 text-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse shrink-0" />
              <span className="hidden sm:inline">Grand Festive Privilege: </span>
              <span>Free Express All-India Shipping on Orders Above ₹2,999</span>
            </span>

            <span className="text-[#D4AF37]/60 hidden md:inline">|</span>

            {/* Interactive Coupon Capsule */}
            <button
              onClick={copyCode}
              title="Click to copy coupon code"
              className="inline-flex items-center space-x-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 border border-[#D4AF37]/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#FFFDF9] transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Code: </span>
              <strong className="text-[#F3E2B8] tracking-wider">FIRST10</strong>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-[#D4AF37]" />
              )}
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-300 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
