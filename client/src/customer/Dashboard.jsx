import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Truck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

export const CustomerDashboard = () => {
  const { user } = useAuth();

  const recentOrders = [
    {
      id: 'SW-2026-001',
      date: '2026-11-20',
      total: 14999,
      status: 'SHIPPED',
      itemsCount: 1,
      name: 'Maharani Yeola Pure Silk Paithani',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFF9F0] border border-[#C5A05A]/30 p-6 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C5A05A]">
            Swarada Privilege Account
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#641B32] mt-0.5">
            Welcome back, {user?.profile?.firstName || 'Valued Customer'}!
          </h1>
          <p className="text-xs text-[#594E4E] mt-1">
            Manage your handloom saree orders, delivery addresses and preferences.
          </p>
        </div>

        <Link
          to="/shop"
          className="bg-[#641B32] hover:bg-[#7B1E35] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors whitespace-nowrap shadow-xs"
        >
          Explore New Weaves
        </Link>
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
            <p className="text-lg font-bold text-[#292323]">1 Order</p>
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
            <p className="text-lg font-bold text-[#292323]">3 Sarees</p>
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
            <p className="text-lg font-bold text-[#292323]">1 Address</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-heading font-bold text-[#641B32]">
            Recent Orders
          </h2>
          <Link to="/account/orders" className="text-xs text-[#641B32] hover:underline font-semibold">
            View All Orders
          </Link>
        </div>

        <div className="border border-neutral-200 rounded-xs divide-y divide-neutral-100 overflow-hidden bg-white">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-semibold text-[#292323]">
                    #{order.id}
                  </span>
                  <Badge variant="discount">Dispatched & In Transit</Badge>
                </div>
                <p className="text-xs text-[#292323] font-medium">{order.name}</p>
                <p className="text-[11px] text-neutral-400">Placed on {order.date}</p>
              </div>

              <div className="flex items-center space-x-4 justify-between sm:justify-end">
                <span className="text-sm font-bold text-[#641B32]">
                  {formatPrice(order.total)}
                </span>
                <Link
                  to={`/track-order?order=${order.id}`}
                  className="inline-flex items-center space-x-1 text-xs text-[#641B32] hover:underline font-semibold"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Package</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
