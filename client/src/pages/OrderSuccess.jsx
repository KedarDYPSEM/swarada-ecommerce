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
    <div className="py-12 sm:py-20 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Card Header */}
        <div className="bg-white border border-[#C5A05A]/40 rounded-xs p-8 sm:p-12 text-center shadow-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Order Successfully Placed
          </span>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Thank You for Celebrating with Swarada!
          </h1>

          <p className="text-xs sm:text-sm text-[#594E4E] max-w-lg mx-auto leading-relaxed">
            Your handloom saree order has been received and is being prepared with our signature heirloom keepsake packaging at our Kolhapur store.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center space-x-2 bg-[#FFF9F0] border border-[#C5A05A] px-4 py-2 rounded-xs">
              <span className="text-xs text-neutral-500">Order Reference Number:</span>
              <span className="font-mono text-sm font-bold text-[#641B32]">
                {orderNumber || 'SW-2026-1001'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Timeline */}
        <div className="bg-white border border-[#C5A05A]/30 rounded-xs p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-heading text-lg font-bold text-[#641B32] border-b border-neutral-100 pb-3 flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#C5A05A]" />
            <span>Fulfillment & Delivery Progress</span>
          </h3>

          {/* Stepper */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 space-y-1">
              <span className="font-bold block">1. Confirmed</span>
              <span className="text-[10px] text-emerald-600">Inventory Reserved</span>
            </div>
            <div className="p-3 bg-[#FFF9F0] border border-[#C5A05A]/40 rounded text-[#641B32] space-y-1">
              <span className="font-bold block">2. In Preparation</span>
              <span className="text-[10px] text-neutral-500">Kolhapur Flagship</span>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-neutral-500 space-y-1">
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
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get WhatsApp Dispatch Alerts</span>
            </a>

            <button
              onClick={() => window.print()}
              className="py-3 px-4 border border-neutral-300 hover:border-[#641B32] bg-[#FFF9F0] text-[#292323] rounded-xs text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="text-center pt-2">
          <Link to="/shop">
            <Button variant="primary" size="lg" className="shadow-md">
              <span>Continue Shopping Handlooms</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
