import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import adminService from '../services/adminService';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboardStats();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: data ? formatPrice(data.totalRevenue || 0) : '₹0',
      subtitle: data ? `Today: ${formatPrice(data.todayRevenue || 0)}` : 'Loading...',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Total Orders',
      value: data ? data.totalOrders : '0',
      subtitle: data ? `${data.pendingOrders} pending dispatch` : 'Loading...',
      icon: ShoppingBag,
      color: 'text-[#641B32] bg-[#641B32]/10 border-[#641B32]/20',
    },
    {
      title: 'Active Products',
      value: data ? data.totalProducts : '0',
      subtitle: data ? `${data.outOfStock} out of stock` : 'Loading...',
      icon: Package,
      color: 'text-[#C5A05A] bg-[#C5A05A]/15 border-[#C5A05A]/30',
    },
    {
      title: 'Registered Customers',
      value: data ? data.totalCustomers : '0',
      subtitle: 'Verified customer accounts',
      icon: Users,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
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
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time business performance, order statuses, and inventory health
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 border border-neutral-300 rounded hover:bg-neutral-50 text-neutral-600 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link to="/admin/products/new">
            <Button variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Saree</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {card.title}
                </span>
                <div className={`p-2 rounded-md border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-heading text-[#292323]">
                {loading ? <span className="animate-pulse bg-neutral-200 text-transparent rounded">₹00,000</span> : card.value}
              </div>
              <p className="text-xs text-neutral-500 mt-1">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown Bar */}
      {data && (
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-4">
            Order Fulfillment Pipeline
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-center space-x-1.5 text-amber-700 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending / Processing</span>
              </div>
              <div className="text-xl font-bold text-amber-900 mt-1">{data.pendingOrders}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-700 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Delivered</span>
              </div>
              <div className="text-xl font-bold text-emerald-900 mt-1">{data.deliveredOrders}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <div className="flex items-center justify-center space-x-1.5 text-rose-700 text-xs font-medium">
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancelled / Refunded</span>
              </div>
              <div className="text-xl font-bold text-rose-900 mt-1">{data.cancelledOrders}</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-center space-x-1.5 text-neutral-700 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>This Month Sales</span>
              </div>
              <div className="text-xl font-bold text-[#641B32] mt-1">{formatPrice(data.monthlyRevenue || 0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-[#292323] text-lg">
                Recent Orders
              </h2>
              <p className="text-xs text-neutral-500">Live order queue from storefront</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#641B32] hover:text-[#7B1E35] flex items-center space-x-1"
            >
              <span>View all orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Loading orders...</div>
            ) : (!data?.recentOrders || data.recentOrders.length === 0) ? (
              <div className="p-6 text-center text-sm text-neutral-500">No orders placed yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Number</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-[#641B32]">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#292323]">{order.shippingName}</div>
                        <div className="text-[10px] text-neutral-500">{order.shippingCity}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#292323]">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'PROCESSING' || order.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-medium text-neutral-600">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center space-x-1 text-[#641B32] hover:underline font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock & Best Sellers (1 Column) */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
            <div className="flex items-center space-x-2 text-rose-700 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-[#292323]">
                Stock Attention Needed
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Products with stock falling below low stock threshold.
            </p>

            <div className="space-y-3">
              {(!data?.lowStockProducts || data.lowStockProducts.length === 0) ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded border border-emerald-200">
                  All active products have adequate inventory levels.
                </p>
              ) : (
                data.lowStockProducts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#292323] line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        SKU: {item.sku}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        {item.stockQuantity} Left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-right">
              <Link
                to="/admin/products?stock=low"
                className="text-xs text-[#641B32] font-semibold hover:underline"
              >
                Manage Inventory &rarr;
              </Link>
            </div>
          </div>

          {/* Order Dispatch & Shipping Status Card */}
          <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#C5A05A]/30 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A05A]">
              Fulfillment & Dispatch
            </span>
            <h4 className="font-heading font-bold text-[#641B32] mt-1 text-sm">
              All-India Express Logistics
            </h4>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Real-time delivery coverage across 29,000+ Indian PIN codes with Blue Dart, Delhivery, and insured silk mark packaging.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Logistics Network:</span>
              <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                <span>Express Dispatch Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
