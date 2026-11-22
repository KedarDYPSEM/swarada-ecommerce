import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';

export const CartPage = () => {
  const {
    items,
    summary,
    itemCount,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError('');
    setIsApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setIsApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 bg-[#FFF9F0] min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-white border border-[#C5A05A]/40 flex items-center justify-center text-[#641B32] shadow-xs mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-[#641B32]">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#594E4E] mt-2 mb-8 max-w-md">
          Explore our signature Yeola Paithani, royal Banarasi brocades, and traditional Nauvari sarees.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="lg">
            Explore Handloom Sarees
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FFF9F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Review & Checkout
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-heading font-bold text-[#641B32]">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items Table */}
          <div className="lg:col-span-8 bg-white border border-[#C5A05A]/30 rounded-xs shadow-xs p-6 space-y-6">
            {/* Free shipping banner */}
            <div className="p-3 bg-[#FFF9F0] border border-[#C5A05A]/30 rounded text-xs flex items-center justify-between">
              {summary.amountNeededForFreeShipping > 0 ? (
                <div className="flex items-center space-x-2 text-[#641B32]">
                  <Truck className="w-4 h-4 text-[#C5A05A]" />
                  <span>
                    Add <strong>{formatPrice(summary.amountNeededForFreeShipping)}</strong> more to get <strong>FREE Express Shipping</strong>!
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#C5A05A]" />
                  <span>Congratulations! You qualify for FREE All-India Shipping.</span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 sm:py-6 flex space-x-4">
                  <Link to={`/product/${item.product.slug}`} className="w-20 sm:w-24 h-28 sm:h-32 rounded-xs overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 block">
                    <img
                      src={item.product.primaryImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="text-sm font-semibold text-[#292323] hover:text-[#641B32] line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 ml-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-1">
                        <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">
                          SKU: {item.product.sku}
                        </span>
                        {item.product.fabric && <span>• {item.product.fabric}</span>}
                      </div>

                      {item.variant && (
                        <div className="flex items-center gap-1.5 text-xs text-[#641B32] font-medium mt-1">
                          {item.variant.colorCode && (
                            <span
                              className="w-3 h-3 rounded-full inline-block border border-black/20"
                              style={{ backgroundColor: item.variant.colorCode }}
                            />
                          )}
                          <span>Color: {item.variant.variantValue}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center border border-neutral-300 rounded bg-[#FFF9F0]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-[#641B32]">
                          {formatPrice(item.totalPrice)}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {formatPrice(item.unitPrice)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Card */}
            <div className="bg-white border border-[#C5A05A]/30 rounded-xs p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#292323]">
                Apply Coupon Code
              </h3>

              {summary.coupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs flex items-center justify-between text-emerald-800">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span>
                      Coupon <strong>{summary.coupon.code}</strong> applied
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. FIRST10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FFF9F0] border border-neutral-300 rounded px-3 py-2 text-xs uppercase focus:outline-none focus:border-[#641B32]"
                    />
                    <Button type="submit" variant="secondary" size="sm" isLoading={isApplying}>
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Calculations Summary */}
            <div className="bg-white border border-[#C5A05A]/30 rounded-xs p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-heading font-bold text-[#641B32] border-b border-neutral-100 pb-3">
                Order Total Summary
              </h3>

              <div className="space-y-2 text-xs text-[#292323]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold">{formatPrice(summary.subtotal)}</span>
                </div>

                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(summary.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span>
                    {summary.shippingAmount === 0 ? (
                      <strong className="text-emerald-700">FREE</strong>
                    ) : (
                      formatPrice(summary.shippingAmount)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Estimated GST (Included)</span>
                  <span>{formatPrice(summary.gstAmount)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#641B32] pt-3 border-t border-neutral-200">
                  <span>Total Payable</span>
                  <span>{formatPrice(summary.totalAmount)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                variant="primary"
                className="w-full py-3.5 text-sm font-semibold shadow-md flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-[#594E4E]">
                <ShieldCheck className="w-4 h-4 text-[#C5A05A]" />
                <span>100% Genuine Handlooms • Razorpay Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
