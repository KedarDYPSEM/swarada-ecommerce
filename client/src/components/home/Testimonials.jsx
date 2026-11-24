import React from 'react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Pooja Kulkarni',
    location: 'Pune, Maharashtra',
    productPurchased: 'Yeola Pure Silk Paithani (Maroon)',
    rating: 5,
    comment:
      'I ordered the royal maroon Paithani for my wedding reception. The peacock pallu weave and zari finish are breathtaking! The fabric feels so soft and rich. Delivered in 2 days to Pune with exquisite packaging.',
  },
  {
    name: 'Snehal Patil',
    location: 'Kolhapur, Maharashtra',
    productPurchased: 'Mustard Nauvari Kashta Saree',
    rating: 5,
    comment:
      'We have been loyal customers of Swarada Saree Center in Mahadwar Road for years. So delighted they now have this modern website! The 9-yard Nauvari was perfect for my cousin’s traditional wedding.',
  },
  {
    name: 'Aishwarya Deshmukh',
    location: 'Mumbai, Maharashtra',
    productPurchased: 'Banarasi Katan Silk Brocade',
    rating: 5,
    comment:
      'Booked a video call before placing the order. The staff was so patient and showed every angle of the saree. Received exactly what I saw on video. 100% authentic and trustworthy.',
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-amber-900/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs font-royal tracking-[0.25em] uppercase mb-2">
            <span>✦</span>
            <span>Voices of Trust</span>
            <span>✦</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#641B32] tracking-tight">
            Loved by 25,000+ Brides & Connoisseurs
          </h2>
          <div className="flex items-center justify-center space-x-3 my-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">❖</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="bg-[#FAF7F2]/90 border border-amber-900/10 hover:border-[#D4AF37]/60 p-8 rounded-2xl relative flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 group"
            >
              <Quote className="w-10 h-10 text-[#D4AF37]/20 absolute top-6 right-6 group-hover:text-[#D4AF37]/40 transition-colors" />

              <div>
                {/* 5-star rating */}
                <div className="flex items-center space-x-1 mb-5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#1E1719] italic leading-relaxed mb-6 font-light">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-amber-900/10">
                <h4 className="font-heading text-sm font-bold text-[#641B32]">
                  {review.name}
                </h4>
                <p className="text-[11px] text-[#D4AF37] font-semibold tracking-wide">{review.location}</p>
                <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-medium">
                  <span>✓ Verified Purchase:</span>
                  <span className="truncate max-w-[140px]">{review.productPurchased}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
