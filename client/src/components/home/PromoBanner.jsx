import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Clock, Sparkles, Copy, Check } from 'lucide-react';

export const PromoBanner = ({ banners }) => {
  const [copied, setCopied] = useState(false);
  const promo = banners && banners.length > 0 ? banners[0] : null;

  const title = promo?.title || 'Flat 10% Off on Your First Heirloom Saree';
  const subtitle = promo?.subtitle || 'Experience the regal magnificence of authentic hand-woven silks. Use voucher code FIRST10 at checkout. Applicable on all certified Yeola Paithanis, royal Banarasi brocades, and traditional Nauvaris.';
  const imageUrl = promo?.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
  const linkUrl = promo?.linkUrl || '/shop';
  const buttonText = promo?.buttonText || 'Claim Your Privilege';

  const copyCoupon = () => {
    navigator.clipboard?.writeText('FIRST10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#480C1E] via-[#641B32] to-[#360814] text-white shadow-2xl border border-[#D4AF37]/50">
          {/* Subtle Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-8 sm:p-14 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/20 border border-[#D4AF37]/80 px-4 py-1.5 rounded-full text-xs font-royal font-semibold tracking-widest uppercase text-[#FFFDF9] backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F3E2B8] animate-pulse" />
                <span>Limited Period Festive Privilege</span>
                <span className="text-[#D4AF37]">✦</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4.5xl lg:text-5xl font-bold leading-[1.18] text-[#FFFDF9] drop-shadow-sm">
                {title}
              </h2>

              <p className="text-sm sm:text-base text-neutral-200/90 leading-relaxed max-w-xl font-light">
                {subtitle}
              </p>

              {/* Interactive Coupon Box */}
              <div className="inline-flex items-center space-x-3 p-2 pl-4 rounded-xl bg-black/40 border border-[#D4AF37]/50 backdrop-blur-md">
                <div className="text-xs">
                  <span className="text-[#D4AF37] block font-royal tracking-widest text-[9px] uppercase">Voucher Code</span>
                  <span className="font-mono font-bold tracking-widest text-[#FFFDF9] text-sm">FIRST10</span>
                </div>
                <button
                  type="button"
                  onClick={copyCoupon}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F3E2B8] text-[#1E1719] font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link to={linkUrl}>
                  <button
                    type="button"
                    className="inline-flex items-center space-x-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#C5A05A] text-[#1E1719] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-103 cursor-pointer group gold-shimmer-btn"
                  >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </Link>
                <div className="flex items-center space-x-2 text-xs text-neutral-300">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Free insured shipping across all 28 Indian states</span>
                </div>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 h-80 sm:h-96 lg:h-full relative overflow-hidden min-h-[380px]">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#480C1E] via-transparent to-transparent opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
