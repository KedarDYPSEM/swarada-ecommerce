import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  PackageCheck,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from './SocialIcons';
import { useSettings } from '../../context/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();

  const ordersCount = (settings?.ordersDeliveredCount || 10000).toLocaleString('en-IN');
  const storeBio =
    settings?.storeBio ||
    'Rooted in the historic city of Kolhapur, Swarada Saree Center celebrates the timeless majesty of Indian handlooms. We curate certified Yeola Paithanis, royal Banarasi brocades, and festive designer apparel.';
  const storeAddress = settings?.address || 'Shop 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur - 416002';
  const storePhone = settings?.phone || settings?.whatsapp || '+91 93255 85754';
  const storeEmail = settings?.email || 'orders@swaradasareecenter.com';
  const storeHours = settings?.storeHours || 'Mon - Sun: 10:00 AM - 9:00 PM';
  const instagramUrl = settings?.socialInstagram || 'https://www.instagram.com/swarada_saree_center/';
  const facebookUrl = settings?.socialFacebook || 'https://www.facebook.com/swaradsareecenter';
  const youtubeUrl = settings?.socialYoutube || settings?.youtubeChannelUrl || 'https://www.youtube.com/@swaradasareecentre776/';

  return (
    <footer className="bg-[#140F11] text-[#FAF7F2] pt-18 pb-10 border-t-2 border-[#D4AF37] relative overflow-hidden">
      {/* Decorative top gold ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-radial from-[#D4AF37]/20 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Value Propositions Strip - With Dynamic Delivered Orders Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-14 border-b border-white/10 text-center">
          {/* Dynamic Orders Delivered Counter (Starts from 10,000 + increments on every purchase) */}
          <div className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#851C3B] to-[#641B32] border border-[#D4AF37] text-[#F3E2B8] flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 shadow-md">
              <PackageCheck className="w-7 h-7 text-[#F3E2B8]" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#FFFDF9] tracking-tight">
              {ordersCount}+ Orders Delivered
            </h4>
            <p className="text-xs text-neutral-300 mt-1 font-light">
              Trusted by handloom lovers across India & worldwide
            </p>
          </div>

          {/* Insured Pan-India Express */}
          <div className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl bg-[#641B32] border border-[#D4AF37]/40 text-[#F3E2B8] flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-300 shadow-md">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="font-heading text-sm font-bold text-[#FFFDF9]">Insured Pan-India Express</h4>
            <p className="text-xs text-neutral-400 mt-1 font-light">
              Free delivery on orders above ₹{settings?.freeShippingThreshold?.toLocaleString('en-IN') || '2,999'}
            </p>
          </div>

          {/* Secure Instant Checkout */}
          <div className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl bg-[#641B32] border border-[#D4AF37]/40 text-[#F3E2B8] flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-300 shadow-md">
              <CreditCard className="w-7 h-7" />
            </div>
            <h4 className="font-heading text-sm font-bold text-[#FFFDF9]">Secure Instant Checkout</h4>
            <p className="text-xs text-neutral-400 mt-1 font-light">UPI, Cards, NetBanking & Cash on Delivery</p>
          </div>
        </div>

        {/* Main Footer Links - Handloom Saree column removed; all shop details dynamic from admin settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-14 border-b border-white/10">
          {/* Brand Info & Bio (Admin Controlled) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName || 'Swarada Saree Center'}
                  className="h-12 w-auto max-w-[220px] object-contain rounded-md shadow-xs"
                />
              ) : (
                <div className="flex flex-col">
                  <span className="font-royal text-2xl sm:text-3xl font-bold tracking-[0.1em] text-white uppercase">
                    {settings?.storeName || 'Swarada'}
                  </span>
                  <span className="block text-[9px] tracking-[0.3em] font-medium text-[#D4AF37] uppercase -mt-0.5 font-royal">
                    Saree Center • Kolhapur
                  </span>
                </div>
              )}
            </Link>

            <p className="text-xs text-neutral-300/90 leading-relaxed max-w-md font-light">
              {storeBio}
            </p>

            {/* Social Channels */}
            <div className="flex items-center space-x-3 pt-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#641B32] border border-white/15 flex items-center justify-center text-[#F3E2B8] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#641B32] border border-white/15 flex items-center justify-center text-[#F3E2B8] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#641B32] border border-white/15 flex items-center justify-center text-[#F3E2B8] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Customer Care & Policies (Admin Configurable) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A05A] mb-4">
              Customer Care & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              {(settings?.footerMenus && settings.footerMenus.length > 0
                ? settings.footerMenus.filter((m) => m.active !== false)
                : [
                    { id: 'track-order', name: 'Track Your Order', href: '/track-order' },
                    { id: 'shipping-policy', name: 'Shipping & Delivery Policy', href: '/policies?tab=shipping' },
                    { id: 'returns-policy', name: 'No Return & No Exchange Policy', href: '/policies?tab=returns' },
                    { id: 'video-booking', name: 'Video Call Shopping Booking', href: '/contact' },
                  ]
              ).map((item) => (
                <li key={item.id || item.name}>
                  {item.href.startsWith('http') ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#F3E2B8] transition-colors"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link to={item.href} className="hover:text-[#F3E2B8] transition-colors">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolhapur Store Details (Admin Managed) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A05A] mb-4">
              Kolhapur Store
            </h4>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#C5A05A] shrink-0 mt-0.5" />
                <span className="leading-snug">{storeAddress}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>{storeEmail}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>{storeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} {settings?.storeName || 'Swarada Saree Center'}, Kolhapur. All Rights Reserved.</p>
          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="text-[11px] font-mono text-neutral-300">100% SECURE PAYMENTS POWERED BY RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
