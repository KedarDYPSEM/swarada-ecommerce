import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

const STATUS_TABS = [
  { label: 'All Orders', value: '' },
  { label: 'Pending / Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Packed', value: 'PACKED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const OrderList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const activeStatus = searchParams.get('status') || '';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = {
        page,
        limit: 15,
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
        paymentMethod: searchParams.get('paymentMethod') || undefined,
      };

      const res = await adminService.getOrders(params);
      if (res && res.data) {
        setOrders(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  const handleStatusTabClick = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) newParams.set('status', status);
    else newParams.delete('status');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) newParams.set('search', searchTerm);
    else newParams.delete('search');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Order Fulfillment Center
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Customer Orders & Shipments
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Process incoming saree orders, assign courier AWB tracking, print packing slips
          </p>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex space-x-1 border-b border-neutral-200 overflow-x-auto pb-1 text-xs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusTabClick(tab.value)}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeStatus === tab.value
                ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Options */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID (SW-2026-...), Customer Name, Phone, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32]"
          />
        </div>
        <Button type="submit" variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
          Search
        </Button>
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Order ID & Date</th>
                <th className="px-4 py-3.5">Customer & Destination</th>
                <th className="px-4 py-3.5">Items Ordered</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Fulfillment Status</th>
                <th className="px-4 py-3.5">Courier / AWB</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#641B32]">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{dateStr}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#292323]">{order.shippingName}</div>
                        <div className="text-[10px] text-neutral-500">
                          {order.shippingPhone} • {order.shippingCity}, {order.shippingPincode}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-neutral-800 line-clamp-1">
                          {order.items?.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {order.items?.length || 0} product line{order.items?.length > 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#292323]">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-700">
                          {order.paymentMethod}
                        </span>
                        <div className="text-[10px] text-neutral-400 uppercase">
                          {order.paymentStatus}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {order.shipment?.awbNumber ? (
                          <div className="font-mono text-[10px] text-purple-800 font-semibold">
                            {order.shipment.provider}: {order.shipment.awbNumber}
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Not Shipped</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#641B32]/10 hover:bg-[#641B32]/20 text-[#641B32] font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Page <span className="font-semibold">{pagination.page}</span> of{' '}
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} orders)
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', p.toString());
                    setSearchParams(newParams);
                  }}
                  className={`px-2.5 py-1 rounded border text-xs font-medium ${
                    p === pagination.page
                      ? 'bg-[#641B32] text-white border-[#641B32]'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
