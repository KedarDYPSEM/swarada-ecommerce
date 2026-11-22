import React from 'react';
import { ShieldCheck, Video, Award, Truck } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Silk Mark Certified Purity',
    description: 'Every Paithani and Banarasi saree is woven with pure natural silk and tested gold zari, complete with authenticity guarantees.',
  },
  {
    icon: Award,
    title: 'Direct Weaver Heritage',
    description: 'Handpicked directly from master weavers across Yeola, Paithan, Varanasi, and Kanchipuram with zero middleman markups.',
  },
  {
    icon: Video,
    title: 'Personalized Video Shopping',
    description: 'Book a 1-on-1 WhatsApp video consultation with our Kolhapur saree specialists to inspect pallu weaves and fabric drape live.',
  },
  {
    icon: Truck,
    title: 'Insured Pan-India Express Delivery',
    description: 'Free express shipping on orders above ₹2,999 in tamper-proof premium bridal keepsake packaging with real-time tracking.',
  },
];

export const WhyShopWithUs = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            The Swarada Standard
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Why Shop with Swarada Saree Center?
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A05A] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {REASONS.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="bg-white border border-[#C5A05A]/30 p-8 rounded-xs text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#7B1E35] transition-colors shadow-xs">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#292323] mb-2 group-hover:text-[#641B32] transition-colors">
                  {reason.title}
                </h3>
                <p className="text-xs text-[#594E4E] leading-relaxed">
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
