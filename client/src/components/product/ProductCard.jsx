import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, MessageCircle } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = calculateDiscount(product.mrp, product.sellingPrice);
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const secondaryImage =
    product.images?.[1]?.url || primaryImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const whatsappMessage = `Hello Swarada Saree Center! I am interested in: ${product.name} (SKU: ${product.sku}). Please let me know if it is available.`;
  const whatsappUrl = `https://wa.me/919822012345?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="group relative bg-white border border-[#C5A05A]/20 rounded-xs overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:border-[#C5A05A]/50">
      {/* Product Image Area */}
      <div className="relative aspect-3/4 overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1.5 z-10">
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
          {discount > 0 && <Badge variant="discount">{discount}% Off</Badge>}
        </div>

        {/* SKU Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="bg-[#292323]/80 backdrop-blur-xs text-[#FFF9F0] text-[10px] font-mono px-2 py-0.5 rounded tracking-wider">
            SKU: {product.sku}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-[#292323] hover:text-red-600 flex items-center justify-center transition-all duration-200 shadow-sm"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-red-600 text-red-600' : 'stroke-current'
            }`}
          />
        </button>

        {/* Quick Action Overlay (Desktop) */}
        <div className="absolute inset-x-2 bottom-10 hidden sm:flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Link
            to={`/product/${product.slug}`}
            className="bg-white/95 text-[#292323] hover:text-[#641B32] px-3 py-2 rounded-xs text-xs font-semibold shadow-md flex items-center space-x-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xs text-xs font-semibold shadow-md flex items-center space-x-1 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Inquire</span>
          </a>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Fabric line */}
          <div className="flex items-center justify-between text-[11px] text-[#C5A05A] uppercase tracking-wider font-semibold mb-1">
            <span>{product.fabric || 'Pure Handloom'}</span>
            {product.colour && <span className="text-neutral-400 font-normal">{product.colour}</span>}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-[#641B32] transition-colors">
            <h3 className="text-sm font-semibold text-[#292323] line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-bold text-[#641B32]">
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
            aria-label="Add to cart"
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
              addedToCart
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FFF9F0] text-[#641B32] border border-[#C5A05A] hover:bg-[#641B32] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
