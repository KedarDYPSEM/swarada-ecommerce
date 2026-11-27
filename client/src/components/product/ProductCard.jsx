import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, MessageCircle } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import ProductQuickView from './ProductQuickView';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();

  const discount = calculateDiscount(product.mrp, product.sellingPrice);
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    } catch (err) {
      // Cart context handles error display
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const whatsappMessage = `Hello Swarada Saree Center! I am interested in: ${product.name} (SKU: ${product.sku}). Please let me know if it is available.`;
  const whatsappUrl = `https://wa.me/919325585754?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <div className="group relative bg-white border border-amber-900/10 hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5">
        {/* Product Image Area */}
        <div className="relative aspect-3/4 overflow-hidden bg-neutral-100">
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={primaryImage}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 ${
                isOutOfStock ? 'grayscale contrast-125 opacity-70' : ''
              }`}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10 pointer-events-none">
            {isOutOfStock ? (
              <span className="bg-[#140F11]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Sold Out</span>
              </span>
            ) : (
              <>
                {product.isNewArrival && (
                  <span className="bg-gradient-to-r from-[#641B32] to-[#851C3B] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    New Arrival
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-gradient-to-r from-[#D4AF37] to-[#B89230] text-[#1E1719] text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Best Seller
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    {discount}% Off
                  </span>
                )}
              </>
            )}
          </div>

          {/* SKU Pill */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="bg-[#1E1719]/80 backdrop-blur-md text-[#FFFDF9] text-[10px] font-mono px-2 py-0.5 rounded-md tracking-wider border border-white/10">
              SKU: {product.sku}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-3 right-3 z-10 w-8.5 h-8.5 rounded-full bg-white/90 hover:bg-white text-[#1E1719] hover:text-rose-600 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 cursor-pointer backdrop-blur-xs"
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isWishlisted ? 'fill-rose-600 text-rose-600 scale-110' : 'stroke-current'
              }`}
            />
          </button>

          {/* Quick Action Overlay (Desktop) */}
          <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
            <button
              onClick={handleQuickView}
              className="flex-1 bg-white/95 hover:bg-white text-[#1E1719] hover:text-[#641B32] py-2 px-3 rounded-xl text-xs font-semibold shadow-lg flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer backdrop-blur-md border border-neutral-200/60"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Quick View</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-semibold shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Product Content Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#D4AF37] uppercase tracking-wider font-semibold mb-1 font-royal">
              <span>{product.fabric || 'Pure Silk Handloom'}</span>
              {product.colour && <span className="text-neutral-400 font-normal font-sans">{product.colour}</span>}
            </div>

            <Link to={`/product/${product.slug}`} className="block group-hover:text-[#641B32] transition-colors">
              <h3 className="text-sm font-semibold text-[#1E1719] line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold text-[#641B32]">
                  {formatPrice(product.sellingPrice)}
                </span>
                {product.mrp > product.sellingPrice && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
              className={`p-2.5 rounded-full transition-all duration-300 shadow-xs ${
                isOutOfStock
                  ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
                  : addedToCart
                  ? 'bg-emerald-600 text-white scale-105 shadow-md'
                  : 'bg-[#FAF7F2] text-[#641B32] border border-[#D4AF37]/50 hover:bg-[#641B32] hover:text-white hover:border-[#641B32] hover:scale-105 cursor-pointer'
              }`}
              title={isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
