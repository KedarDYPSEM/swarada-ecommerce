import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { getYouTubeVideoId, getYouTubeEmbedUrl } from '../../lib/utils';

export const PromoPopup = ({ banners }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Pick first active popup banner
  const banner = Array.isArray(banners) ? banners[0] : banners;

  useEffect(() => {
    if (!banner || !banner.isActive) return;

    // Check if dismissed during current browsing session
    const isDismissed = sessionStorage.getItem(`swarada_popup_dismissed_${banner.id || 'default'}`);
    if (isDismissed) return;

    // Small delay before showing so page loads first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [banner]);

  const handleClose = () => {
    setIsOpen(false);
    if (banner) {
      sessionStorage.setItem(`swarada_popup_dismissed_${banner.id || 'default'}`, 'true');
    }
  };

  if (!isOpen || !banner) return null;

  const ytId = getYouTubeVideoId(banner.videoUrl || (banner.isVideo ? banner.imageUrl : null));
  const isVideo = Boolean(banner.isVideo || ytId || banner.videoUrl);
  const mediaSrc = banner.videoUrl || banner.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg bg-[#1E1719] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-black/60 hover:bg-[#641B32] text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container */}
        <div className="relative h-64 sm:h-72 w-full bg-neutral-900 overflow-hidden">
          {isVideo ? (
            ytId ? (
              <iframe
                src={getYouTubeEmbedUrl(mediaSrc, {
                  isBackground: true,
                  autoPlay: true,
                  loop: true,
                  muted: true,
                  controls: false,
                })}
                title={banner.title}
                className="w-full h-full object-cover pointer-events-none scale-135 border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={(el) => {
                  if (el) {
                    el.defaultMuted = true;
                    el.muted = true;
                    const p = el.play();
                    if (p !== undefined) p.catch(() => {});
                  }
                }}
                src={mediaSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (mediaSrc && mediaSrc.startsWith('/uploads/') && !e.target.dataset.triedFallback) {
                    e.target.dataset.triedFallback = 'true';
                    e.target.src = `http://localhost:5000${mediaSrc}`;
                    e.target.play?.().catch(() => {});
                  }
                }}
              />
            )
          ) : (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              onError={(e) => {
                if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/') && !e.target.dataset.triedFallback) {
                  e.target.dataset.triedFallback = 'true';
                  e.target.src = `http://localhost:5000${banner.imageUrl}`;
                }
              }}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Gradients */}
          {banner.showText !== false ? (
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1719] via-[#1E1719]/40 to-transparent" />
          ) : (
            <Link
              to={banner.linkUrl || '/shop'}
              onClick={handleClose}
              className="absolute inset-0 z-20"
              aria-label={banner.title}
            />
          )}
        </div>

        {/* Text and Actions (if showText !== false) */}
        {banner.showText !== false ? (
          <div className="p-6 sm:p-7 space-y-4 text-center">
            <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#641B32] to-[#851C3B] border border-[#D4AF37]/50 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase text-[#FFFDF9] shadow-md">
              <Sparkles className="w-3 h-3 text-[#F3E2B8] animate-pulse" />
              <span>Special Offer</span>
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#FFFDF9] leading-tight">
              {banner.title}
            </h3>

            {banner.subtitle && (
              <p className="text-xs sm:text-sm text-[#F3E2B8] font-medium font-body max-w-sm mx-auto">
                {banner.subtitle}
              </p>
            )}

            <div className="pt-2">
              <Link
                to={banner.linkUrl || '/shop'}
                onClick={handleClose}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#C5A05A] text-[#1E1719] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl hover:scale-102 transition-all duration-300"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center bg-[#1E1719] border-t border-white/10">
            <Link
              to={banner.linkUrl || '/shop'}
              onClick={handleClose}
              className="text-xs font-semibold text-[#F3E2B8] hover:text-[#D4AF37] tracking-wider uppercase flex items-center justify-center space-x-1"
            >
              <span>Click to view promotion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoPopup;
