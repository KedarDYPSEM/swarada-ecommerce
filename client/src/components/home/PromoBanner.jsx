import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export const PromoBanner = () => {
  return (
    <section className="py-12 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#641B32] via-[#7B1E35] to-[#4e1225] text-white shadow-xl border border-[#C5A05A]/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-[#C5A05A]/20 border border-[#C5A05A] px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase text-[#FFF9F0]">
                <Tag className="w-3.5 h-3.5 text-[#C5A05A]" />
                <span>Limited Period Festive Privilege</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#FFF9F0]">
                Flat 10% Off on Your First Saree Order
              </h2>

              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-xl">
                Experience the magic of authentic hand-woven silks. Use code{' '}
                <span className="font-mono font-bold text-[#C5A05A] bg-black/30 px-2 py-0.5 rounded border border-[#C5A05A]/40">
                  FIRST10
                </span>{' '}
                at checkout. Applicable on all certified Yeola Paithanis, Banarasi silks, and Nauvaris.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/shop">
                  <Button
                    variant="gold"
                    size="lg"
                    className="shadow-lg group text-[#292323] font-semibold"
                  >
                    <span>Claim Your Privilege</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-2 text-xs text-neutral-300">
                  <Clock className="w-4 h-4 text-[#C5A05A]" />
                  <span>Free insured shipping across all 28 Indian states</span>
                </div>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                alt="Festive Paithani Saree Splendour"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#641B32] via-transparent to-transparent opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
