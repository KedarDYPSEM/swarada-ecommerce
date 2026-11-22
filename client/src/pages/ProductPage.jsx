import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import { formatPrice, calculateDiscount } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const PRODUCT_DATA = {
  name: 'Maharani Yeola Pure Silk Paithani Saree in Royal Maroon',
  slug: 'maharani-yeola-pure-silk-paithani-saree-royal-maroon',
  sku: 'S7B3',
  mrp: 18500,
  sellingPrice: 14999,
  fabric: 'Pure Mulberry Silk',
  colour: 'Royal Maroon & Antique Gold',
  sareeLength: '6.3 Meters (Includes 0.8m Blouse Piece)',
  blouseDetails: 'Unstitched Running Brocade Silk Blouse Piece with Zari Border',
  washingInstructions: 'Strictly Dry Clean Only. Store wrapped in pure cotton or muslin cloth.',
  stockQuantity: 12,
  description:
    'Handwoven in pure mulberry silk with rich Tested Gold Zari. Features an elaborate Mayur (Peacock) and Asawali motif on the heavy pallu with signature Narali borders. A timeless heirloom piece from Swarada Saree Center, Kolhapur.',
  images: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
  ],
  attributes: [
    { name: 'Weave Type', value: 'Handloom Yeola Weave' },
    { name: 'Zari Type', value: 'Tested Antique Gold Zari' },
    { name: 'Occasion', value: 'Bridal, Weddings, Maharashtrian Festivals' },
    { name: 'Origin', value: 'Yeola & Kolhapur Master Artisans' },
  ],
};

export const ProductPage = () => {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = PRODUCT_DATA; // Fallback to rich data for preview
  const discount = calculateDiscount(product.mrp, product.sellingPrice);

  const whatsappMessage = `Hello Swarada Saree Center! I am interested in: ${product.name} (SKU: ${product.sku}). Please let me know if it is available for video call consultation.`;
  const whatsappUrl = `https://wa.me/919822012345?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="py-8 sm:py-12 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center space-x-2">
          <Link to="/" className="hover:text-[#641B32]">Home</Link>
          <span>/</span>
          <Link to="/shop?category=sarees" className="hover:text-[#641B32]">Sarees</Link>
          <span>/</span>
          <span className="text-[#292323] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 border border-[#C5A05A]/30 rounded-xs shadow-xs">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Main Image */}
            <div className="aspect-3/4 overflow-hidden rounded-xs bg-neutral-100 border border-neutral-200 relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
                <Badge variant="gold">Silk Mark Certified</Badge>
                {discount > 0 && <Badge variant="discount">{discount}% Off</Badge>}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-xs overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImage === idx ? 'border-[#641B32] shadow-sm' : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Information */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono bg-[#641B32]/10 text-[#641B32] px-2.5 py-0.5 rounded font-semibold">
                  SKU: {product.sku}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stockQuantity} Left)</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#641B32] leading-snug">
                {product.name}
              </h1>

              <p className="mt-2 text-xs text-[#594E4E] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#FFF9F0] border border-[#C5A05A]/30 rounded-xs flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-[#641B32]">
                {formatPrice(product.sellingPrice)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.mrp)}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                You Save {formatPrice(product.mrp - product.sellingPrice)} ({discount}%)
              </span>
            </div>

            {/* Saree Specifications Table */}
            <div className="border border-neutral-200 rounded-xs divide-y divide-neutral-100 text-xs">
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-semibold text-neutral-600">Fabric</span>
                <span className="col-span-2 text-[#292323]">{product.fabric}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-semibold text-neutral-600">Colour</span>
                <span className="col-span-2 text-[#292323]">{product.colour}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-semibold text-neutral-600">Saree Length</span>
                <span className="col-span-2 text-[#292323]">{product.sareeLength}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-semibold text-neutral-600">Blouse Piece</span>
                <span className="col-span-2 text-[#292323]">{product.blouseDetails}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-semibold text-neutral-600">Care Instructions</span>
                <span className="col-span-2 text-[#292323]">{product.washingInstructions}</span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#292323]">Quantity</span>
                <div className="flex items-center border border-neutral-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                  variant="primary"
                  className="flex-1 py-3 text-sm flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{added ? 'Added to Cart ✓' : 'Add to Cart'}</span>
                </Button>

                <Link to="/checkout" className="flex-1">
                  <Button variant="gold" className="w-full py-3 text-sm font-semibold text-[#292323]">
                    Buy Now
                  </Button>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Inquire via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Trust Markers */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 text-center text-[11px] text-[#594E4E]">
              <div className="p-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>100% Handloom Pure Silk</span>
              </div>
              <div className="p-2">
                <Truck className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>Free Express Shipping</span>
              </div>
              <div className="p-2">
                <RotateCcw className="w-4 h-4 text-[#C5A05A] mx-auto mb-1" />
                <span>7-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
