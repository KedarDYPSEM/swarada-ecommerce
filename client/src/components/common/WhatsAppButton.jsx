import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhatsAppButton = ({ sku = null, productName = null }) => {
  const { settings } = useSettings();
  const rawNumber = settings?.whatsapp || settings?.phone || '9325585754';
  const cleanDigits = rawNumber.replace(/\D/g, '');
  const phoneNumber = cleanDigits.startsWith('91') && cleanDigits.length === 12 ? cleanDigits : `91${cleanDigits.slice(-10)}`;
  let message = 'Hello Swarada Saree Center! I am browsing your online store and would like to inquire about your saree collections.';

  if (sku && productName) {
    message = `Hello Swarada Saree Center! I am interested in purchasing: ${productName} (SKU: ${sku}). Please share availability and live video call details.`;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Animated Radar Pulse Ring */}
      <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-75 animate-radar pointer-events-none" />

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center space-x-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4.5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-108 group border border-emerald-400/40"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline font-body">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
