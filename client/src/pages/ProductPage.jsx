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
  Video,
  Play,
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
  const [isVideoActive, setIsVideoActive] = useState(false);
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
          setIsVideoActive(false);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 bg-[#FAF7F2]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#641B32] rounded-full animate-spin mb-4" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-serif font-bold text-[#641B32]">
            ✦
          </div>
        </div>
        <p className="font-heading text-xl font-bold text-[#641B32] tracking-wide mt-2">Unveiling Masterpiece...</p>
        <p className="text-xs text-[#8A7A70] mt-1 font-sans">Connecting to Swarada Royal Handloom Vault</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 text-center px-4 bg-[#FAF7F2]">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#641B32] text-2xl mb-4">
          ❖
        </div>
        <h2 className="text-3xl font-heading font-bold text-[#641B32]">Creation Not Found</h2>
        <p className="text-xs sm:text-sm text-[#7D7069] mt-2 mb-6 max-w-md">
          This handcrafted saree piece may have been acquired by another connoisseur or moved to our private archives.
        </p>
        <Link to="/shop">
          <Button variant="primary" className="rounded-full shadow-lg">Return to Royal Catalog</Button>
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
    <div className="py-8 sm:py-14 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center space-x-2 flex-wrap">
          <Link to="/" className="hover:text-[#641B32] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
          <Link to="/shop" className="hover:text-[#641B32] transition-colors">Royal Catalog</Link>
          <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
          {product.categories?.[0] && (
            <>
              <Link
                to={`/shop?category=${product.categories[0].category.slug}`}
                className="hover:text-[#641B32] transition-colors"
              >
                {product.categories[0].category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
            </>
          )}
          <span className="text-[#140F11] font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white/95 backdrop-blur-md p-6 sm:p-10 border border-[#D4AF37]/30 rounded-3xl shadow-xl shadow-amber-950/5 relative overflow-hidden">
          {/* Subtle decorative background ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#D4AF37]/10 to-transparent blur-3xl pointer-events-none" />

          {/* Left Column: Image & Video Gallery with Zoom */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className={`aspect-3/4 overflow-hidden rounded-2xl bg-[#F7F2E7] border border-[#D4AF37]/25 relative shadow-md ${
                isVideoActive ? 'bg-black' : 'cursor-zoom-in group'
              }`}
              onMouseEnter={() => !isVideoActive && setIsZoomed(true)}
              onMouseLeave={() => !isVideoActive && setIsZoomed(false)}
            >
              {isVideoActive && product?.videoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={activeImageOverride || images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
                    isZoomed ? 'scale-125' : 'scale-100'
                  }`}
                />
              )}

              {/* Floating badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-col space-y-2 pointer-events-none z-10">
                <Badge variant="gold" className="shadow-md">✦ Silk Mark Certified</Badge>
                {discount > 0 && <Badge variant="discount" className="shadow-md">{discount}% OFF</Badge>}
              </div>

              {isVariantOutOfStock && (
                <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-rose-700 to-rose-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10 flex items-center gap-1.5 border border-rose-400/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Out of Stock
                </div>
              )}

              {/* Video toggle pill on main stage if product has video */}
              {product?.videoUrl && (
                <button
                  type="button"
                  onClick={() => setIsVideoActive(!isVideoActive)}
                  className={`absolute bottom-3.5 left-3.5 z-20 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer ${
                    isVideoActive
                      ? 'bg-[#641B32] text-white border border-[#D4AF37] ring-2 ring-[#D4AF37]/50'
                      : 'bg-black/75 hover:bg-black/90 text-[#F3E2B8] border border-white/20 hover:scale-105'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isVideoActive ? 'View High-Res Photos' : '🎥 Drape Video Preview'}</span>
                </button>
              )}

              {!isVideoActive && (
                <div className="absolute bottom-3.5 right-3.5 bg-black/60 text-white p-2 rounded-full backdrop-blur-md pointer-events-none transition-transform duration-300 group-hover:scale-110">
                  <ZoomIn className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Thumbnail Selector (Images + Video) */}
            {(images.length > 1 || product?.videoUrl) && (
              <div className="flex space-x-3 overflow-x-auto pb-2 pt-1">
                {product?.videoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsVideoActive(true);
                      setActiveImageOverride(null);
                    }}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shrink-0 relative bg-neutral-900 flex flex-col items-center justify-center p-1 text-center ${
                      isVideoActive
                        ? 'border-[#641B32] ring-2 ring-[#D4AF37]/80 shadow-md scale-105'
                        : 'border-neutral-200 opacity-80 hover:opacity-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    {images[0] && (
                      <img
                        src={images[0]}
                        alt="Video poster"
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#641B32]/90 border border-[#D4AF37] flex items-center justify-center text-white shadow-xs">
                        <Play className="w-3.5 h-3.5 ml-0.5 text-[#F3E2B8]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#FFFDF9] mt-1 tracking-wider uppercase drop-shadow-sm">
                        Drape Video
                      </span>
                    </div>
                  </button>
                )}

                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setActiveImageOverride(null);
                      setIsVideoActive(false);
                    }}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shrink-0 ${
                      !isVideoActive && selectedImage === idx && !activeImageOverride
                        ? 'border-[#641B32] ring-2 ring-[#D4AF37]/60 shadow-md scale-105'
                        : 'border-neutral-200 opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
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
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="text-xs font-mono bg-[#641B32]/10 text-[#641B32] border border-[#641B32]/20 px-3 py-1 rounded-full font-semibold tracking-wider">
                  SKU: {product.sku}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center space-x-1.5 ${
                    isVariantOutOfStock
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-200 shadow-xs'
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

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#140F11] leading-tight">
                {product.name}
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-[#594E4E] leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Pricing Box */}
            <div className="p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EB] to-[#F5EEDB] border border-[#D4AF37]/40 rounded-2xl shadow-xs flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#641B32] tracking-tight">
                {formatPrice(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-sm sm:text-base text-neutral-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
              {isVariantOutOfStock ? (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-300 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                  Out of Stock
                </span>
              ) : discount > 0 ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                  Save {formatPrice(product.mrp - product.sellingPrice)} ({discount}%)
                </span>
              ) : null}
            </div>

            {/* Saree Attributes Specification Table */}
            <div className="border border-[#D4AF37]/20 rounded-2xl overflow-hidden divide-y divide-amber-100/70 bg-[#FAF7F2]/40 text-xs">
              {product.fabric && (
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">Fabric</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{product.fabric}</span>
                </div>
              )}
              {(selectedVariant?.variantValue || product.colour) && (
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">Colour Palette</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{selectedVariant?.variantValue || product.colour}</span>
                </div>
              )}
              {product.sareeLength && (
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">Saree Length</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{product.sareeLength}</span>
                </div>
              )}
              {product.blouseDetails && (
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">Blouse Details</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{product.blouseDetails}</span>
                </div>
              )}
              {product.washingInstructions && (
                <div className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">Care Instructions</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{product.washingInstructions}</span>
                </div>
              )}
              {product.attributes?.map((attr) => (
                <div key={attr.id} className="grid grid-cols-3 p-3">
                  <span className="font-semibold text-neutral-600">{attr.name}</span>
                  <span className="col-span-2 text-[#140F11] font-medium">{attr.value}</span>
                </div>
              ))}
            </div>

            {/* Color Variants Visual Thumbnail Grid */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-[#D4AF37]/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    COLOR:{' '}
                    <span className="text-[#641B32] font-extrabold">
                      {selectedVariant?.variantValue || 'Select a shade'}
                    </span>
                  </div>
                  {selectedVariant && (
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isVariantOutOfStock
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      {isVariantOutOfStock ? 'Out of Stock' : `${selectedVariant.stockQuantity} in stock`}
                    </span>
                  )}
                </div>

                {/* Responsive visual thumbnail grid */}
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
                          setIsVideoActive(false);
                          if (variant.imageUrl) {
                            setActiveImageOverride(variant.imageUrl);
                          }
                        }}
                        className="group flex flex-col items-center cursor-pointer text-center focus:outline-none"
                        title={`${variant.variantValue} (${isOutOfStock ? 'Out of Stock' : `${variant.stockQuantity} in stock`})`}
                      >
                        <div
                          className={`w-full aspect-square bg-[#F7F2E7] rounded-xl overflow-hidden relative transition-all duration-300 ${
                            isSelected
                              ? 'border-2 border-[#641B32] ring-2 ring-[#D4AF37] ring-offset-2 shadow-md scale-105'
                              : 'border border-neutral-200 hover:border-[#D4AF37] hover:scale-102'
                          }`}
                        >
                          <img
                            src={variantThumb}
                            alt={variant.variantValue}
                            className={`w-full h-full object-cover transition-all duration-300 ${
                              isOutOfStock
                                ? 'grayscale contrast-125 brightness-95 opacity-80'
                                : 'group-hover:scale-105'
                            }`}
                          />
                        </div>

                        <span
                          className={`text-[11px] sm:text-xs text-center mt-1.5 truncate max-w-full tracking-tight transition-colors ${
                            isSelected
                              ? 'font-bold text-[#641B32]'
                              : isOutOfStock
                              ? 'text-neutral-400 font-normal'
                              : 'text-neutral-700 font-medium group-hover:text-[#641B32]'
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
                <div className={`flex items-center border border-neutral-300 rounded-full bg-white shadow-xs overflow-hidden ${isVariantOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button
                    onClick={() => {
                      if (quantity > 1) {
                        setQuantity(quantity - 1);
                        setActionError('');
                      }
                    }}
                    disabled={isVariantOutOfStock}
                    className="px-3.5 py-1 text-sm hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-[#140F11]">{quantity}</span>
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
                    className="px-3.5 py-1 text-sm hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {actionError}
                </div>
              )}

              {isVariantOutOfStock && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-2xl space-y-1">
                  <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <span>✕</span> This saree / shade ({selectedVariant?.variantValue || 'Selected'}) is currently Out of Stock.
                  </div>
                  <div className="text-[11px] text-rose-600">
                    Please choose another available shade above, or click the WhatsApp button below to inquire about restock or custom handloom weaving.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  variant={isVariantOutOfStock ? 'outline' : 'primary'}
                  disabled={isVariantOutOfStock || isAddingToCart}
                  isLoading={isAddingToCart}
                  className={`flex-1 py-4 text-sm flex items-center justify-center space-x-2 font-bold rounded-full shadow-lg transition-transform active:scale-95 ${
                    isVariantOutOfStock ? 'bg-neutral-200 text-neutral-500 border border-neutral-300 cursor-not-allowed opacity-90' : ''
                  }`}
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
                    className="flex-1 py-4 text-sm font-bold text-[#140F11] rounded-full shadow-lg"
                  >
                    Buy Now
                  </Button>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md shadow-emerald-900/20"
                  aria-label="Inquire via WhatsApp"
                  title="Video Call & Inquiry via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                  className="p-3.5 border border-neutral-300 rounded-full hover:border-rose-400 hover:bg-rose-50/50 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 shadow-xs"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted ? 'fill-red-600 text-red-600' : 'text-neutral-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-[#D4AF37]/25 text-center text-[11px] text-[#594E4E]">
              <div className="p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/20 shadow-2xs hover:-translate-y-0.5 transition-all">
                <ShieldCheck className="w-5 h-5 text-[#C5A05A] mx-auto mb-1.5" />
                <span className="font-semibold block text-[#140F11]">100% Authentic</span>
                <span className="text-[10px] text-neutral-400">Yeola Pure Silk</span>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/20 shadow-2xs hover:-translate-y-0.5 transition-all">
                <Truck className="w-5 h-5 text-[#C5A05A] mx-auto mb-1.5" />
                <span className="font-semibold block text-[#140F11]">Free Express</span>
                <span className="text-[10px] text-neutral-400">All-India Delivery</span>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/20 shadow-2xs hover:-translate-y-0.5 transition-all">
                <RotateCcw className="w-5 h-5 text-[#C5A05A] mx-auto mb-1.5" />
                <span className="font-semibold block text-[#140F11]">7-Day Return</span>
                <span className="text-[10px] text-neutral-400">Keepsake Guarantee</span>
              </div>
            </div>

            {/* Pincode & Delivery Time Estimator */}
            <div className="pt-4 border-t border-[#D4AF37]/20">
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
                  className="w-full max-w-xs px-4 py-2 border border-neutral-300 rounded-full text-xs focus:outline-none focus:border-[#641B32] focus:ring-1 focus:ring-[#641B32] shadow-xs"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={checkingPincode || pincode.length !== 6}
                  className="text-xs border-[#641B32] text-[#641B32] rounded-full hover:bg-[#641B32] hover:text-white px-5"
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </Button>
              </form>

              {pincodeResult && (
                <div
                  className={`mt-3 p-3 rounded-2xl text-xs ${
                    pincodeResult.serviceable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pincodeResult.serviceable ? (
                    <div>
                      <div className="font-semibold flex items-center space-x-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
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
        <div className="mt-14 bg-white/95 backdrop-blur-md p-6 sm:p-10 border border-[#D4AF37]/30 rounded-3xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-5 gap-3">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
                ✦ Connoisseur Testimonials ✦
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#641B32] mt-0.5">
                Client Reviews & Handloom Feedback
              </h2>
            </div>
            <div className="flex items-center space-x-1 bg-amber-50/80 border border-amber-200/60 px-3.5 py-1.5 rounded-full">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
              ))}
              <span className="text-xs font-bold text-[#641B32] ml-2">5.0 Star Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#140F11]">Sneha M. (Pune)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-[#594E4E] leading-relaxed">
                "The zari shine and peacock pallu are even more magnificent in person! Perfectly packed in the signature Swarada keepsake box. Truly made my festival celebration memorable."
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#D4AF37]/25 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#140F11]">Radhika Patil (Mumbai)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-[#594E4E] leading-relaxed">
                "Ordered for my sister's wedding reception. Authentic Yeola Paithani certified with Silk Mark. Customer care assisted us on WhatsApp video call to choose the exact shade."
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
                ✦ Curated Handlooms ✦
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#641B32] mt-1">
                You May Also Admire
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2.5" />
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
