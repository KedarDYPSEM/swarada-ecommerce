import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  MessageCircle,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import orderService from '../services/orderService';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';

export const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  useEffect(() => {
    if (orderNumber) {
      const fetchOrder = async () => {
        try {
          const data = await orderService.trackOrder(orderNumber);
          if (data) setOrder(data);
        } catch (e) {
          // Fallback gracefully
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderNumber]);

  const whatsappMessage = `Hello Swarada Saree Center! I just placed order #${orderNumber || 'SW-2026-1001'}. Please confirm dispatch details and updates.`;
  const whatsappUrl = `https://wa.me/919822012345?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="py-12 sm:py-20 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Card Header */}
        <div className="bg-white/95 backdrop-blur-md border border-[#D4AF37]/35 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-amber-950/5 space-y-4 relative overflow-hidden">
          <div className="w-18 h-18 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
            <span>✦</span>
            <span>Order Confirmed & Celebrated</span>
            <span>✦</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#140F11]">
            Thank You for Celebrating with Swarada!
          </h1>

          <p className="text-xs sm:text-sm text-[#594E4E] max-w-lg mx-auto leading-relaxed">
            Your handloom saree order has been received and is being prepared with our signature heirloom keepsake packaging at our Kolhapur store.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-[#D4AF37]/40 px-5 py-2.5 rounded-full shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium">Order Reference:</span>
              <span className="font-mono text-sm font-extrabold text-[#641B32]">
                {orderNumber || 'SW-2026-1001'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Timeline */}
        <div className="bg-white/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-heading text-lg font-bold text-[#641B32] border-b border-amber-100/70 pb-3.5 flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span>Fulfillment & Delivery Progress</span>
          </h3>

          {/* Stepper */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-1 shadow-2xs">
              <span className="font-bold block">1. Confirmed</span>
              <span className="text-[10px] text-emerald-600">Inventory Reserved</span>
            </div>
            <div className="p-3.5 bg-amber-50/70 border border-[#D4AF37]/40 rounded-2xl text-[#641B32] space-y-1 shadow-2xs">
              <span className="font-bold block">2. In Preparation</span>
              <span className="text-[10px] text-neutral-500">Kolhapur Flagship</span>
            </div>
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-500 space-y-1">
              <span className="font-bold block">3. Express Delivery</span>
              <span className="text-[10px] text-neutral-400">Within 48-72 Hours</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/15 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get WhatsApp Dispatch Alerts</span>
            </a>

            <button
              onClick={() => window.print()}
              className="py-3.5 px-5 border border-[#D4AF37]/35 hover:border-[#641B32] bg-white text-[#140F11] rounded-full text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print Order Receipt</span>
            </button>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="text-center pt-2">
          <Link to="/shop">
            <Button variant="primary" size="lg" className="rounded-full shadow-xl gold-shimmer-btn">
              <span>Continue Exploring Royal Catalog</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
