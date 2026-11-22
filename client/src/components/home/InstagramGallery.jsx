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
    <section className="py-16 sm:py-20 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-[#C5A05A] text-xs font-semibold tracking-widest uppercase mb-1">
            <InstagramIcon className="w-4 h-4" />
            <span>#SwaradaBrides</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#641B32]">
            Follow Us On Instagram
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#594E4E] hover:text-[#641B32] font-medium tracking-wide mt-1 inline-block"
          >
            @swaradasareecenter
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTA_POSTS.map((url, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xs bg-neutral-200 block shadow-xs"
            >
              <img
                src={url}
                alt={`Instagram Post ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#641B32]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                <InstagramIcon className="w-6 h-6 text-[#C5A05A]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
