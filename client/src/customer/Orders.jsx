import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Calendar, ArrowRight } from 'lucide-react';
import orderService from '../services/orderService';
import { formatPrice } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        if (data) setOrders(data);
      } catch (err) {
        // Fallback sample
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#C5A05A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Loading your saree purchases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-xl font-heading font-bold text-[#641B32]">
          My Orders & History
        </h1>
        <p className="text-xs text-[#594E4E] mt-0.5">
          Track fulfillment status, courier tracking, and view order receipts.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-neutral-200 rounded-xs p-5 bg-white shadow-xs space-y-4 hover:border-[#641B32] transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 text-xs gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-[#641B32]">
                    #{order.orderNumber}
                  </span>
                  <Badge variant={order.status === 'DELIVERED' ? 'discount' : 'gold'}>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-neutral-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </span>
                  <span className="font-bold text-[#292323]">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-neutral-50">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#292323]">{item.productName}</p>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} • SKU: {item.productSku}
                      </p>
                    </div>
                    <span className="font-semibold">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Tracking Link */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-xs">
                <span className="text-neutral-500">
                  Delivery to: <strong>{order.shippingCity}, {order.shippingState}</strong>
                </span>

                <Link
                  to={`/track-order?order=${order.orderNumber}`}
                  className="text-[#641B32] font-semibold hover:underline flex items-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Courier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4">
          <Package className="w-12 h-12 text-[#C5A05A] mx-auto opacity-70" />
          <h3 className="font-heading text-lg font-bold text-[#641B32]">No Orders Yet</h3>
          <p className="text-xs text-[#594E4E] max-w-xs mx-auto">
            You haven't placed any saree orders yet. Begin exploring our curated collections.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="sm">
              Explore Collections
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
