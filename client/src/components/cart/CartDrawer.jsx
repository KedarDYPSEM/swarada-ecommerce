import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';

export const CartDrawer = () => {
  const {
    isDrawerOpen,
    closeCartDrawer,
    items,
    summary,
    itemCount,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    couponCode,
    error,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setCouponError('');
    setIsApplying(true);
    try {
      await applyCoupon(inputCoupon.trim());
      setInputCoupon('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / summary.freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCartDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 border-l border-[#D4AF37]/30">
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/30 flex items-center justify-between bg-gradient-to-r from-[#641B32] via-[#7B1E35] to-[#851C3B] text-white shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] block font-semibold">✦ Royal Wardrobe ✦</span>
              <h2 className="font-heading text-lg font-bold leading-tight">Shopping Bag ({itemCount})</h2>
            </div>
          </div>
          <button
            onClick={closeCartDrawer}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:text-[#D4AF37] transition-all cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF5EB] to-[#FFFDF9] p-3.5 border-b border-[#D4AF37]/30 text-xs shadow-2xs">
          {summary.amountNeededForFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[#641B32] font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add {formatPrice(summary.amountNeededForFreeShipping)} more for FREE All-India Shipping!</span>
                </span>
                <span className="text-[11px] font-bold text-[#D4AF37]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full transition-all duration-500 rounded-full shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>You unlocked FREE Express Delivery across India!</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="p-3.5 bg-white border border-[#D4AF37]/25 rounded-2xl shadow-2xs flex space-x-3.5 hover:border-[#D4AF37]/50 transition-colors">
                {/* Thumbnail */}
                <Link
                  to={`/product/${item.product.slug}`}
                  onClick={closeCartDrawer}
                  className="w-18 h-24 rounded-xl overflow-hidden border border-[#D4AF37]/20 shrink-0 bg-[#F7F2E7] block hover:scale-102 transition-transform"
                >
                  <img
                    src={
                      item.product.primaryImage ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCartDrawer}
                        className="text-xs font-bold text-[#140F11] hover:text-[#641B32] line-clamp-2 leading-snug transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 ml-1 cursor-pointer transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      SKU: {item.product.sku}
                    </p>
                    {item.variant && (
                      <p className="text-[11px] text-[#641B32] font-semibold flex items-center gap-1.5 mt-0.5">
                        {item.variant.colorCode && (
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                            style={{ backgroundColor: item.variant.colorCode }}
                          />
                        )}
                        <span>Color: {item.variant.variantValue}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-neutral-300 rounded-full bg-white shadow-2xs overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold text-[#140F11]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-sm font-bold text-[#641B32]">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#D4AF37]/40 flex items-center justify-center text-[#641B32]">
                <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#641B32]">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-[#594E4E] max-w-xs leading-relaxed">
                Explore our handwoven Yeola Paithani and Banarasi bridal collections to adorn your wardrobe.
              </p>
              <Link to="/shop" onClick={closeCartDrawer}>
                <Button variant="primary" size="sm" className="mt-2 rounded-full shadow-md">
                  Browse Royal Sarees
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer / Summary Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#D4AF37]/30 bg-white shadow-lg space-y-4">
            {/* Coupon Section */}
            <div>
              {summary.coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 shadow-2xs">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      Code <strong>{summary.coupon.code}</strong> applied ({formatPrice(summary.discountAmount)} off)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. FIRST10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-full px-3.5 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#641B32] shadow-2xs font-medium"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={isApplying}
                      className="text-xs font-bold rounded-full px-4"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600 pl-2">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#292323] border-t border-neutral-100 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{formatPrice(summary.subtotal)}</span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- {formatPrice(summary.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-600">All-India Shipping</span>
                <span>
                  {summary.shippingAmount === 0 ? (
                    <strong className="text-emerald-700 font-bold">FREE</strong>
                  ) : (
                    formatPrice(summary.shippingAmount)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Taxes & GST (Included)</span>
                <span>{formatPrice(summary.gstAmount)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#641B32] pt-2 border-t border-neutral-100">
                <span>Total Amount</span>
                <span className="text-lg">{formatPrice(summary.totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              onClick={handleCheckout}
              variant="primary"
              className="w-full py-3.5 text-sm font-bold shadow-lg flex items-center justify-center space-x-2 rounded-full gold-shimmer-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
