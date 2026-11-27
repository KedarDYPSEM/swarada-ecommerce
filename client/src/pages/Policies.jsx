import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Package,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';

export const Policies = ({ defaultTab = 'returns' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || defaultTab;
  const [activeTab, setActiveTab] = useState(tabParam);
  const { settings } = useSettings();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const supportPhone = settings?.phone || '+91 98220 12345';
  const supportEmail = settings?.email || 'contact@swaradasareecenter.com';

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* ─── Hero Header ────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#641B32] to-[#4A1224] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#F3E2B8] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Swarada Concierge & Heritage Guarantees</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#FAF7F2] tracking-tight">
            Policies & Customer Care
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#EAD8D8] leading-relaxed font-sans">
            Committed to complete transparency, authentic craftsmanship, and your absolute delight with every heirloom saree curated in Kolhapur.
          </p>

          {/* Quick Tabs Navigator */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <button
              onClick={() => handleTabChange('returns')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'returns'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>7-Day Returns & Exchange</span>
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
              <span>Shipping & Delivery</span>
            </button>

            <button
              onClick={() => handleTabChange('authenticity')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'authenticity'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Silk Mark Authenticity</span>
            </button>

            <button
              onClick={() => handleTabChange('cancellation')}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'cancellation'
                  ? 'bg-[#D4AF37] text-[#4A1224] shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Cancellations & Refunds</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Tab Content ────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* TAB 1: RETURNS & EXCHANGE */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  7-Day Return & Doorstep Exchange Policy
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Your complete satisfaction is our royal pledge.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="p-4 bg-[#FFFDF9] border border-[#D4AF37]/40 rounded-2xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#641B32]">7 Days Doorstep Return Window</h4>
                  <p className="text-neutral-600 mt-1">
                    You have 7 calendar days from the date of delivery to request an exchange or return for any saree, dress, kurti, or accessory ordered from our online boutique.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  Eligibility Criteria for Returns & Exchanges
                </h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 pl-2">
                  <li>The saree must be unworn, unwashed, and in its original pristine condition.</li>
                  <li>The original heirloom tags, Silk Mark tags (where applicable), and folding pleats must be intact.</li>
                  <li>Returned in the original luxury Swarada keepsake box and protective packaging.</li>
                  <li>Customized sarees (such as stitched blouses or bespoke fall/pico customized upon specific request) are eligible for exchange only in case of transit defect.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  How to Initiate an Easy Return
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">1</span>
                    <h5 className="font-bold text-[#641B32]">Contact Concierge</h5>
                    <p className="text-xs text-neutral-500">
                      Send a WhatsApp or email with your Order Number (e.g. SW2026-XXXX) and photo of the item.
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">2</span>
                    <h5 className="font-bold text-[#641B32]">Reverse Pickup</h5>
                    <p className="text-xs text-neutral-500">
                      Our courier partner (Delhivery/Blue Dart) will pick up the parcel securely from your doorstep.
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold">3</span>
                    <h5 className="font-bold text-[#641B32]">Prompt Resolution</h5>
                    <p className="text-xs text-neutral-500">
                      Upon arrival and quality verification, replacement is dispatched or refund processed within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHIPPING */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  Shipping & Express Logistics Policy
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Insured, air-express delivery across all 28,000+ Indian postal codes.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/40 rounded-2xl space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Free Express Shipping</div>
                  <div className="text-xl font-heading font-bold text-[#641B32]">Orders Above ₹2,999</div>
                  <p className="text-xs text-neutral-600">
                    Complimentary all-India express delivery with tamper-proof royal protective packaging on orders reaching the qualifying threshold.
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
                  <li><strong>Metros (Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 3 to 4 business days.</li>
                  <li><strong>Rest of India:</strong> 4 to 6 business days.</li>
                  <li><strong>Same-Day Dispatch:</strong> All orders confirmed before 3:00 PM IST are processed and handed to the air courier the very same day from our Kolhapur flagship center.</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#641B32]">Have an Active Order?</div>
                  <div className="text-xs text-neutral-500">Track real-time shipment status and courier AWB.</div>
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

        {/* TAB 3: AUTHENTICITY */}
        {activeTab === 'authenticity' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  100% Handloom Authenticity & Silk Mark Assurance
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Direct master weaver lineage from Yeola, Paithan, Varanasi, and Kolhapur.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <p>
                Every pure silk creation curated by Swarada Saree Center is woven using genuine mulberry silk and authentic zari. We carry the trusted legacy of the historic Mahalaxmi temple precinct of Kolhapur, preserving traditional handloom heritage without synthetic imitations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-1">
                  <div className="font-bold text-[#641B32]">Silk Mark Certified</div>
                  <p className="text-xs text-neutral-600">
                    Recognized and labeled by the Silk Mark Organisation of India (SMOI) verifying 100% natural pure silk content.
                  </p>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-1">
                  <div className="font-bold text-[#641B32]">Pure Zari Brocades</div>
                  <p className="text-xs text-neutral-600">
                    Traditional metallic brocade weaving techniques tested for luster, longevity, and non-tarnishing sheen.
                  </p>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-1">
                  <div className="font-bold text-[#641B32]">Video Consultation</div>
                  <p className="text-xs text-neutral-600">
                    Book a live WhatsApp video session to inspect the fall, drape, zari luster, and border before purchasing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CANCELLATIONS & REFUNDS */}
        {activeTab === 'cancellation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#D4AF37]/30 space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#641B32]/10 text-[#641B32] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32]">
                  Order Cancellation & Refund Terms
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Swift, automated refunds returned directly to your original payment source.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  Order Cancellation
                </h3>
                <p>
                  Orders can be cancelled at any point prior to dispatch by reaching out to our concierge or through your customer dashboard. If your payment window was closed or incomplete, the items are automatically restored to available stock without penalty.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#292323] font-heading">
                  Refund Processing Timelines
                </h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 pl-2">
                  <li><strong>UPI & Netbanking:</strong> 2 to 4 business days.</li>
                  <li><strong>Credit & Debit Cards:</strong> 5 to 7 business days (subject to issuing bank turnaround).</li>
                  <li><strong>Cash on Delivery (COD) Returns:</strong> Refund is issued via direct NEFT / IMPS bank transfer to your provided account details within 24 hours of return receipt.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── Contact Concierge Banner ──────────────────────────── */}
        <div className="mt-10 bg-gradient-to-r from-[#641B32] to-[#801D39] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold font-heading text-[#FAF7F2]">
              Need Immediate Personal Assistance?
            </h4>
            <p className="text-xs text-[#EAD8D8]">
              Our Kolhapur boutique concierge is available 7 days a week (10:00 AM – 9:00 PM IST).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`https://wa.me/${supportPhone.replace(/\D/g, '')}?text=Hello%20Swarada%20Saree%20Center,%20I%20have%20an%20inquiry%20regarding%20policies`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Concierge</span>
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
