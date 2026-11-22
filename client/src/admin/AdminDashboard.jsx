import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AdminDashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '₹14,82,450', change: '+18.4% vs last month', icon: DollarSign, color: 'text-emerald-600' },
    { title: "Today's Sales", value: '₹42,949', change: '3 orders today', icon: ShoppingBag, color: 'text-[#641B32]' },
    { title: 'Total Orders', value: '148', change: '12 pending dispatch', icon: Package, color: 'text-[#C5A05A]' },
    { title: 'Registered Customers', value: '382', change: '+24 new this week', icon: Users, color: 'text-blue-600' },
  ];

  const lowStockProducts = [
    { name: 'Peshwai Kathpadar Double Pallu Paithani (Emerald Green)', sku: 'S8C4', stock: 2, threshold: 3 },
    { name: 'Traditional Kolhapuri Nauvari Silk (Mustard Yellow)', sku: 'N901', stock: 2, threshold: 3 },
  ];

  const recentOrders = [
    { id: 'SW-2026-001', customer: 'Ananya Joshi', items: 'Yeola Paithani (Maroon)', total: 14999, status: 'CONFIRMED', payment: 'Razorpay' },
    { id: 'SW-2026-002', customer: 'Snehal Patil', items: 'Banarasi Brocade (Burgundy)', total: 12950, status: 'PROCESSING', payment: 'Razorpay' },
    { id: 'SW-2026-003', customer: 'Pooja Kulkarni', items: 'Nauvari Silk (Mustard)', total: 11200, status: 'DELIVERED', payment: 'COD' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Swarada Management
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Executive Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Vyapar Sync Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vyapar Gold Middleware Ready</span>
          </div>

          <Link to="/admin/products/new">
            <Button variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white p-5 rounded-xs border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500">{s.title}</p>
                <div className={`p-2 rounded-full bg-neutral-100 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#292323] mt-2 font-heading">{s.value}</p>
              <p className="text-[11px] text-neutral-400 mt-1">{s.change}</p>
            </div>
          );
        })}
      </div>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xs border border-neutral-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#292323]">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs text-[#641B32] hover:underline font-medium">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-y border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-mono font-semibold text-[#641B32]">{o.id}</td>
                    <td className="py-3 px-3 font-medium">{o.customer}</td>
                    <td className="py-3 px-3 text-neutral-600 truncate max-w-xs">{o.items}</td>
                    <td className="py-3 px-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={o.status === 'DELIVERED' ? 'discount' : 'gold'}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">{o.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-xs border border-amber-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Low Stock Inventory Alerts</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Products that require restocking to avoid fulfillment delays.
          </p>

          <div className="space-y-3 pt-2">
            {lowStockProducts.map((p) => (
              <div key={p.sku} className="p-3 bg-amber-50/60 border border-amber-200 rounded text-xs space-y-1">
                <p className="font-semibold text-neutral-800 line-clamp-1">{p.name}</p>
                <div className="flex items-center justify-between text-neutral-600">
                  <span className="font-mono text-[11px]">SKU: {p.sku}</span>
                  <span className="text-amber-800 font-bold">Only {p.stock} units left</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button variant="secondary" size="sm" className="w-full text-xs">
              Generate Restock Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
