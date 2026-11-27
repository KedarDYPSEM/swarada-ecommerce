import React from 'react';
import { InstagramIcon } from '../common/SocialIcons';

const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/swarada_saree_center/';
const INSTAGRAM_HANDLE = '@swarada_saree_center';

const INSTA_POSTS = [
  {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    title: 'Pure Paithani Silk with Peacock Pallu',
  },
  {
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    title: 'Bridal Heritage Crimson Handloom',
  },
  {
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    title: 'Maharashtrian Nauvari Kashta Splendor',
  },
  {
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    title: 'Brocade Banarasi Weaver Collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    title: 'Festive Royal Anarkalis & Sarees',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    title: 'Authentic Kolhapuri Saaj Jewellery',
  },
];

export const InstagramGallery = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs font-royal tracking-[0.25em] uppercase mb-2">
            <InstagramIcon className="w-4 h-4" />
            <span>#SwaradaBrides</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#641B32] tracking-tight">
            Follow Our Weaver Stories
          </h2>
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#5A4E51] hover:text-[#641B32] font-semibold tracking-wider uppercase mt-2 inline-block border-b border-[#D4AF37] pb-0.5 transition-colors"
          >
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {INSTA_POSTS.map((item, idx) => (
            <a
              key={idx}
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 block shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-amber-900/10 hover:border-[#D4AF37]/60"
            >
              <img
                src={item.image}
                alt={item.title || `Instagram Post ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#480C1E]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-3 space-y-1 text-center">
                <InstagramIcon className="w-7 h-7 text-[#F3E2B8] animate-bounce" />
                <span className="text-[10px] tracking-wider uppercase font-royal font-semibold text-[#F3E2B8]">
                  View on Instagram
                </span>
                <span className="text-[9px] text-white/80 line-clamp-1 max-w-[100px]">
                  {item.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
