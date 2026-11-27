import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Lock, CreditCard, Banknote, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import orderService from '../services/orderService';

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Full name is required for delivery recipient'),
  shippingPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)'),
  shippingEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  shippingAddressLine1: z.string().min(5, 'Flat / House No. & Building/Society is compulsory (min 5 characters)'),
  shippingAddressLine2: z.string().min(3, 'Area / Colony / Locality is compulsory for courier shipping labels'),
  shippingLandmark: z.string().optional(),
  shippingCity: z.string().min(2, 'City is compulsory'),
  shippingState: z.string().min(2, 'State is compulsory'),
  shippingPincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian pincode'),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  notes: z.string().optional(),
});

export const Checkout = () => {
  const { items, summary, couponCode, clearLocalCart } = useCart();
  const { user, isAuthenticated, setAuthenticatedUser } = useAuth();
  const { settings } = useSettings();
  const [serverError, setServerError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const navigate = useNavigate();

  const isCodAllowed = settings?.codEnabled !== false;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: user?.profile?.displayName || '',
      shippingPhone: user?.phone?.replace('+91', '') || '',
      shippingEmail: user?.email || '',
      shippingAddressLine1: '',
      shippingAddressLine2: '',
      shippingLandmark: '',
      shippingCity: '',
      shippingState: '',
      shippingPincode: '',
      paymentMethod: 'RAZORPAY',
      notes: '',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  // If COD is disabled in platform settings, ensure checkout defaults to RAZORPAY
  useEffect(() => {
    if (!isCodAllowed && selectedPaymentMethod === 'COD') {
      setValue('paymentMethod', 'RAZORPAY');
    }
  }, [isCodAllowed, selectedPaymentMethod, setValue]);

  // Load saved customer addresses and profile if logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.email) {
        setValue('shippingEmail', user.email);
      }
      if (user?.profile?.displayName || user?.profile?.firstName) {
        setValue('shippingName', user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName || ''}`.trim());
      }
      if (user?.phone) {
        setValue('shippingPhone', user.phone.replace('+91', '').trim());
      }

      const fetchAddresses = async () => {
        try {
          const addrs = await orderService.getAddresses();
          if (addrs && addrs.length > 0) {
            setSavedAddresses(addrs);
            const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
            if (defaultAddr) {
              setValue('shippingName', defaultAddr.fullName);
              setValue('shippingPhone', defaultAddr.phone);
              setValue('shippingAddressLine1', defaultAddr.addressLine1);
              setValue('shippingAddressLine2', defaultAddr.addressLine2 || '');
              setValue('shippingLandmark', defaultAddr.landmark || '');
              setValue('shippingCity', defaultAddr.city);
              setValue('shippingState', defaultAddr.state);
              setValue('shippingPincode', defaultAddr.pincode);
            }
          }
        } catch (e) {
          // Ignore address fetch error
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated, user, setValue]);

  const selectSavedAddress = (addr) => {
    setValue('shippingName', addr.fullName);
    setValue('shippingPhone', addr.phone);
    setValue('shippingAddressLine1', addr.addressLine1);
    setValue('shippingAddressLine2', addr.addressLine2 || '');
    setValue('shippingLandmark', addr.landmark || '');
    setValue('shippingCity', addr.city);
    setValue('shippingState', addr.state);
    setValue('shippingPincode', addr.pincode);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (formData) => {
    if (items.length === 0) {
      setServerError('Your cart is empty. Please add sarees before checking out.');
      return;
    }

    setServerError('');
    try {
      const { paymentMethod, notes, ...shippingDetails } = formData;

      const responseData = await orderService.createOrder({
        shippingDetails,
        paymentMethod,
        couponCode: couponCode || null,
        notes: notes || null,
      });

      const order = responseData.order || responseData;

      // Automatically authenticate the user session if an account was created or linked
      if (responseData.user && setAuthenticatedUser) {
        setAuthenticatedUser(responseData.user);
      }

      // Handle Online Razorpay Payment
      if (paymentMethod === 'RAZORPAY') {
        const paymentSession = await orderService.initiatePayment(order.id);
        const isSimulation = Boolean(
          paymentSession.isMock ||
            !paymentSession.keyId ||
            paymentSession.keyId.includes('placeholder') ||
            paymentSession.keyId === 'rzp_test_swarada2026' ||
            paymentSession.razorpayOrderId?.startsWith('order_mock_')
        );

        const scriptLoaded = !isSimulation ? await loadRazorpayScript() : false;

        // If real Razorpay keys are configured and script is available
        if (!isSimulation && scriptLoaded && window.Razorpay) {
          const logoUrl = settings?.logoUrl
            ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${window.location.origin}${settings.logoUrl}`)
            : `${window.location.origin}/favicon.svg`;

          const options = {
            key: paymentSession.keyId,
            amount: paymentSession.amountPaise,
            currency: 'INR',
            name: settings?.storeName || 'Swarada Saree Center',
            description: `Order ${order.orderNumber} - Kolhapur Ethnic Sarees`,
            image: logoUrl,
            order_id: paymentSession.razorpayOrderId,
            handler: async (response) => {
              try {
                await orderService.verifyPayment({
                  orderId: order.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                clearLocalCart();
                navigate(`/order-success?order=${order.orderNumber}`);
              } catch (verifyErr) {
                setServerError('Payment verification failed. Please check customer portal.');
              }
            },
            prefill: {
              name: shippingDetails.shippingName,
              email: shippingDetails.shippingEmail || '',
              contact: shippingDetails.shippingPhone,
            },
            theme: {
              color: '#641B32',
            },
            modal: {
              ondismiss: async () => {
                try {
                  await orderService.cancelPayment(order.id, 'Payment window closed / cancelled by customer');
                } catch (e) {
                  console.warn('Payment cancel sync note:', e.message);
                }
                setServerError('Payment was cancelled. The item has been restored to available stock.');
              },
            },
          };
          const rzpInstance = new window.Razorpay(options);
          rzpInstance.on('payment.failed', async function (resp) {
            try {
              await orderService.cancelPayment(order.id, resp.error?.description || 'Razorpay payment failed');
            } catch (e) {
              console.warn('Payment failure cancel note:', e.message);
            }
            setServerError(
              resp.error?.description ||
                resp.error?.reason ||
                'Payment was not completed. Stock has been restored. You can try again or choose Cash on Delivery (COD).'
            );
          });
          rzpInstance.open();
          return;
        } else {
          // Seamless sandbox / test payment simulation (prevents Razorpay CDN rejection on fake keys)
          try {
            await orderService.verifyPayment({
              orderId: order.id,
              razorpayOrderId: paymentSession.razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'mock_valid_signature',
            });
          } catch (e) {
            console.warn('Sandbox verification note:', e.message);
          }
          clearLocalCart();
          navigate(`/order-success?order=${order.orderNumber}`);
          return;
        }
      }

      // COD or Other Payment
      clearLocalCart();
      navigate(`/order-success?order=${order.orderNumber}`);
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Failed to place order.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 bg-[#FFF9F0] min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-heading font-bold text-[#641B32]">Your Cart is Empty</h2>
        <p className="text-xs text-[#594E4E] mt-2 mb-6">Please select sarees before completing checkout.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-1">
            <span>✦</span>
            <span>Heirloom Concierge</span>
            <span>✦</span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-[#140F11] tracking-tight">
            Complete Your Saree Order
          </h1>
          <p className="text-xs sm:text-sm text-[#594E4E] mt-1.5 max-w-lg mx-auto">
            Free all-India express delivery & authentic silk mark heirloom gift packaging from Kolhapur.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl max-w-3xl mx-auto shadow-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Delivery & Payment Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Saved Address Quick Selector (If logged in) */}
              {savedAddresses.length > 0 && (
                <div className="bg-white/95 backdrop-blur-md p-6 border border-[#D4AF37]/30 rounded-3xl shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center space-x-1.5">
                    <span>❖</span>
                    <span>Select From Saved Addresses</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => selectSavedAddress(addr)}
                        className="p-3.5 border border-[#D4AF37]/25 hover:border-[#641B32] rounded-2xl text-xs cursor-pointer transition-all bg-amber-50/20 hover:bg-amber-50/50 shadow-2xs"
                      >
                        <p className="font-bold text-[#140F11]">{addr.fullName} ({addr.label})</p>
                        <p className="text-neutral-500 truncate mt-0.5">{addr.addressLine1}, {addr.city}</p>
                        <p className="text-neutral-400 font-mono text-[11px] mt-0.5">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address Form */}
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 border border-[#D4AF37]/30 rounded-3xl shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-100/70 pb-3.5 gap-2">
                  <h2 className="text-base font-heading font-bold text-[#641B32] flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span>1. Delivery Destination</span>
                  </h2>
                  {!isAuthenticated && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Instant order tracking account included
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      Full Name *
                    </label>
                    <Input
                      placeholder="e.g. Ananya Joshi"
                      error={errors.shippingName?.message}
                      {...register('shippingName')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      Mobile Number *
                    </label>
                    <Input
                      placeholder="e.g. 9822012345"
                      error={errors.shippingPhone?.message}
                      {...register('shippingPhone')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                    Email Address <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. ananya@example.com"
                    error={errors.shippingEmail?.message}
                    {...register('shippingEmail')}
                    className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Optional: If provided, your order invoice and tracking updates will be sent to this email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                    Flat / House No., Building / Society Name *
                  </label>
                  <Input
                    placeholder="e.g. Flat 402, Shree Mahalaxmi Towers"
                    error={errors.shippingAddressLine1?.message}
                    {...register('shippingAddressLine1')}
                    className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      Street / Area / Locality *
                    </label>
                    <Input
                      placeholder="e.g. 5th Lane Rajarampuri, Main Road"
                      error={errors.shippingAddressLine2?.message}
                      {...register('shippingAddressLine2')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      Landmark (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Near Mahalaxmi Temple, Opp. Bank"
                      {...register('shippingLandmark')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      City *
                    </label>
                    <Input
                      placeholder="e.g. Kolhapur"
                      error={errors.shippingCity?.message}
                      {...register('shippingCity')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      State *
                    </label>
                    <Input
                      placeholder="e.g. Maharashtra"
                      error={errors.shippingState?.message}
                      {...register('shippingState')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#140F11] mb-1.5">
                      Pincode *
                    </label>
                    <Input
                      placeholder="e.g. 416008"
                      error={errors.shippingPincode?.message}
                      {...register('shippingPincode')}
                      className="rounded-xl border-[#D4AF37]/30 focus:border-[#641B32]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 border border-[#D4AF37]/30 rounded-3xl shadow-sm space-y-4">
                <h2 className="text-base font-heading font-bold text-[#641B32] border-b border-amber-100/70 pb-3.5 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  <span>2. Payment Option</span>
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-start space-x-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedPaymentMethod === 'RAZORPAY'
                        ? 'border-[#641B32] bg-gradient-to-r from-amber-50/60 to-white shadow-xs ring-1 ring-[#D4AF37]/40'
                        : 'border-neutral-200 hover:bg-neutral-50/60'
                    }`}
                  >
                    <input
                      type="radio"
                      value="RAZORPAY"
                      {...register('paymentMethod')}
                      className="mt-1 accent-[#641B32]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#140F11]">
                          Online Payment via Razorpay
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, Netbanking & Wallets.
                      </p>
                    </div>
                  </label>

                  {isCodAllowed && (
                    <label
                      className={`flex items-start space-x-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${
                        selectedPaymentMethod === 'COD'
                          ? 'border-[#641B32] bg-gradient-to-r from-amber-50/60 to-white shadow-xs ring-1 ring-[#D4AF37]/40'
                          : 'border-neutral-200 hover:bg-neutral-50/60'
                      }`}
                    >
                      <input
                        type="radio"
                        value="COD"
                        {...register('paymentMethod')}
                        className="mt-1 accent-[#641B32]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Banknote className="w-4 h-4 text-[#641B32]" />
                          <span className="text-xs font-bold text-[#140F11]">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Pay cash directly to our delivery courier upon parcel arrival.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 border border-[#D4AF37]/35 rounded-3xl shadow-lg space-y-5 sticky top-28">
                <div className="flex items-center justify-between border-b border-amber-100/70 pb-3.5">
                  <h3 className="text-base font-heading font-bold text-[#641B32]">
                    Order Summary
                  </h3>
                  <span className="text-xs font-bold text-[#D4AF37] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {items.length} {items.length === 1 ? 'Saree' : 'Sarees'}
                  </span>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-amber-100/50 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center space-x-3">
                      <img
                        src={
                          item.product.primaryImage ||
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.product.name}
                        className="w-12 h-16 object-cover rounded-xl border border-[#D4AF37]/20 shrink-0 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-[#140F11] truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-[11px] text-[#641B32] font-semibold flex items-center gap-1 mt-0.5">
                            {item.variant.colorCode && (
                              <span
                                className="w-2 h-2 rounded-full inline-block border border-black/20"
                                style={{ backgroundColor: item.variant.colorCode }}
                              />
                            )}
                            <span>Color: {item.variant.variantValue}</span>
                          </p>
                        )}
                        <p className="text-neutral-500 mt-0.5">Qty: {item.quantity} • SKU: {item.product.sku}</p>
                        <p className="font-bold text-[#641B32] mt-0.5">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs border-t border-amber-100/70 pt-3.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                  </div>

                  {summary.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({summary.coupon?.code})</span>
                      <span>- {formatPrice(summary.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>Express All-India Shipping</span>
                    <span>
                      {summary.shippingAmount === 0 ? (
                        <strong className="text-emerald-700 font-bold">FREE</strong>
                      ) : (
                        formatPrice(summary.shippingAmount)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Applicable GST (Included)</span>
                    <span>{formatPrice(summary.gstAmount)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-[#641B32] pt-3.5 border-t border-amber-100/70">
                    <span>Total Amount</span>
                    <span className="text-xl">{formatPrice(summary.totalAmount)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full py-4 text-sm font-bold shadow-xl flex items-center justify-center space-x-2 rounded-full gold-shimmer-btn"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {selectedPaymentMethod === 'COD'
                      ? 'Place Order (Cash on Delivery)'
                      : `Pay ${formatPrice(summary.totalAmount)} via Razorpay`}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="pt-2 text-center text-[11px] text-[#594E4E] space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-bit SSL encrypted • 100% Authentic Handloom</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">By placing your order, you agree to Swarada Saree Center terms.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
