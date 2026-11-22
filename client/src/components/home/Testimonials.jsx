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
    <section className="py-16 sm:py-24 bg-white border-b border-neutral-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Words of Love
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Customer Testimonials
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A05A] mx-auto mt-4" />
          <p className="mt-3 text-xs sm:text-sm text-[#594E4E]">
            Over 25,000 brides and saree connoisseurs have celebrated life’s milestone moments with Swarada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="bg-[#FFF9F0]/60 border border-[#C5A05A]/30 p-8 rounded-xs relative flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-[#C5A05A]/30 absolute top-6 right-6" />

              <div>
                {/* 5-star rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#292323] italic leading-relaxed mb-6">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <h4 className="font-heading text-sm font-semibold text-[#641B32]">
                  {review.name}
                </h4>
                <p className="text-[11px] text-[#C5A05A] font-medium">{review.location}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                  Verified Purchase: {review.productPurchased}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
