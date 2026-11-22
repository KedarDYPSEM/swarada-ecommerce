import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Video } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Contact Swarada Saree Center
          </h1>
          <p className="text-xs sm:text-sm text-[#594E4E] max-w-lg mx-auto">
            Visit our flagship store in Kolhapur or schedule a personalized WhatsApp video shopping session.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Store Info */}
          <div className="lg:col-span-5 bg-white p-8 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-6">
            <h3 className="font-heading text-lg font-bold text-[#641B32]">
              Flagship Showroom
            </h3>

            <div className="space-y-4 text-xs text-[#292323]">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#C5A05A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Swarada Saree Center</p>
                  <p className="text-neutral-500">Shop No. 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur, Maharashtra 416002</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#C5A05A] shrink-0" />
                <div>
                  <p className="font-semibold">Phone Inquiries</p>
                  <p className="text-neutral-500">+91 98220 12345 / 0231 2654321</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold">WhatsApp Video Shopping</p>
                  <p className="text-neutral-500">+91 98220 12345</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#C5A05A] shrink-0" />
                <div>
                  <p className="font-semibold">Store Timings</p>
                  <p className="text-neutral-500">Monday - Sunday: 10:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Shopping Booking Form */}
          <div className="lg:col-span-7 bg-white p-8 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-[#C5A05A]">
              <Video className="w-5 h-5" />
              <h3 className="font-heading text-lg font-bold text-[#641B32]">
                Book a Video Shopping Appointment
              </h3>
            </div>
            <p className="text-xs text-[#594E4E]">
              Our saree consultants will video call you directly on WhatsApp to display the exact sarees, pallu weaves and zari details you desire.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xs text-center text-xs text-emerald-800">
                Thank you! Our video shopping consultant will reach out to you within 30 minutes on WhatsApp.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Your Name</label>
                    <Input placeholder="Ananya Joshi" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">WhatsApp Number</label>
                    <Input placeholder="9822012345" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Saree Types Interested In</label>
                  <Input placeholder="e.g. Yeola Paithani for Wedding, Banarasi Silk, Nauvari" required />
                </div>

                <Button type="submit" variant="primary" className="w-full py-3">
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
