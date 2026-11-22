import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = ({ sku = null, productName = null }) => {
  const phoneNumber = '919822012345';
  let message = 'Hello Swarada Saree Center! I am browsing your online store and would like to inquire about your saree collections.';

  if (sku && productName) {
    message = `Hello Swarada Saree Center! I am interested in purchasing: ${productName} (SKU: ${sku}). Please share availability and live video call details.`;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="text-xs font-semibold tracking-wide hidden sm:inline">
        WhatsApp Us
      </span>
    </a>
  );
};

export default WhatsAppButton;
