import React from 'react';
import { InstagramIcon } from '../common/SocialIcons';

const INSTA_POSTS = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
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
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#5A4E51] hover:text-[#641B32] font-semibold tracking-wider uppercase mt-2 inline-block border-b border-[#D4AF37] pb-0.5"
          >
            @swaradasareecenter
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {INSTA_POSTS.map((url, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 block shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-amber-900/10 hover:border-[#D4AF37]/60"
            >
              <img
                src={url}
                alt={`Instagram Post ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#480C1E]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-3 space-y-1">
                <InstagramIcon className="w-7 h-7 text-[#F3E2B8] animate-bounce" />
                <span className="text-[10px] tracking-wider uppercase font-royal font-semibold text-[#F3E2B8]">View Reel</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
