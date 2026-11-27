import React from 'react';
import { PackageCheck, Video, Award, Truck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhyShopWithUs = () => {
  const { settings } = useSettings();
  const ordersCount = (settings?.ordersDeliveredCount || 10000).toLocaleString('en-IN');

  const REASONS = [
    {
      icon: PackageCheck,
      title: `${ordersCount}+ Orders Delivered`,
      description: 'Trusted by patrons across India & globally with 100% verified authentic delivery track record.',
    },
    {
      icon: Award,
      title: 'Direct Weaver Heritage',
      description: 'Handpicked directly from master weavers across Yeola, Paithan, Varanasi, and Kanchipuram with zero middleman markups.',
    },
    {
      icon: Truck,
      title: 'Insured Pan-India Express Delivery',
      description: `Free express shipping on orders above ₹${settings?.freeShippingThreshold?.toLocaleString('en-IN') || '2,999'} in tamper-proof premium keepsake packaging.`,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs font-royal tracking-[0.25em] uppercase mb-2">
            <span>✦</span>
            <span>The Swarada Promise</span>
            <span>✦</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#641B32] tracking-tight">
            Why Customers Choose Swarada
          </h2>
          <div className="flex items-center justify-center space-x-3 my-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">❖</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="bg-white/90 backdrop-blur-sm border border-amber-900/10 hover:border-[#D4AF37]/60 p-8 rounded-2xl text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
              >
                {/* Decorative hover gradient glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#641B32] to-[#851C3B] text-[#F3E2B8] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-md group-hover:shadow-xl">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#1E1719] mb-3 group-hover:text-[#641B32] transition-colors">
                  {reason.title}
                </h3>
                <p className="text-xs text-[#5A4E51] leading-relaxed font-light">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyShopWithUs;
