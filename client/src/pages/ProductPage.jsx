import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  Star,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { formatPrice, calculateDiscount } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageOverride, setActiveImageOverride] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  // Delivery Pincode Checker
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setCheckingPincode(true);
    try {
      const res = await api.get(`/shipping/serviceability?pincode=${pincode}`);
      setPincodeResult(res.data.data);
    } catch (err) {
      setPincodeResult({ serviceable: false, message: 'Unable to check delivery status.' });
    } finally {
      setCheckingPincode(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        if (isMounted && data) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          setSelectedImage(0);
          if (data.product.variants && data.product.variants.length > 0) {
            // Select first in-stock variant if available, otherwise first variant
            const firstInStock = data.product.variants.find((v) => (v.stockQuantity || 0) > 0);
            const initialVar = firstInStock || data.product.variants[0];
            setSelectedVariant(initialVar);
            if (initialVar?.imageUrl) {
              setActiveImageOverride(initialVar.imageUrl);
            }
          }
        }
      } catch (err) {
        // Fallback or not found
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C5A05A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-heading text-lg text-[#641B32]">Opening Handloom Vault...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 text-center px-4">
        <h2 className="text-3xl font-heading font-bold text-[#641B32]">Saree Not Found</h2>
        <p className="text-xs text-[#594E4E] mt-2 mb-6">The requested saree piece may have been purchased or relocated.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Saree Catalog</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'];

  const discount = calculateDiscount(product.mrp, product.sellingPrice);
  const isProductOutOfStock = (product.stockQuantity || 0) <= 0;
  const isVariantOutOfStock =
    isProductOutOfStock || (selectedVariant && (selectedVariant.stockQuantity || 0) <= 0);

  const whatsappMessage = `Hello Swarada Saree Center! I am inquiring about: ${product.name} (SKU: ${product.sku})${selectedVariant ? ` in color ${selectedVariant.variantValue}` : ''}. Please let me know if it is available for video call consultation.`;
  const whatsappUrl = `https://wa.me/919822012345?text=${encodeURIComponent(whatsappMessage)}`;

  const handleAddToCart = async () => {
    setActionError('');
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e) {
      setActionError(e.message || 'Could not add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setActionError('');
    setIsBuyingNow(true);
    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      navigate('/checkout');
    } catch (e) {
      setActionError(e.message || 'Could not proceed to checkout. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center space-x-2 flex-wrap">
          <Link to="/" className="hover:text-[#641B32]">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link to="/shop" className="hover:text-[#641B32]">Catalog</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          {product.categories?.[0] && (
            <>
              <Link
                to={`/shop?category=${product.categories[0].category.slug}`}
                className="hover:text-[#641B32]"
              >
                {product.categories[0].category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </>
          )}
          <span className="text-[#292323] font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 border border-[#C5A05A]/30 rounded-xs shadow-xs">
          {/* Left Column: Image Gallery with Zoom */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className="aspect-3/4 overflow-hidden rounded-xs bg-neutral-100 border border-neutral-200 relative cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={activeImageOverride || images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                  isZoomed ? 'scale-125' : 'scale-100'
                }`}
              />

              <div className="absolute top-3 left-3 flex flex-col space-y-1.5 pointer-events-none z-10">
                <Badge variant="gold">Silk Mark Certified</Badge>
                {discount > 0 && <Badge variant="discount">{discount}% Off</Badge>}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-xs pointer-events-none">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>

            {/* Thumbnail Selector */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setActiveImageOverride(null);
                    }}
                    className={`w-20 h-24 rounded-xs overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImage === idx && !activeImageOverride
                        ? 'border-[#641B32] shadow-sm scale-102'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono bg-[#641B32]/10 text-[#641B32] px-2.5 py-0.5 rounded font-semibold tracking-wider">
                  SKU: {product.sku}
                </span>

                <span
                  className={`text-xs font-semibold flex items-center space-x-1.5 ${
                    isVariantOutOfStock ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isVariantOutOfStock ? 'bg-rose-500' : 'bg-emerald-600 animate-pulse'
                    }`}
                  />
                  <span>
                    {isVariantOutOfStock
                      ? 'Out of Stock'
                      : selectedVariant
                      ? `In Stock (${selectedVariant.stockQuantity} Remaining)`
                      : `In Stock (${product.stockQuantity} Pieces Remaining)`}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#641B32] leading-snug">
                {product.name}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-[#594E4E] leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Pricing Box */}
            <div className="p-4 bg-[#FFF9F0] border border-[#C5A05A]/30 rounded-xs flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-[#641B32]">
                {formatPrice(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Save {formatPrice(product.mrp - product.sellingPrice)} ({discount}%)
                </span>
              )}
            </div>

            {/* Saree Attributes Specification Table */}
            <div className="border border-neutral-200 rounded-xs divide-y divide-neutral-100 text-xs">
              {product.fabric && (
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">Fabric</span>
                  <span className="col-span-2 text-[#292323]">{product.fabric}</span>
                </div>
              )}
              {product.colour && (
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">Colour Palette</span>
                  <span className="col-span-2 text-[#292323]">{product.colour}</span>
                </div>
              )}
              {product.sareeLength && (
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">Saree Length</span>
                  <span className="col-span-2 text-[#292323]">{product.sareeLength}</span>
                </div>
              )}
              {product.blouseDetails && (
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">Blouse Details</span>
                  <span className="col-span-2 text-[#292323]">{product.blouseDetails}</span>
                </div>
              )}
              {product.washingInstructions && (
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">Care Instructions</span>
                  <span className="col-span-2 text-[#292323]">{product.washingInstructions}</span>
                </div>
              )}
              {product.attributes?.map((attr) => (
                <div key={attr.id} className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-neutral-600">{attr.name}</span>
                  <span className="col-span-2 text-[#292323]">{attr.value}</span>
                </div>
              ))}
            </div>

            {/* Color Variants Visual Thumbnail Grid (Matching Reference) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    COLOR:{' '}
                    <span className="text-[#641B32] font-extrabold">
                      {selectedVariant?.variantValue || 'Select a shade'}
                    </span>
                  </div>
                  {selectedVariant && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isVariantOutOfStock
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      {isVariantOutOfStock ? 'Out of Stock' : `${selectedVariant.stockQuantity} in stock`}
                    </span>
                  )}
                </div>

                {/* 5-column responsive visual thumbnail grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = isProductOutOfStock || (variant.stockQuantity || 0) <= 0;
                    const variantThumb = variant.imageUrl || images[0];

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(variant);
                          if (variant.imageUrl) {
                            setActiveImageOverride(variant.imageUrl);
                          }
                        }}
                        className="group flex flex-col items-center cursor-pointer text-center focus:outline-none"
                        title={`${variant.variantValue} (${isOutOfStock ? 'Out of Stock' : `${variant.stockQuantity} in stock`})`}
                      >
                        <div
                          className={`w-full aspect-square bg-neutral-100 rounded-xs overflow-hidden relative transition-all duration-200 ${
                            isSelected
                              ? 'border-2 border-black ring-2 ring-black/15 shadow-md scale-102'
                              : 'border border-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          <img
                            src={variantThumb}
                            alt={variant.variantValue}
                            className={`w-full h-full object-cover transition-all duration-300 ${
                              isOutOfStock
                                ? 'grayscale contrast-125 brightness-95 opacity-60 group-hover:opacity-85'
                                : 'group-hover:scale-105'
                            }`}
                          />

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center p-0.5">
                              <span className="bg-neutral-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs leading-none shadow-xs">
                                Sold Out
                              </span>
                            </div>
                          )}

                          {isSelected && !isOutOfStock && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                          )}
                        </div>

                        <span
                          className={`text-[11px] sm:text-xs text-center mt-1.5 truncate max-w-full tracking-tight transition-colors ${
                            isSelected
                              ? 'font-bold text-black'
                              : isOutOfStock
                              ? 'text-neutral-400 font-normal line-through'
                              : 'text-neutral-700 font-medium group-hover:text-black'
                          }`}
                        >
                          {variant.variantValue}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector and Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#292323]">
                  Quantity
                </span>
                <div className={`flex items-center border border-neutral-300 rounded bg-white ${isVariantOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button
                    onClick={() => {
                      if (quantity > 1) {
                        setQuantity(quantity - 1);
                        setActionError('');
                      }
                    }}
                    disabled={isVariantOutOfStock}
                    className="px-3 py-1 text-sm hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
                      if (maxStock > 0 && quantity >= maxStock) {
                        setActionError(`Only ${maxStock} items available in this shade.`);
                        return;
                      }
                      setQuantity(quantity + 1);
                      setActionError('');
                    }}
                    disabled={isVariantOutOfStock}
                    className="px-3 py-1 text-sm hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {actionError}
                </div>
              )}

              {isVariantOutOfStock && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 text-amber-900 text-xs rounded-sm space-y-1">
                  <div className="font-semibold text-rose-700 flex items-center gap-1">
                    <span>⚠</span> This shade ({selectedVariant?.variantValue || 'Selected'}) is currently Sold Out.
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Please click another shade above or message us on WhatsApp below for custom handloom weaving.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant={isVariantOutOfStock ? 'outline' : 'primary'}
                  disabled={isVariantOutOfStock || isAddingToCart}
                  isLoading={isAddingToCart}
                  className="flex-1 py-3 text-sm flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isVariantOutOfStock
                      ? 'Out of Stock'
                      : added
                      ? 'Added to Cart ✓'
                      : 'Add to Cart'}
                  </span>
                </Button>

                {!isVariantOutOfStock && (
                  <Button
                    onClick={handleBuyNow}
                    variant="gold"
                    isLoading={isBuyingNow}
                    className="flex-1 py-3 text-sm font-semibold text-[#292323]"
                  >
                    Buy Now
                  </Button>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Inquire via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                  className="p-3 border border-neutral-300 rounded-sm hover:border-[#641B32] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-red-600 text-red-600' : 'text-neutral-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 text-center text-[11px] text-[#594E4E]">
              <div className="p-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>100% Authentic Yeola Silk</span>
              </div>
              <div className="p-2">
                <Truck className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>Free Express Shipping</span>
              </div>
              <div className="p-2">
                <RotateCcw className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>7-Day Return Guarantee</span>
              </div>
            </div>

            {/* Pincode & Delivery Time Estimator */}
            <div className="pt-4 border-t border-neutral-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block mb-2">
                Check Estimated Delivery to Your Pincode:
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit PIN code (e.g. 416002)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full max-w-xs px-3 py-1.5 border border-neutral-300 rounded text-xs focus:outline-none focus:border-[#641B32]"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={checkingPincode || pincode.length !== 6}
                  className="text-xs border-[#641B32] text-[#641B32]"
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </Button>
              </form>

              {pincodeResult && (
                <div
                  className={`mt-2 p-2.5 rounded text-xs ${
                    pincodeResult.serviceable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pincodeResult.serviceable ? (
                    <div>
                      <div className="font-semibold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Available for Express Delivery to {pincodeResult.pincode}!</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Delivered via {pincodeResult.courier} in {pincodeResult.estimatedDays}. Cash on Delivery eligible.
                      </div>
                    </div>
                  ) : (
                    <div>{pincodeResult.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-12 bg-white p-6 sm:p-10 border border-[#C5A05A]/30 rounded-xs shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#641B32]">
                Customer Reviews & Handloom Feedback
              </h2>
              <div className="flex items-center space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
                <span className="text-xs text-neutral-500 ml-2">5.0 Star Rating (Verified Purchases)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#FFF9F0]/60 border border-[#C5A05A]/20 rounded-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#292323]">Sneha M. (Pune)</span>
                <span className="text-[10px] text-neutral-400">Verified Buyer</span>
              </div>
              <div className="flex space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-[#594E4E]">
                "The zari shine and peacock pallu are even more magnificent in person! Perfectly packed in the signature Swarada keepsake box. Truly made my festival celebration memorable."
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
                You May Also Admire
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#641B32] mt-1">
                Related Handloom Sarees
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
