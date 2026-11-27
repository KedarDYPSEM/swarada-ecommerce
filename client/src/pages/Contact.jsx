import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Video } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettings } from '../context/SettingsContext';

export const Contact = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
            <span>✦</span>
            <span>Direct Concierge</span>
            <span>✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#140F11]">
            Contact Swarada Saree Center
          </h1>
          <p className="text-xs sm:text-sm text-[#594E4E] max-w-lg mx-auto leading-relaxed">
            Visit our flagship boutique in Kolhapur or schedule a personalized WhatsApp video shopping consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Store Info */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md p-8 border border-[#D4AF37]/35 rounded-3xl shadow-lg space-y-6">
            <h3 className="font-heading text-xl font-bold text-[#641B32] border-b border-amber-100/70 pb-3">
              Flagship Boutique
            </h3>

            <div className="space-y-4 text-xs text-[#292323]">
              <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-amber-50/40 border border-[#D4AF37]/20">
                <MapPin className="w-5 h-5 text-[#641B32] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#140F11]">Swarada Saree Center</p>
                  <p className="text-neutral-500 mt-0.5">{settings?.address || 'Shop No. 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur, Maharashtra 416002'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-amber-50/40 border border-[#D4AF37]/20">
                <Phone className="w-5 h-5 text-[#641B32] shrink-0" />
                <div>
                  <p className="font-bold text-[#140F11]">Phone Inquiries</p>
                  <p className="text-neutral-500 mt-0.5">+91 93255 85754 / 0231 2654321</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">WhatsApp Video Shopping</p>
                  <p className="text-emerald-700 mt-0.5">+91 93255 85754 (Instant Reply)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-amber-50/40 border border-[#D4AF37]/20">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <p className="font-bold text-[#140F11]">Store Timings</p>
                  <p className="text-neutral-500 mt-0.5">Monday - Sunday: 10:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Shopping Booking Form */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md p-8 border border-[#D4AF37]/35 rounded-3xl shadow-lg space-y-5">
            <div className="flex items-center space-x-2 text-[#D4AF37]">
              <Video className="w-5 h-5 text-[#641B32]" />
              <h3 className="font-heading text-xl font-bold text-[#641B32]">
                Book a Video Shopping Appointment
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#594E4E] leading-relaxed">
              Our saree consultants will video call you directly on WhatsApp to display the exact sarees, pallu weaves and zari details you desire.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 shadow-2xs space-y-2">
                <p className="font-bold text-sm">Thank You for Inquiring!</p>
                <p>Our video shopping concierge will reach out to you within 30 minutes on WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">Your Name</label>
                    <Input placeholder="e.g. Ananya Joshi" required className="rounded-xl border-[#D4AF37]/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">WhatsApp Number</label>
                    <Input placeholder="e.g. 9822012345" required className="rounded-xl border-[#D4AF37]/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">Saree Types Interested In</label>
                  <Input placeholder="e.g. Yeola Paithani for Wedding, Banarasi Silk, Nauvari" required className="rounded-xl border-[#D4AF37]/30" />
                </div>

                <Button type="submit" variant="primary" className="w-full py-4 rounded-full font-bold shadow-xl gold-shimmer-btn">
                  Request Video Call Appointment
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
