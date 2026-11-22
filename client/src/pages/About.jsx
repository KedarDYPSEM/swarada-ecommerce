import React from 'react';
import { Award, MapPin, Heart } from 'lucide-react';

export const About = () => {
  return (
    <div className="py-16 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Our Heritage & Roots
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#641B32]">
            The Swarada Story
          </h1>
          <div className="w-16 h-0.5 bg-[#C5A05A] mx-auto" />
        </div>

        <div className="bg-white p-8 sm:p-12 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-6 text-sm text-[#594E4E] leading-relaxed">
          <p>
            Nestled in the historic city of Kolhapur, Maharashtra, <strong>Swarada Saree Center</strong> was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.
          </p>

          <p>
            Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-100 text-center">
            <div className="p-4 bg-[#FFF9F0] rounded-xs">
              <Award className="w-6 h-6 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-semibold text-base text-[#292323]">25+ Years</h4>
              <p className="text-xs text-neutral-500 mt-1">Heritage in Kolhapur</p>
            </div>
            <div className="p-4 bg-[#FFF9F0] rounded-xs">
              <Heart className="w-6 h-6 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-semibold text-base text-[#292323]">50,000+</h4>
              <p className="text-xs text-neutral-500 mt-1">Brides & Families Adorned</p>
            </div>
            <div className="p-4 bg-[#FFF9F0] rounded-xs">
              <MapPin className="w-6 h-6 text-[#641B32] mx-auto mb-2" />
              <h4 className="font-heading font-semibold text-base text-[#292323]">Mahadwar Rd</h4>
              <p className="text-xs text-neutral-500 mt-1">Flagship Store Location</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
