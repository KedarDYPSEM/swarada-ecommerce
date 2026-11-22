import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Package,
  Calendar,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Shipment Tracking State
  const [shipmentData, setShipmentData] = useState({
    provider: 'Shiprocket',
    awbNumber: '',
    trackingNumber: '',
    estimatedDelivery: '',
  });

  // Packing Slip Printable View
  const [printSlip, setPrintSlip] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrderById(id);
      if (res && res.data) {
        setOrder(res.data);
        setNewStatus(res.data.status);
        if (res.data.shipment) {
          setShipmentData({
            provider: res.data.shipment.provider || 'Shiprocket',
            awbNumber: res.data.shipment.awbNumber || '',
            trackingNumber: res.data.shipment.trackingNumber || '',
            estimatedDelivery: res.data.shipment.estimatedDelivery
              ? new Date(res.data.shipment.estimatedDelivery).toISOString().split('T')[0]
              : '',
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setActionLoading(true);
    try {
      await adminService.updateOrderStatus(id, {
        status: newStatus,
        note: statusNote || undefined,
      });
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveShipment = async (e) => {
    e.preventDefault();
    if (!shipmentData.awbNumber) {
      alert('Please enter an AWB number');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateShipmentTracking(id, shipmentData);
      alert('Shipment tracking saved successfully');
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save shipment tracking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Reason for order cancellation (Restores stock to inventory):');
    if (!reason) return;
    setActionLoading(true);
    try {
      await adminService.cancelOrder(id, { reason });
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-neutral-500 animate-pulse">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600">{error || 'Order not found'}</p>
        <Link to="/admin/orders">
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/orders"
            className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
                Order Details
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold uppercase bg-[#641B32]/10 text-[#641B32]">
                {order.orderNumber}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#292323]">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Printer className="w-4 h-4 text-neutral-500" />
            <span>Print Invoice / Slip</span>
          </button>

          {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="px-3 py-2 border border-rose-200 rounded text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Line Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Ordered Table */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200 font-heading font-bold text-[#292323] text-sm">
              Sarees & Products Ordered ({order.items?.length || 0})
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150'}
                      alt={item.productName}
                      className="w-12 h-16 object-cover rounded border border-neutral-200"
                    />
                    <div>
                      <div className="font-semibold text-[#292323]">{item.productName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        SKU: {item.sku}
                      </div>
                      <div className="text-[11px] text-neutral-600 mt-0.5">
                        {formatPrice(item.unitPrice)} × {item.quantity} qty
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-[#292323]">
                      {formatPrice(item.total)}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Incl. ₹{item.gstAmount || 0} GST
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (MRP/List)</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({order.couponCode || 'Applied'})</span>
                  <span>- {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee</span>
                <span>{order.shippingAmount === 0 ? 'FREE' : formatPrice(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST (Goods & Services Tax)</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#641B32] pt-2 border-t border-neutral-200">
                <span>Total Amount Charged</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Customer Details */}
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center space-x-1.5 text-[#641B32] font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                <span>Shipping & Delivery Destination</span>
              </div>
              <div className="font-semibold text-neutral-800">{order.shippingName}</div>
              <div className="text-neutral-600 mt-1 leading-relaxed">
                {order.shippingAddress1}
                {order.shippingAddress2 && <>, {order.shippingAddress2}</>}
                {order.shippingLandmark && <><br />Landmark: {order.shippingLandmark}</>}
                <br />
                {order.shippingCity}, {order.shippingState} – <span className="font-mono font-semibold">{order.shippingPincode}</span>
                <br />
                Country: {order.shippingCountry || 'India'}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5 text-[#641B32] font-semibold mb-2">
                <User className="w-4 h-4" />
                <span>Customer Contact Information</span>
              </div>
              <div className="space-y-1.5 text-neutral-600">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono font-medium">{order.shippingPhone}</span>
                </div>
                {order.shippingEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{order.shippingEmail}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Payment Gateway:</span>
                  <div className="font-medium text-[#292323] mt-0.5">
                    {order.paymentMethod} • <span className="text-emerald-700 font-bold uppercase">{order.paymentStatus}</span>
                  </div>
                  {order.paymentId && (
                    <div className="text-[10px] font-mono text-neutral-400">Ref: {order.paymentId}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Fulfillment Actions & Shipment Tracking */}
        <div className="space-y-6 text-xs">
          {/* Order Status Control */}
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#292323]">
              Update Order Status
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Current Status: <span className="text-[#641B32] uppercase">{order.status}</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] bg-white font-medium"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Internal Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ironed and packed in Swarada brand box"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={actionLoading || newStatus === order.status}
                className="w-full bg-[#641B32] hover:bg-[#7B1E35]"
              >
                {actionLoading ? 'Updating...' : 'Save New Status'}
              </Button>
            </form>
          </div>

          {/* Courier & AWB Tracking (Shiprocket Architecture) */}
          <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-[#641B32]">
              <Truck className="w-4 h-4" />
              <h3 className="font-heading font-bold text-sm text-[#292323]">
                Shipment & AWB Details
              </h3>
            </div>

            <form onSubmit={handleSaveShipment} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Logistics Carrier / Provider
                </label>
                <select
                  value={shipmentData.provider}
                  onChange={(e) => setShipmentData({ ...shipmentData, provider: e.target.value })}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded bg-white"
                >
                  <option value="Shiprocket">Shiprocket (Integrated)</option>
                  <option value="Blue Dart">Blue Dart Express</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Local Store Dispatch">Local Kolhapur Store Delivery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  AWB / Tracking Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SR109283748IN"
                  value={shipmentData.awbNumber}
                  onChange={(e) => setShipmentData({ ...shipmentData, awbNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded font-mono font-bold text-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={shipmentData.estimatedDelivery}
                  onChange={(e) => setShipmentData({ ...shipmentData, estimatedDelivery: e.target.value })}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={actionLoading}
                className="w-full border-[#641B32] text-[#641B32] hover:bg-[#641B32]/5"
              >
                {actionLoading ? 'Saving...' : 'Update Tracking & Notify'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
