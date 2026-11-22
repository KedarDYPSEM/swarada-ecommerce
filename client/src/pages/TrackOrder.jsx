import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Truck,
  Search,
  PackageCheck,
  Clock,
  CheckCircle,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import orderService from '../services/orderService';
import api from '../services/api';

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [trackingMilestones, setTrackingMilestones] = useState(null);
  const [error, setError] = useState(null);

  const fetchTracking = async (numberToTrack) => {
    if (!numberToTrack.trim()) return;
    setLoading(true);
    setError(null);
    setOrderResult(null);
    setTrackingMilestones(null);

    try {
      const order = await orderService.trackOrder(numberToTrack.trim());
      setOrderResult(order);

      // If order has an AWB shipment, get detailed milestones
      if (order.shipment?.awbNumber) {
        try {
          const res = await api.get(`/shipping/track/${order.shipment.awbNumber}`);
          if (res.data?.data?.milestones) {
            setTrackingMilestones(res.data.data.milestones);
          }
        } catch (e) {
          // Fallback milestones
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `No order found with number "${numberToTrack}". Please verify your order ID.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchTracking(initialOrder);
    }
  }, [initialOrder]);

  const handleTrack = (e) => {
    e.preventDefault();
    fetchTracking(orderNumber);
  };

  return (
    <div className="py-16 bg-[#FFF9F0] min-h-[75vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mx-auto shadow-sm">
            <Truck className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
              Live Consignment Tracking
            </span>
            <h1 className="mt-1 text-3xl font-heading font-bold text-[#641B32]">
              Track Your Saree Order
            </h1>
            <p className="mt-1 text-xs text-[#594E4E]">
              Enter your Swarada order number (e.g. SW-2026-1001) or Courier AWB number
            </p>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleTrack} className="bg-white p-6 border border-[#C5A05A]/30 rounded shadow-xs space-y-4">
          <div className="relative">
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="e.g. SW-2026-1001"
              required
              className="pl-10 font-mono font-bold uppercase text-[#641B32]"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full bg-[#641B32] hover:bg-[#7B1E35]">
            {loading ? 'Locating Consignment...' : 'Track Order Status'}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Order Result Details */}
        {orderResult && (
          <div className="bg-white border border-[#C5A05A]/40 rounded shadow-sm overflow-hidden text-xs">
            {/* Header Status Bar */}
            <div className="p-5 bg-gradient-to-r from-[#641B32] to-[#7B1E35] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A05A] tracking-wider">
                  Order Status
                </span>
                <div className="text-lg font-heading font-bold">
                  {orderResult.status.replace(/_/g, ' ')}
                </div>
                <div className="text-[11px] text-neutral-200 mt-0.5">
                  Order #{orderResult.orderNumber} • Placed {new Date(orderResult.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#C5A05A] tracking-wider">
                  Total Value
                </span>
                <div className="text-lg font-bold text-white">
                  {formatPrice(orderResult.totalAmount)}
                </div>
                <div className="text-[10px] text-neutral-300">
                  {orderResult.paymentMethod} ({orderResult.paymentStatus})
                </div>
              </div>
            </div>

            {/* Courier AWB Info */}
            <div className="p-4 bg-amber-50/60 border-b border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-[#641B32]">
                <Truck className="w-4 h-4 text-[#C5A05A]" />
                <span className="font-semibold">
                  Carrier: {orderResult.shipment?.provider || 'Swarada Express Logistics'}
                </span>
              </div>
              <div className="font-mono text-[11px] text-neutral-700">
                AWB:{' '}
                <span className="font-bold text-[#641B32]">
                  {orderResult.shipment?.awbNumber || 'Generating consignment number...'}
                </span>
              </div>
            </div>

            {/* Milestones Stepper */}
            <div className="p-6 space-y-5">
              <h3 className="font-heading font-bold text-sm text-[#292323]">
                Shipment Progress
              </h3>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {(trackingMilestones || [
                  {
                    title: 'Order Confirmed & Payment Verified',
                    location: 'Swarada Saree Center, Mahadwar Road, Kolhapur',
                    completed: true,
                  },
                  {
                    title: 'Silk Inspection, Steaming & Packed in Box',
                    location: 'Kolhapur Packaging Department',
                    completed: orderResult.status !== 'PENDING_PAYMENT',
                  },
                  {
                    title: 'Dispatched via Courier Express Partner',
                    location: 'Kolhapur Central Logistics Hub',
                    completed: orderResult.status === 'SHIPPED' || orderResult.status === 'OUT_FOR_DELIVERY' || orderResult.status === 'DELIVERED',
                  },
                  {
                    title: 'Out for Doorstep Delivery',
                    location: `${orderResult.shippingCity} Delivery Center`,
                    completed: orderResult.status === 'OUT_FOR_DELIVERY' || orderResult.status === 'DELIVERED',
                  },
                  {
                    title: 'Delivered to Customer',
                    location: `${orderResult.shippingCity}, India`,
                    completed: orderResult.status === 'DELIVERED',
                  },
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                        step.completed
                          ? 'bg-[#641B32]'
                          : 'bg-neutral-300 text-neutral-500'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="font-semibold text-neutral-800">{step.title}</div>
                    <div className="text-[11px] text-neutral-500">{step.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Summary */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
              <span className="font-semibold text-neutral-700 block mb-2">Package Contents:</span>
              <div className="space-y-1.5">
                {orderResult.items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-neutral-600">
                    <span>
                      {it.productName} ({it.sku}) × {it.quantity}
                    </span>
                    <span className="font-medium text-neutral-800">{formatPrice(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
