import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from './SocialIcons';
import { useSettings } from '../../context/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();
  return (
    <footer className="bg-[#292323] text-[#FFF9F0] pt-16 pb-8 border-t-2 border-[#C5A05A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-750 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-sm font-semibold text-white">100% Authentic Handloom</h4>
            <p className="text-xs text-neutral-400 mt-1">Direct from Yeola, Varanasi & Kanchi weavers</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-sm font-semibold text-white">Express Pan-India Shipping</h4>
            <p className="text-xs text-neutral-400 mt-1">Free express delivery on orders above ₹2,999</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-sm font-semibold text-white">7-Day Easy Returns</h4>
            <p className="text-xs text-neutral-400 mt-1">Hassle-free replacement & exchange policy</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-heading text-sm font-semibold text-white">Razorpay Secure Checkout</h4>
            <p className="text-xs text-neutral-400 mt-1">UPI, Cards, Netbanking & Cash on Delivery</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-neutral-750">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName || 'Swarada Saree Center'}
                  className="h-12 w-auto max-w-[220px] object-contain brightness-0 invert"
                />
              ) : (
                <>
                  <span className="font-heading text-2xl font-bold tracking-wider text-white uppercase">
                    Swarada
                  </span>
                  <span className="block text-[10px] tracking-[0.25em] font-medium text-[#C5A05A] uppercase -mt-1">
                    Saree Center • Kolhapur
                  </span>
                </>
              )}
            </Link>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
              Rooted in the historic city of Kolhapur, Swarada Saree Center celebrates the unmatched majesty of Indian handlooms. We curate certified Yeola Paithanis, royal Banarasi brocades, and festive designer apparel.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[#C5A05A] hover:bg-[#641B32] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[#C5A05A] hover:bg-[#641B32] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[#C5A05A] hover:bg-[#641B32] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Saree Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A05A] mb-4">
              Handloom Sarees
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <Link to="/shop?category=paithani-sarees" className="hover:text-white transition-colors">
                  Yeola Pure Silk Paithani
                </Link>
              </li>
              <li>
                <Link to="/shop?category=banarasi-silk" className="hover:text-white transition-colors">
                  Banarasi Katan Silk
                </Link>
              </li>
              <li>
                <Link to="/shop?category=nauvari-sarees" className="hover:text-white transition-colors">
                  Traditional Nauvari (Kashta)
                </Link>
              </li>
              <li>
                <Link to="/shop?category=sarees" className="hover:text-white transition-colors">
                  Temple Border Sarees
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bridal" className="hover:text-white transition-colors">
                  Bridal Troussseau Sarees
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Help */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A05A] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-white transition-colors">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Video Call Shopping Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A05A] mb-4">
              Kolhapur Store
            </h4>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#C5A05A] shrink-0 mt-0.5" />
                <span>Shop 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur - 416002</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>+91 98220 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>orders@swaradasareecenter.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#C5A05A] shrink-0" />
                <span>Mon - Sun: 10:00 AM - 9:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Swarada Saree Center, Kolhapur. All Rights Reserved.</p>
          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="text-[11px] font-mono text-neutral-300">100% SECURE PAYMENTS POWERED BY RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
