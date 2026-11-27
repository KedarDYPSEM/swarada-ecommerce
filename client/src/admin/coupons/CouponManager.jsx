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
  Search,
  Package,
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

  // Products for targeted coupon selection
  const [productList, setProductList] = useState([]);
  const [productSearch, setProductSearch] = useState('');

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
    isProductSpecific: false,
    selectedProductIds: [],
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

  const fetchProductsList = async () => {
    try {
      const res = await adminService.getProducts({ limit: 300 });
      if (res && res.data && res.data.products) {
        setProductList(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products for coupons:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchProductsList();
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
      isProductSpecific: false,
      selectedProductIds: [],
    });
    setProductSearch('');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    const specific = Boolean(coupon.couponProducts && coupon.couponProducts.length > 0);
    const pIds = coupon.couponProducts ? coupon.couponProducts.map((cp) => cp.productId) : [];

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
      isProductSpecific: specific,
      selectedProductIds: pIds,
    });
    setProductSearch('');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    if (formData.isProductSpecific && formData.selectedProductIds.length === 0) {
      setError('Please select at least one product for this specific coupon, or switch to "Storewide (All Products)".');
      setActionLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        productIds: formData.isProductSpecific ? formData.selectedProductIds : [],
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
            Configure percentage, flat-off, first-order, and product-specific discount campaigns
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
                <th className="px-4 py-3.5">Scope & Restrictions</th>
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
                      <div>
                        {c.isFirstOrderOnly ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            First Order Only
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-600">All Customers</span>
                        )}
                        <span className="text-[10px] text-neutral-400 ml-1.5">
                          ({c.perUserLimit} use{c.perUserLimit > 1 ? 's' : ''}/user)
                        </span>
                      </div>
                      <div className="mt-1">
                        {c.couponProducts && c.couponProducts.length > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Package className="w-2.5 h-2.5 mr-1" />
                            {c.couponProducts.length} Selected Product{c.couponProducts.length > 1 ? 's' : ''} Only
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Storewide (All Products)
                          </span>
                        )}
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
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#292323] font-heading">
              {editingCoupon ? 'Edit Coupon' : 'Create New Promotional Coupon'}
            </h3>
            <p className="text-neutral-500 mt-1">
              Set discount value, product eligibility, and redemption constraints.
            </p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
                    placeholder="e.g. PAITHANI500"
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
                    <option value="FIXED">Flat Amount (₹) Off</option>
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

              {/* Product Scope Section */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block font-semibold text-neutral-800 mb-1.5">
                  Coupon Applicability Scope <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isProductSpecific: false })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      !formData.isProductSpecific
                        ? 'border-[#641B32] bg-[#641B32]/5 text-[#641B32] font-semibold ring-1 ring-[#641B32]'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-bold">Storewide (All Products)</div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      Valid on every product across the entire store
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isProductSpecific: true })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.isProductSpecific
                        ? 'border-[#641B32] bg-[#641B32]/5 text-[#641B32] font-semibold ring-1 ring-[#641B32]'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-bold">Selected Products Only</div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      Restrict discount strictly to specific handpicked products
                    </div>
                  </button>
                </div>

                {formData.isProductSpecific && (
                  <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search product by name or SKU..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const allIds = productList.map((p) => p.id);
                            setFormData({ ...formData, selectedProductIds: allIds });
                          }}
                          className="px-2 py-1 bg-white border border-neutral-200 rounded hover:bg-neutral-100 font-medium text-neutral-700"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedProductIds: [] })}
                          className="px-2 py-1 bg-white border border-neutral-200 rounded hover:bg-neutral-100 font-medium text-neutral-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
                      <span>
                        Selected: <strong className="text-[#641B32]">{formData.selectedProductIds.length}</strong> of {productList.length} products
                      </span>
                      {formData.selectedProductIds.length === 0 && (
                        <span className="text-amber-600 font-medium">Please check at least 1 product</span>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-neutral-200 bg-white border border-neutral-200 rounded">
                      {productList
                        .filter((p) => {
                          if (!productSearch) return true;
                          const q = productSearch.toLowerCase();
                          return (
                            p.name?.toLowerCase().includes(q) ||
                            p.sku?.toLowerCase().includes(q)
                          );
                        })
                        .map((prod) => {
                          const isSelected = formData.selectedProductIds.includes(prod.id);
                          const imgUrl = prod.images?.[0]?.url || prod.images?.[0]?.imageUrl || '';
                          return (
                            <label
                              key={prod.id}
                              className={`flex items-center justify-between p-2 cursor-pointer hover:bg-neutral-50 transition-colors ${
                                isSelected ? 'bg-amber-50/50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 overflow-hidden">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        selectedProductIds: [...formData.selectedProductIds, prod.id],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        selectedProductIds: formData.selectedProductIds.filter((id) => id !== prod.id),
                                      });
                                    }
                                  }}
                                  className="rounded text-[#641B32] focus:ring-[#641B32]"
                                />
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={prod.name}
                                    className="w-8 h-8 rounded object-cover border border-neutral-100 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center text-neutral-400 text-[10px] flex-shrink-0">
                                    No Pic
                                  </div>
                                )}
                                <div className="truncate">
                                  <div className="font-semibold text-neutral-800 text-xs truncate">
                                    {prod.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 font-mono">
                                    SKU: {prod.sku}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-xs font-bold text-neutral-700 ml-2 flex-shrink-0">
                                {formatPrice(prod.sellingPrice)}
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}
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
