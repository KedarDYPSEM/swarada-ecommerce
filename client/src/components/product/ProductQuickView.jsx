import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Eye, Check, MessageCircle } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ProductQuickView = ({ product, isOpen, onClose }) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  const discount = calculateDiscount(product.mrp, product.sellingPrice);

  const whatsappMessage = `Hello Swarada Saree Center! I am inquiring about: ${product.name} (SKU: ${product.sku}). Is this piece currently available?`;
  const whatsappUrl = `https://wa.me/919325585754?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white border border-[#C5A05A]/40 w-full max-w-3xl rounded-xs shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-[#641B32] text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Image Preview */}
        <div className="md:w-1/2 p-6 bg-neutral-50 flex flex-col items-center justify-center">
          <div className="aspect-3/4 w-full max-h-[380px] rounded-xs overflow-hidden border border-neutral-200">
            <img
              src={images[selectedImg]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-2 mt-3 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-14 h-16 rounded border transition-all cursor-pointer overflow-hidden ${
                    selectedImg === i ? 'border-[#641B32] scale-105' : 'border-neutral-200 opacity-60'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-[#641B32]/10 text-[#641B32] font-mono px-2 py-0.5 rounded font-semibold">
                SKU: {product.sku}
              </span>
              {discount > 0 && <Badge variant="discount">{discount}% Off</Badge>}
            </div>

            <h3 className="font-heading text-xl font-bold text-[#641B32] leading-snug">
              {product.name}
            </h3>

            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-bold text-[#641B32]">
                {formatPrice(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            <p className="text-xs text-[#594E4E] line-clamp-3 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            <div className="text-xs space-y-1.5 border-t border-neutral-100 pt-3">
              {product.fabric && (
                <p><strong className="text-neutral-600">Fabric:</strong> {product.fabric}</p>
              )}
              {product.colour && (
                <p><strong className="text-neutral-600">Colour:</strong> {product.colour}</p>
              )}
              <p>
                <strong className="text-neutral-600">Availability:</strong>{' '}
                {(product.stockQuantity || 0) > 0 ? (
                  <span className="text-emerald-700 font-semibold">In Stock ({product.stockQuantity} Remaining)</span>
                ) : (
                  <span className="text-rose-600 font-semibold">Out of Stock</span>
                )}
              </p>
            </div>
          </div>

          <div className="pt-6 space-y-2.5">
            <Button
              onClick={() => {
                if ((product.stockQuantity || 0) <= 0) return;
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              disabled={(product.stockQuantity || 0) <= 0}
              variant={(product.stockQuantity || 0) <= 0 ? 'outline' : 'primary'}
              className="w-full py-2.5 text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              <span>
                {(product.stockQuantity || 0) <= 0
                  ? 'Out of Stock'
                  : added
                  ? 'Added to Cart ✓'
                  : 'Add to Cart'}
              </span>
            </Button>

            <div className="flex space-x-2">
              <Link to={`/product/${product.slug}`} className="flex-1">
                <Button variant="secondary" className="w-full py-2 text-xs">
                  Full Details & Zoom
                </Button>
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>Inquire</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
