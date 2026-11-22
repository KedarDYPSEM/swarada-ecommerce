import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Checkout = () => {
  return (
    <div className="py-12 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Secure Razorpay Checkout
          </span>
          <h1 className="mt-1 text-3xl font-heading font-bold text-[#641B32]">
            Complete Your Saree Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-4">
            <h2 className="text-base font-heading font-bold text-[#641B32] border-b border-neutral-100 pb-2">
              1. Delivery Address
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Full Name</label>
                <Input placeholder="Ananya Joshi" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Mobile Number</label>
                <Input placeholder="9822012345" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Address Line 1</label>
              <Input placeholder="Flat / House No., Building Name, Street" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">City</label>
                <Input placeholder="Kolhapur" defaultValue="Kolhapur" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">State</label>
                <Input placeholder="Maharashtra" defaultValue="Maharashtra" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-600 mb-1">Pincode</label>
                <Input placeholder="416008" />
              </div>
            </div>

            <h2 className="text-base font-heading font-bold text-[#641B32] border-b border-neutral-100 pb-2 pt-4">
              2. Payment Method
            </h2>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-[#C5A05A] rounded-xs bg-[#FFF9F0]/60 cursor-pointer">
                <input type="radio" name="paymentMethod" defaultChecked className="text-[#641B32]" />
                <span className="text-xs font-semibold text-[#292323]">
                  Razorpay (UPI, Google Pay, PhonePe, Cards, Netbanking)
                </span>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-xs hover:bg-[#FFF9F0]/30 cursor-pointer">
                <input type="radio" name="paymentMethod" className="text-[#641B32]" />
                <span className="text-xs font-semibold text-[#292323]">
                  Cash on Delivery (COD)
                </span>
              </label>
            </div>

            <Button variant="primary" className="w-full py-3.5 mt-4 text-sm font-semibold">
              <Lock className="w-4 h-4 mr-2" />
              <span>Proceed to Pay Securely</span>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-[#C5A05A]/30 rounded-xs shadow-xs h-fit space-y-4">
            <h2 className="text-base font-heading font-bold text-[#641B32] border-b border-neutral-100 pb-2">
              Order Summary
            </h2>

            <div className="flex items-center space-x-3 py-2 border-b border-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80"
                alt="Paithani Saree"
                className="w-14 h-16 object-cover rounded-xs border"
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-semibold text-[#292323] truncate">Maharani Yeola Silk Paithani</p>
                <p className="text-neutral-500">Qty: 1 • Maroon</p>
                <p className="font-bold text-[#641B32] mt-0.5">₹14,999</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹14,999</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#641B32] pt-2 border-t border-neutral-100">
                <span>Total Amount</span>
                <span>₹14,999</span>
              </div>
            </div>

            <div className="p-3 bg-[#FFF9F0] border border-[#C5A05A]/40 rounded-xs flex items-center space-x-2 text-[11px] text-[#594E4E]">
              <ShieldCheck className="w-4 h-4 text-[#C5A05A] shrink-0" />
              <span>256-bit SSL encrypted & secure Razorpay transactions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
