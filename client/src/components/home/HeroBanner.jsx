import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const SLIDES = [
  {
    id: 1,
    title: 'Heritage Yeola Paithani',
    subtitle: 'Woven with Pure Mulberry Silk & Tested Gold Zari',
    description: 'Experience the regal aura of Maharashtra’s queen of sarees. Authentic handloom with signature Asawali and peacock motifs directly from our master weavers.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Explore Paithani Collection',
    ctaLink: '/shop?category=paithani-sarees',
    badge: 'Certified Handloom',
  },
  {
    id: 2,
    title: 'Banarasi Katan Silk Brocade',
    subtitle: 'Royal Wedding & Festive Heirloom Sarees',
    description: 'Intricate Kadwa floral jaals, pure gold zari and timeless elegance crafted for auspicious weddings and festive rituals.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Shop Banarasi Silk',
    ctaLink: '/shop?category=banarasi-silk',
    badge: 'Bridal Edition 2026',
  },
  {
    id: 3,
    title: 'Kolhapuri Nauvari Splendour',
    subtitle: 'Authentic 9-Yard Kashta Sarees for Sacred Celebrations',
    description: 'Rooted in Maharashtrian tradition, discover pure silk Nauvari sarees with rich Khan borders tailored for bridal grandeur.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Discover Nauvari Sarees',
    ctaLink: '/shop?category=nauvari-sarees',
    badge: 'Authentic Kolhapuri Craft',
  },
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-[#292323]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000 ease-out"
              />
              {/* Multilayer gradient for optimal legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#292323]/95 via-[#292323]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#292323]/80 via-transparent to-black/30" />
            </div>

            {/* Slide Content */}
            <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center">
              <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-[#641B32]/90 border border-[#C5A05A] px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase text-[#FFF9F0]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A05A]" />
                  <span>{slide.badge}</span>
                </div>

                {/* Heading */}
                <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFF9F0] leading-tight">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-lg font-medium text-[#C5A05A] tracking-wide">
                  {slide.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs sm:text-base text-neutral-300 max-w-xl leading-relaxed hidden sm:block">
                  {slide.description}
                </p>

                {/* Call to Action */}
                <div className="pt-2 sm:pt-4 flex flex-wrap gap-4">
                  <Link to={slide.ctaLink}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-[#641B32] hover:bg-[#7B1E35] border border-[#C5A05A]/40 text-[#FFF9F0] shadow-xl group"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20"
                    >
                      Book Video Consultation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#641B32] text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 border border-white/20 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#641B32] text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 border border-white/20 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide ? 'w-8 bg-[#C5A05A]' : 'w-2 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
