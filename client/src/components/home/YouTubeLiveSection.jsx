import React, { useState, useEffect } from 'react';
import { Video, ExternalLink, MessageCircle, Sparkles, Radio } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const YouTubeLiveSection = () => {
  const { settings } = useSettings();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const channelUrl = settings?.youtubeChannelUrl || 'https://www.youtube.com/@swaradasareecentre776/';
  const channelId = settings?.youtubeChannelId || 'UCOTYLwpl0sy46Tjkvm9OrYQ';
  const customLiveUrl = settings?.youtubeLivestreamUrl;

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/settings/youtube-live?channelId=${channelId}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data) {
            setLiveData(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch YouTube live metadata:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLive();
    return () => {
      isMounted = false;
    };
  }, [channelId]);

  // Determine which embed URL to show:
  // 1. Custom livestream or video URL set in admin settings
  // 2. Official channel livestream embed
  // 3. Channel's latest uploaded video / broadcast
  let embedUrl = `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=0`;
  if (customLiveUrl) {
    const match = customLiveUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
  } else if (liveData?.latestVideoId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${liveData.latestVideoId}?autoplay=0&rel=0`;
  }

  const whatsappMessage = encodeURIComponent(
    'Namaste Swarada Saree Center! I am watching your YouTube live showcase and would like to know availability & prices of today’s featured sarees.'
  );

  return (
    <section id="live-showcase" className="py-20 sm:py-24 bg-[#140F11] text-[#FAF7F2] relative overflow-hidden border-y border-[#D4AF37]/30">
      {/* Background ambient gold & maroon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#851C3B]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-400 border border-red-500/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>LIVE STREAM SHOPPING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#FFFDF9] tracking-tight">
            Swarada Flagship Live Showcase
          </h2>

          <div className="flex items-center justify-center space-x-3 my-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">❖</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        {/* Video Player & Live Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main 16:9 Video Embed Card */}
          <div className="lg:col-span-8">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl bg-black aspect-video group">
              <iframe
                src={embedUrl}
                title="Swarada Saree Center YouTube Live Broadcast"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Floating Top Pill */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="inline-flex items-center space-x-1.5 bg-red-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>@swaradasareecentre776</span>
                </span>
              </div>
            </div>
          </div>

          {/* Live Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white leading-snug">
                  {liveData?.latestTitle || 'Daily Pure Silk Saree Exhibition'}
                </h3>
                <p className="text-xs text-neutral-400 mt-2 font-light leading-relaxed">
                  Liked a saree on the live video? Note the design or take a screenshot and message us instantly on WhatsApp to reserve your exclusive piece.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/919822012345?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-900/40 text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Instant WhatsApp Booking</span>
                </a>

                <a
                  href={`${channelUrl}/live`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2.5 bg-[#641B32] hover:bg-[#851C3B] border border-[#D4AF37]/50 text-[#F3E2B8] font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md text-xs sm:text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Watch on YouTube App</span>
                </a>
              </div>

              {/* Live Shopping Benefits */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Exclusive live-only festive discount pricing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeLiveSection;
