import React from 'react';
import { Award, MapPin, Heart, Sparkles, Phone, MessageCircle, Store, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const About = () => {
  const { settings } = useSettings();

  const title = settings?.storyTitle || 'The Swarada Story';
  const subtitle = settings?.storySubtitle || 'Our Heritage & Roots';
  const intro =
    settings?.storyIntro ||
    'Nestled in the historic city of Kolhapur, Maharashtra, Swarada Saree Center was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.';
  const body =
    settings?.storyBody ||
    'Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.';
  const extended =
    settings?.storyExtended ||
    'Every drape in our collection carries the signature precision of authentic weavers. From bridal Paithanis featuring delicate peacocks to pure Banarasi zari weaves, we take immense pride in adorning brides and handloom connoisseurs for their most cherished milestones.';

  const bannerImage = settings?.storyBannerImage;
  const artisanImage = settings?.storyArtisanImage;

  const stat1Number = settings?.storyStat1Number || '25+ Years';
  const stat1Label = settings?.storyStat1Label || 'Heritage in Kolhapur';
  const stat2Number = settings?.storyStat2Number || '50,000+';
  const stat2Label = settings?.storyStat2Label || 'Brides & Families Adorned';
  const stat3Number = settings?.storyStat3Number || 'Mahadwar Rd';
  const stat3Label = settings?.storyStat3Label || 'Flagship Store Location';
  const stat4Number = settings?.storyStat4Number || '100%';
  const stat4Label = settings?.storyStat4Label || 'Authentic Handlooms';

  const storePhone = settings?.phone || settings?.whatsapp || '+91 93255 85754';
  const storeAddress = settings?.address || 'Shop 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur - 416002';

  return (
    <div className="py-12 sm:py-20 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
            <span>✦</span>
            <span>{subtitle}</span>
            <span>✦</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#641B32] tracking-tight">
            {title}
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
        </div>

        {/* Dynamic Storefront / Boutique Hero Banner (if uploaded in Admin) */}
        {bannerImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 max-h-[420px] group">
            <img
              src={bannerImage}
              alt="Swarada Saree Center Flagship Store"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F3E2B8] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Flagship Boutique • Kolhapur</span>
                </span>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  {settings?.storeName || 'Swarada Saree Center'}
                </h3>
                <p className="text-xs text-neutral-200 max-w-xl">{storeAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Story Narrative Card */}
        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-12 border border-[#D4AF37]/35 rounded-3xl shadow-xl shadow-amber-950/5 space-y-8 text-sm text-[#594E4E] leading-relaxed relative overflow-hidden">
          {/* Top paragraphs */}
          <div className="space-y-5 text-sm sm:text-base leading-relaxed">
            <p className="text-base sm:text-lg font-serif italic text-[#641B32] leading-relaxed">
              "{intro}"
            </p>

            <p>{body}</p>
          </div>

          {/* Side-by-side artisan photo and extended narrative (if artisan image exists) */}
          {artisanImage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-amber-100/70">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/40 max-h-[300px]">
                <img
                  src={artisanImage}
                  alt="Authentic Handloom Weaving"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-4 text-xs sm:text-sm">
                <h4 className="font-heading font-bold text-lg text-[#641B32]">
                  Authentic Handlooms & Master Weavers
                </h4>
                <p>{extended}</p>
                <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-xs pt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Weaver Collaboration • Genuine Zari Brocades</span>
                </div>
              </div>
            </div>
          ) : (
            extended && (
              <div className="pt-4 border-t border-amber-100/70 text-xs sm:text-sm">
                <p>{extended}</p>
              </div>
            )
          )}

          {/* 4 Highlight Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-amber-100/70 text-center">
            <div className="p-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <Award className="w-6 h-6 text-[#641B32] mx-auto mb-1.5" />
              <h4 className="font-heading font-bold text-base sm:text-lg text-[#140F11]">
                {stat1Number}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stat1Label}</p>
            </div>

            <div className="p-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <Heart className="w-6 h-6 text-[#641B32] mx-auto mb-1.5" />
              <h4 className="font-heading font-bold text-base sm:text-lg text-[#140F11]">
                {stat2Number}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stat2Label}</p>
            </div>

            <div className="p-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <MapPin className="w-6 h-6 text-[#641B32] mx-auto mb-1.5" />
              <h4 className="font-heading font-bold text-base sm:text-lg text-[#140F11]">
                {stat3Number}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stat3Label}</p>
            </div>

            <div className="p-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-2xs hover:-translate-y-0.5 transition-all">
              <Sparkles className="w-6 h-6 text-[#641B32] mx-auto mb-1.5" />
              <h4 className="font-heading font-bold text-base sm:text-lg text-[#140F11]">
                {stat4Number}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stat4Label}</p>
            </div>
          </div>
        </div>

        {/* Visit Flagship Store Card */}
        <div className="bg-gradient-to-r from-[#641B32] to-[#801D39] text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs uppercase font-semibold text-[#F3E2B8] tracking-widest">
              Visit Kolhapur Flagship Store
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Experience the Majesty of Pure Silk in Person
            </h3>
            <p className="text-xs text-[#EAD8D8] max-w-lg">{storeAddress}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`https://wa.me/${storePhone.replace(/\D/g, '')}?text=Hello%20Swarada%20Saree%20Center,%20I%20would%20like%20to%20plan%20a%20visit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>

            <a
              href={`tel:${storePhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{storePhone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
