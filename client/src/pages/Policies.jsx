import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Truck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Video,
  AlertTriangle,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';

export const Policies = ({ defaultTab = 'returns' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState(tabParam === 'authenticity' || tabParam === 'cancellation' ? 'returns' : tabParam);
  const { settings } = useSettings();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const supportPhone = settings?.phone || settings?.whatsapp || '+91 93255 85754';
  const supportEmail = settings?.email || 'contact@swaradasareecenter.com';

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* ─── Hero Header ────────────────────────────────────────── */}
      <section className="relative py-14 sm:py-18 bg-gradient-to-b from-[#641B32] to-[#4A1224] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#F3E2B8] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Store Terms & Concierge Policies</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#FAF7F2] tracking-tight">
            Store Policies & Customer Information
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#EAD8D8] leading-relaxed font-sans">
            Committed to complete transparency and authentic craftsmanship for every handloom creation curated at Swarada Saree Center, Kolhapur.
          </p>

          {/* Quick Tabs Navigator */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <button
              onClick={() => handleTabChange('returns')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'returns'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>No Return & No Exchange Policy</span>
            </button>

            <button
              onClick={() => handleTabChange('shipping')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'shipping'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Shipping & Delivery Policy</span>
            </button>

            <button
              onClick={() => handleTabChange('video-shopping')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'video-shopping'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Call Verification</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Tab Content ────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* TAB 1: NO RETURN NO EXCHANGE POLICY */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-6 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-5 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  No Return & No Exchange Policy
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  All sales are final across all handloom sarees, dresses, and ethnic apparel.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#641B32]">Strict No Return, No Exchange, No Refund Terms</h4>
                  <p className="text-neutral-700 text-xs sm:text-sm">
                    At <strong>Swarada Saree Center</strong>, every saree is an exclusive handloom piece. We maintain a strict <strong>No Return, No Exchange, and No Refund</strong> policy on all orders once placed.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  Why We Have This Policy
                </h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 pl-2">
                  <li>
                    <strong>Rigorous Hand Inspection:</strong> Every saree undergoes meticulous multi-point quality checks for weaving integrity, zari borders, and fabric purity before being dispatched from our Kolhapur flagship center.
                  </li>
                  <li>
                    <strong>Exclusive Handcrafted Pieces:</strong> Our handlooms are crafted by master weavers. Due to the delicate nature of pure zari and fine weaves, repeated handling and round-trip courier shipping compromise fabric freshness.
                  </li>
                  <li>
                    <strong>Video Call Assistance:</strong> To ensure you choose the exact color, design, and border you love, we offer personalized WhatsApp video shopping consultations before you make your purchase.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#FFFDF9] border border-[#D4AF37]/35 rounded-2xl space-y-2">
                <h4 className="font-bold text-[#641B32] flex items-center space-x-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transit Damage Claim Protocol</span>
                </h4>
                <p className="text-xs text-neutral-600">
                  In the very rare event that your parcel arrives visibly damaged during transit:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-600 pl-1">
                  <li>An <strong>uncut, continuous 360-degree package opening video</strong> from the original sealed courier flyer to the product inspection is mandatory.</li>
                  <li>The video must clearly show the courier shipping label with tracking AWB number.</li>
                  <li>The issue must be reported to our customer care team on WhatsApp (<strong>{supportPhone}</strong>) within <strong>24 hours</strong> of delivery.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHIPPING */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-6 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-5 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  Shipping & Express Logistics Policy
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Fast, insured courier delivery across India.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/40 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Free Express Shipping</div>
                  <div className="text-xl font-heading font-bold text-[#641B32]">Orders Above ₹2,999</div>
                  <p className="text-xs text-neutral-600">
                    Complimentary all-India express delivery with secure tamper-evident packaging on qualifying orders.
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/40 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Standard Shipping</div>
                  <div className="text-xl font-heading font-bold text-[#641B32]">₹150 Flat Fee</div>
                  <p className="text-xs text-neutral-600">
                    Flat nominal shipping charge for orders below ₹2,999. Includes door-to-door courier tracking via SMS & WhatsApp.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  Estimated Delivery Timelines
                </h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 pl-2">
                  <li><strong>Maharashtra & Goa:</strong> 2 to 3 business days.</li>
                  <li><strong>Major Metros:</strong> 3 to 4 business days.</li>
                  <li><strong>Rest of India:</strong> 4 to 6 business days.</li>
                  <li><strong>Dispatch:</strong> Orders placed before 3:00 PM IST on business days are dispatched on the same day from Kolhapur.</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#641B32]">Track an Existing Order</div>
                  <div className="text-xs text-neutral-500">Check live courier tracking and delivery status.</div>
                </div>
                <Link to="/track-order">
                  <Button variant="outline" size="sm" className="rounded-full border-[#641B32] text-[#641B32]">
                    Track Saree Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO SHOPPING */}
        {activeTab === 'video-shopping' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-6 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-5 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  Live Video Call Saree Inspection
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  View authentic drape, pallu, and zari luster live with our store stylists before ordering.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <p>
                Since we maintain a strict <strong>No Return & No Exchange Policy</strong>, we encourage all our patrons to take advantage of our live video shopping service. Our knowledgeable staff will personally showcase the sarees of your choice over a high-definition WhatsApp video call.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h4 className="font-bold text-[#641B32]">Select Sarees</h4>
                  <p className="text-xs text-neutral-600">
                    Pick your favorite sarees or SKUs from our online catalog.
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <h4 className="font-bold text-[#641B32]">Schedule Call</h4>
                  <p className="text-xs text-neutral-600">
                    Message us on WhatsApp ({supportPhone}) with your preferred time slot.
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <h4 className="font-bold text-[#641B32]">Inspect & Decide</h4>
                  <p className="text-xs text-neutral-600">
                    Examine colors under natural boutique lighting and place your order with complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Contact Concierge Banner ──────────────────────────── */}
        <div className="mt-10 bg-gradient-to-r from-[#641B32] to-[#801D39] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold font-heading text-[#FAF7F2]">
              Have Questions Before Ordering?
            </h4>
            <p className="text-xs text-[#EAD8D8]">
              Reach our Kolhapur flagship store team directly on WhatsApp or phone (10:00 AM – 9:00 PM IST).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`https://wa.me/${supportPhone.replace(/\D/g, '')}?text=Hello%20Swarada%20Saree%20Center,%20I%20have%20an%20inquiry%20before%20placing%20an%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Store</span>
            </a>

            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{supportPhone}</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Policies;
