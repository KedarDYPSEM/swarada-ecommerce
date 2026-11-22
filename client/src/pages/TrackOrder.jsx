import React, { useState } from 'react';
import { Truck, Search, PackageCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearched(true);
    }
  };

  return (
    <div className="py-16 bg-[#FFF9F0] min-h-[70vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#641B32] text-[#C5A05A] flex items-center justify-center mx-auto shadow-sm">
          <Truck className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Shipment Status
          </span>
          <h1 className="mt-1 text-3xl font-heading font-bold text-[#641B32]">
            Track Your Saree Order
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#594E4E]">
            Enter your unique Swarada order number (e.g. SW-2026-001) to view real-time delivery status.
          </p>
        </div>

        <form onSubmit={handleTrack} className="bg-white p-6 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-4">
          <div className="relative">
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. SW-2026-001"
              required
              className="pl-10"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Track Order Status
          </Button>
        </form>

        {searched && (
          <div className="bg-white p-6 border border-emerald-300 rounded-xs text-left space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs">
              <PackageCheck className="w-4 h-4" />
              <span>Order #{orderNumber.toUpperCase()} Confirmed & Dispatched</span>
            </div>
            <p className="text-xs text-neutral-600">
              Shipment partner: <strong>Delhivery Express</strong> • AWB: <strong>DEL982201992</strong>
            </p>
            <p className="text-xs text-neutral-500">
              Current status: <em>Departed from Kolhapur Hub • Expected Delivery within 48 Hours</em>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
