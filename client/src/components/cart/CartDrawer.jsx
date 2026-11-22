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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#641B32] text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#C5A05A]" />
            <h2 className="font-heading text-lg font-bold">Shopping Bag ({itemCount})</h2>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-1 text-white hover:text-[#C5A05A] transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="bg-[#FFF9F0] p-3.5 border-b border-[#C5A05A]/30 text-xs">
          {summary.amountNeededForFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[#641B32] font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-[#C5A05A]" />
                  <span>Add {formatPrice(summary.amountNeededForFreeShipping)} more for FREE All-India Shipping!</span>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C5A05A] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <Sparkles className="w-4 h-4 text-[#C5A05A]" />
              <span>You unlocked FREE Express Delivery across India!</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="py-4 flex space-x-3.5 first:pt-0">
                {/* Thumbnail */}
                <Link
                  to={`/product/${item.product.slug}`}
                  onClick={closeCartDrawer}
                  className="w-18 h-24 rounded-xs overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 block"
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
                        className="text-xs font-semibold text-[#292323] hover:text-[#641B32] line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 ml-1 cursor-pointer transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      SKU: {item.product.sku}
                    </p>
                    {item.variant && (
                      <p className="text-[11px] text-[#641B32] font-medium flex items-center gap-1.5 mt-0.5">
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
                    <div className="flex items-center border border-neutral-300 rounded bg-[#FFF9F0]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 cursor-pointer"
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
              <div className="w-14 h-14 rounded-full bg-[#FFF9F0] border border-[#C5A05A]/40 flex items-center justify-center text-[#641B32]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#641B32]">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-[#594E4E] max-w-xs">
                Explore our handwoven Yeola Paithani and Banarasi bridal collections to adorn your wardrobe.
              </p>
              <Link to="/shop" onClick={closeCartDrawer}>
                <Button variant="primary" size="sm" className="mt-2">
                  Browse Sarees
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer / Summary Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-[#FFF9F0]/50 space-y-4">
            {/* Coupon Section */}
            <div>
              {summary.coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      Code <strong>{summary.coupon.code}</strong> applied ({formatPrice(summary.discountAmount)} off)
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
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. FIRST10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-neutral-300 rounded px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#641B32]"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={isApplying}
                      className="text-xs font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#292323] border-t border-neutral-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- {formatPrice(summary.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>All-India Shipping</span>
                <span>
                  {summary.shippingAmount === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    formatPrice(summary.shippingAmount)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Taxes & GST (Included)</span>
                <span>{formatPrice(summary.gstAmount)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#641B32] pt-2 border-t border-neutral-200">
                <span>Total Amount</span>
                <span>{formatPrice(summary.totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              onClick={handleCheckout}
              variant="primary"
              className="w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
