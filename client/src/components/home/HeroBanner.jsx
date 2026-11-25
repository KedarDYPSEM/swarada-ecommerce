import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { getYouTubeVideoId, getYouTubeEmbedUrl } from '../../lib/utils';

// Dedicated autoplay video component that supports direct MP4 files AND YouTube video links
const HeroVideoSlide = ({ src, isActive }) => {
  const videoRef = useRef(null);
  const ytId = getYouTubeVideoId(src);

  useEffect(() => {
    if (ytId) return; // YouTube handles autoplay and looping via iframe embed parameters
    const el = videoRef.current;
    if (!el) return;
    el.defaultMuted = true;
    el.muted = true;
    if (isActive) {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      el.pause();
    }
  }, [isActive, src, ytId]);

  if (ytId) {
    const embedUrl = getYouTubeEmbedUrl(src, {
      isBackground: true,
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
    });
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <iframe
          src={isActive ? embedUrl : 'about:blank'}
          title="Hero Video Background"
          className="w-full h-full object-cover scale-135 pointer-events-none border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover object-center pointer-events-none"
      onError={(e) => {
        if (src && src.startsWith('/uploads/') && !e.target.dataset.triedFallback) {
          e.target.dataset.triedFallback = 'true';
          e.target.src = `http://localhost:5000${src}`;
          e.target.play?.().catch(() => {});
        }
      }}
    />
  );
};

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

export const HeroBanner = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlides = (banners && banners.length > 0)
    ? banners.map((b, i) => ({
        id: b.id || i,
        title: b.title,
        subtitle: b.subtitle || '',
        description: b.description || 'Authentic handloom sarees with signature motifs directly from our master weavers in Kolhapur.',
        image: b.imageUrl || b.image || SLIDES[0].image,
        videoUrl: b.videoUrl || null,
        isVideo: Boolean(b.isVideo || (b.videoUrl && b.videoUrl.trim())),
        showText: b.showText !== undefined ? Boolean(b.showText) : true,
        ctaText: b.buttonText || 'Explore Collection',
        ctaLink: b.linkUrl || '/shop',
        badge: 'Certified Handloom',
      }))
    : SLIDES.map((s) => ({ ...s, isVideo: false, showText: true }));

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const currentIdx = currentSlide >= activeSlides.length ? 0 : currentSlide;

  return (
    <section
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-[#292323]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {activeSlides.map((slide, index) => {
        const isActive = index === currentIdx;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image or Video with Gradient Overlay */}
            <div className="absolute inset-0">
              {slide.isVideo && (slide.videoUrl || slide.image) ? (
                <HeroVideoSlide src={slide.videoUrl || slide.image} isActive={isActive} />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={(e) => {
                    if (slide.image && slide.image.startsWith('/uploads/') && !e.target.dataset.triedFallback) {
                      e.target.dataset.triedFallback = 'true';
                      e.target.src = `http://localhost:5000${slide.image}`;
                    }
                  }}
                  className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
              )}
              {/* Multilayer gradient for legibility when text is visible */}
              {slide.showText ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#140F11]/95 via-[#1E1719]/75 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140F11]/90 via-transparent to-black/40" />
                </>
              ) : (
                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors pointer-events-none" />
              )}
            </div>

            {/* Slide Content (Toggled on/off) */}
            {slide.showText ? (
              <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center">
                <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#641B32]/95 to-[#851C3B]/90 border border-[#D4AF37]/70 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-[#FFFDF9] shadow-md backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#F3E2B8] animate-pulse" />
                    <span>{slide.badge}</span>
                    <span className="text-[#D4AF37]">✦</span>
                  </div>

                  {/* Heading */}
                  <h1 className="font-heading text-3.5xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFFDF9] leading-[1.15] drop-shadow-sm">
                    {slide.title}
                  </h1>

                  {/* Subtitle with gold accent line */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-0.5 bg-[#D4AF37]" />
                    <p className="text-sm sm:text-lg font-medium text-[#F3E2B8] tracking-wide font-body">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-base text-neutral-200/90 max-w-xl leading-relaxed hidden sm:block font-light">
                    {slide.description}
                  </p>

                  {/* Call to Action */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap gap-4 items-center">
                    <Link to={slide.ctaLink}>
                      <button
                        type="button"
                        className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#C5A05A] text-[#1E1719] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-103 cursor-pointer group gold-shimmer-btn"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </Link>

                    <a
                      href="https://wa.me/919822012345?text=Hello%20Swarada%20Saree%20Center,%20I%20would%20like%20to%20book%20a%20video%20shopping%20call."
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-102 cursor-pointer shadow-md"
                    >
                      <span>Book Video Consultation</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* When text overlay is hidden (e.g. Graphic Banner with text baked in), make entire banner clickable */
              <Link to={slide.ctaLink} className="absolute inset-0 z-10" aria-label={slide.title} />
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-[#641B32] text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-[#D4AF37] cursor-pointer shadow-xl hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-[#641B32] text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-[#D4AF37] cursor-pointer shadow-xl hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2.5 bg-black/35 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
              idx === currentIdx ? 'w-8 bg-[#D4AF37] shadow-xs' : 'w-2 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
