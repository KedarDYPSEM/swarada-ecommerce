import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';

export const CartPage = () => {
  return (
    <div className="py-12 bg-[#FFF9F0] min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#641B32]/10 text-[#641B32] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-[#641B32]">
          Your Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm text-[#594E4E] max-w-md mx-auto">
          Review your chosen handlooms and bridal sarees. Free express delivery across India is automatically applied on orders above ₹2,999.
        </p>

        <div className="bg-white border border-[#C5A05A]/30 p-8 rounded-sm shadow-xs max-w-md mx-auto space-y-4">
          <div className="flex justify-between text-xs py-2 border-b border-neutral-100">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(14999)}</span>
          </div>
          <div className="flex justify-between text-xs py-2 border-b border-neutral-100">
            <span>Estimated Shipping</span>
            <span className="text-emerald-700 font-semibold">FREE</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#641B32] pt-2">
            <span>Estimated Total</span>
            <span>{formatPrice(14999)}</span>
          </div>

          <Link to="/checkout" className="block pt-2">
            <Button variant="primary" className="w-full py-3">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div>
          <Link to="/shop" className="text-xs text-[#641B32] hover:underline font-semibold">
            ← Continue Browsing Handloom Sarees
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
