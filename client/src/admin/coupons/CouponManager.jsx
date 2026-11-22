import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

export const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '1',
    isFirstOrderOnly: false,
    isActive: true,
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons();
      if (res && res.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '10',
      minOrderValue: '1999',
      maxDiscount: '1000',
      usageLimit: '100',
      perUserLimit: '1',
      isFirstOrderOnly: false,
      isActive: true,
      expiresAt: '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue?.toString() || '',
      minOrderValue: coupon.minOrderValue?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      perUserLimit: coupon.perUserLimit?.toString() || '1',
      isFirstOrderOnly: Boolean(coupon.isFirstOrderOnly),
      isActive: Boolean(coupon.isActive),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, payload);
      } else {
        await adminService.createCoupon(payload);
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await adminService.deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Promotions & Marketing
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Coupons & Discount Codes
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure percentage, flat-off, first-order, and festival discount campaigns
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          className="bg-[#641B32] hover:bg-[#7B1E35]"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Coupon</span>
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Coupon Code</th>
                <th className="px-4 py-3.5">Discount Rate</th>
                <th className="px-4 py-3.5">Min Order / Max Cap</th>
                <th className="px-4 py-3.5">Audience & Restrictions</th>
                <th className="px-4 py-3.5">Redemptions</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-500">
                    No discount coupons found. Create your first campaign above.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#641B32] bg-[#641B32]/10 px-2 py-1 rounded text-xs">
                        {c.code}
                      </span>
                      {c.description && (
                        <div className="text-[10px] text-neutral-500 mt-1 max-w-xs line-clamp-1">
                          {c.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-neutral-800">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : `${formatPrice(c.discountValue)} FLAT OFF`}
                    </td>

                    <td className="px-4 py-3 text-neutral-600">
                      <div>Min: {c.minOrderValue ? formatPrice(c.minOrderValue) : 'None'}</div>
                      {c.maxDiscount && (
                        <div className="text-[10px] text-neutral-400">
                          Max Cap: {formatPrice(c.maxDiscount)}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {c.isFirstOrderOnly ? (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          First Order Only
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-600">All Customers</span>
                      )}
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {c.perUserLimit} use{c.perUserLimit > 1 ? 's' : ''} per customer
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-700">
                        {c._count?.usages || c.usageCount || 0}
                        {c.usageLimit && <span className="text-neutral-400"> / {c.usageLimit}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                          c.isActive ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-neutral-600">
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-neutral-600 hover:text-[#641B32] rounded hover:bg-neutral-100"
                          title="Edit Coupon"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-lg font-bold text-[#292323] font-heading">
              {editingCoupon ? 'Edit Coupon' : 'Create New Promotional Coupon'}
            </h3>
            <p className="text-neutral-500 mt-1">
              Set discount value, eligibility, and redemption constraints.
            </p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Discount Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] bg-white font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹) Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-neutral-200 rounded font-bold text-[#641B32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="1999"
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Description / Marketing Tagline
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Flat 10% off on all authentic Paithani sarees"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Total Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFirstOrderOnly}
                    onChange={(e) => setFormData({ ...formData, isFirstOrderOnly: e.target.checked })}
                    className="rounded text-[#641B32] focus:ring-[#641B32]"
                  />
                  <span className="font-semibold text-neutral-700">First-time customers only</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#641B32] focus:ring-[#641B32]"
                  />
                  <span className="font-semibold text-neutral-700">Active & Enabled</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-[#641B32] hover:bg-[#7B1E35]"
                >
                  {actionLoading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
