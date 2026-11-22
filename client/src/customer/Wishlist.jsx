import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import orderService from '../services/orderService';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';

export const CustomerWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const items = await orderService.getWishlist();
      if (items) setWishlistItems(items);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const items = await orderService.removeFromWishlist(productId);
      if (items) setWishlistItems(items);
    } catch (e) {
      //
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      await handleRemove(productId);
    } catch (e) {
      //
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-xl font-heading font-bold text-[#641B32]">
          My Wishlist Treasures
        </h1>
        <p className="text-xs text-[#594E4E] mt-0.5">
          Handlooms and sarees you've saved for future celebrations.
        </p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="border border-neutral-200 rounded-xs overflow-hidden bg-white shadow-xs p-3 space-y-3 flex flex-col justify-between"
            >
              <div className="aspect-3/4 overflow-hidden rounded-xs bg-neutral-100">
                <img
                  src={
                    item.product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <Link
                  to={`/product/${item.product.slug}`}
                  className="text-xs font-semibold text-[#292323] hover:text-[#641B32] line-clamp-1 block"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm font-bold text-[#641B32]">
                  {formatPrice(item.product.sellingPrice)}
                </p>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-neutral-100">
                <Button
                  onClick={() => handleMoveToCart(item.product.id)}
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                  <span>Move to Bag</span>
                </Button>

                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="p-2 border border-neutral-300 hover:border-red-500 hover:text-red-600 rounded text-neutral-400 cursor-pointer"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4">
          <Heart className="w-12 h-12 text-[#C5A05A] mx-auto opacity-70" />
          <h3 className="font-heading text-lg font-bold text-[#641B32]">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-[#594E4E] max-w-xs mx-auto">
            Click the heart icon on any saree to save it to your wishlist for later.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="sm">
              Discover Sarees
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerWishlist;
