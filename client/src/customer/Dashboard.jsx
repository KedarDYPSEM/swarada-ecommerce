import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Truck, ChevronRight, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatPrice } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addressesCount, setAddressesCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersData, addressesData, wishlistData] = await Promise.allSettled([
          orderService.getMyOrders(),
          orderService.getAddresses(),
          orderService.getWishlist(),
        ]);

        if (ordersData.status === 'fulfilled' && ordersData.value) {
          setOrders(ordersData.value);
        }
        if (addressesData.status === 'fulfilled' && addressesData.value) {
          setAddressesCount(addressesData.value.length);
        }
        if (wishlistData.status === 'fulfilled' && wishlistData.value) {
          setWishlistCount(wishlistData.value.length);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const displayName = user?.profile?.displayName || user?.profile?.firstName || 'Valued Customer';
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFF9F0] border border-[#C5A05A]/30 p-6 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C5A05A]">
            Swarada Privilege Account
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#641B32] mt-0.5">
            Welcome back, {displayName}!
          </h1>
          <p className="text-xs text-[#594E4E] mt-1">
            Manage your personal profile, handloom orders, saved addresses and password.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/account/profile"
            className="border border-[#641B32] text-[#641B32] hover:bg-[#641B32] hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xs transition-colors whitespace-nowrap"
          >
            Edit Profile
          </Link>
          <Link
            to="/shop"
            className="bg-[#641B32] hover:bg-[#7B1E35] text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors whitespace-nowrap shadow-xs"
          >
            Explore Sarees
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/account/orders"
          className="p-5 border border-neutral-200 rounded-xs hover:border-[#641B32] transition-colors group flex items-center space-x-4 bg-white"
        >
          <div className="w-10 h-10 rounded-full bg-[#641B32]/10 text-[#641B32] flex items-center justify-center group-hover:bg-[#641B32] group-hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Total Orders</p>
            <p className="text-lg font-bold text-[#292323]">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </p>
          </div>
        </Link>

        <Link
          to="/account/wishlist"
          className="p-5 border border-neutral-200 rounded-xs hover:border-[#641B32] transition-colors group flex items-center space-x-4 bg-white"
        >
          <div className="w-10 h-10 rounded-full bg-[#C5A05A]/20 text-[#C5A05A] flex items-center justify-center group-hover:bg-[#C5A05A] group-hover:text-white transition-colors">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Wishlist Treasures</p>
            <p className="text-lg font-bold text-[#292323]">
              {wishlistCount} {wishlistCount === 1 ? 'Saree' : 'Sarees'}
            </p>
          </div>
        </Link>

        <Link
          to="/account/addresses"
          className="p-5 border border-neutral-200 rounded-xs hover:border-[#641B32] transition-colors group flex items-center space-x-4 bg-white"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Saved Addresses</p>
            <p className="text-lg font-bold text-[#292323]">
              {addressesCount} {addressesCount === 1 ? 'Address' : 'Addresses'}
            </p>
          </div>
        </Link>
      </div>

      {/* Account Settings Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/account/profile"
          className="p-4 border border-neutral-200 rounded-xs hover:border-[#641B32] bg-white transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-[#641B32] group-hover:bg-[#641B32] group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292323] group-hover:text-[#641B32]">
                My Profile Information
              </h4>
              <p className="text-[11px] text-neutral-400">
                Update name, mobile number, date of birth & gender
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#641B32] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/account/password"
          className="p-4 border border-neutral-200 rounded-xs hover:border-[#641B32] bg-white transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-[#641B32] group-hover:bg-[#641B32] group-hover:text-white transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292323] group-hover:text-[#641B32]">
                Change Password & Security
              </h4>
              <p className="text-[11px] text-neutral-400">
                Update password to keep your account protected
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#641B32] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-heading font-bold text-[#641B32]">
            Recent Orders
          </h2>
          <Link to="/account/orders" className="text-xs text-[#641B32] hover:underline font-semibold">
            View All Orders ({orders.length})
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center border border-neutral-200 rounded-xs bg-white">
            <div className="w-6 h-6 border-2 border-[#C5A05A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Loading recent orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="border border-neutral-200 rounded-xs divide-y divide-neutral-100 overflow-hidden bg-white">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#641B32]">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={order.status === 'DELIVERED' ? 'discount' : 'gold'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#292323] font-medium">
                    {order.items?.map((it) => it.productName).join(', ') || 'Handloom Saree'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} • {order.items?.length || 1} items
                  </p>
                </div>

                <div className="flex items-center space-x-4 justify-between sm:justify-end">
                  <span className="text-sm font-bold text-[#641B32]">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <Link
                    to={`/track-order?order=${order.orderNumber}`}
                    className="inline-flex items-center space-x-1 text-xs text-[#641B32] hover:underline font-semibold"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-300 rounded-xs p-8 text-center bg-white space-y-2">
            <p className="text-xs text-neutral-500">No saree orders placed yet.</p>
            <Link
              to="/shop"
              className="inline-block text-xs font-semibold text-[#641B32] hover:underline"
            >
              Browse our handcrafted weaves &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
