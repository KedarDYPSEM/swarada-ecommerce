import React from 'react';
import { Award, MapPin, Heart } from 'lucide-react';

export const About = () => {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
            <span>✦</span>
            <span>Our Heritage & Roots</span>
            <span>✦</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#140F11]">
            The Swarada Story
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-12 border border-[#D4AF37]/35 rounded-3xl shadow-xl shadow-amber-950/5 space-y-6 text-sm text-[#594E4E] leading-relaxed relative overflow-hidden">
          <p>
            Nestled in the historic city of Kolhapur, Maharashtra, <strong className="text-[#140F11]">Swarada Saree Center</strong> was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.
          </p>

          <p>
            Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-amber-100/70 text-center">
            <div className="p-5 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <Award className="w-7 h-7 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-bold text-lg text-[#140F11]">25+ Years</h4>
              <p className="text-xs text-neutral-500 mt-1">Heritage in Kolhapur</p>
            </div>
            <div className="p-5 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <Heart className="w-7 h-7 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-bold text-lg text-[#140F11]">50,000+</h4>
              <p className="text-xs text-neutral-500 mt-1">Brides & Families Adorned</p>
            </div>
            <div className="p-5 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <MapPin className="w-7 h-7 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-bold text-lg text-[#140F11]">Mahadwar Rd</h4>
              <p className="text-xs text-neutral-500 mt-1">Flagship Store Location</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
