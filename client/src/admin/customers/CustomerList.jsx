import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

export const CustomerList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = {
        page,
        limit: 15,
        search: searchParams.get('search') || undefined,
      };

      const res = await adminService.getCustomers(params);
      if (res && res.data) {
        setCustomers(res.data);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: res.data.length });
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) newParams.set('search', searchTerm);
    else newParams.delete('search');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleOpenProfile = async (c) => {
    setSelectedCustomer(c);
    setIsEditing(false);
    setEditData({
      firstName: c.profile?.firstName || c.name?.split(' ')[0] || '',
      lastName: c.profile?.lastName || c.name?.split(' ').slice(1).join(' ') || '',
      email: c.rawEmail || c.email || '',
      phone: c.phone !== '—' ? c.phone : '',
      isActive: Boolean(c.isActive),
    });

    try {
      const res = await adminService.getCustomerById(c.id);
      if (res && res.data) {
        setSelectedCustomer(res.data);
        setEditData({
          firstName: res.data.profile?.firstName || '',
          lastName: res.data.profile?.lastName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          isActive: Boolean(res.data.isActive),
        });
      }
    } catch (e) {
      // Keep loaded summary
    }
  };

  const handleToggleStatus = async (customerId, e) => {
    if (e) e.stopPropagation();
    try {
      await adminService.toggleCustomerStatus(customerId);
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer((prev) => ({ ...prev, isActive: !prev.isActive }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await adminService.updateCustomer(selectedCustomer.id, editData);
      setIsEditing(false);
      fetchCustomers();
      const res = await adminService.getCustomerById(selectedCustomer.id);
      if (res && res.data) setSelectedCustomer(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Customer Relationship
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Registered Customers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            View customer purchase history, contact details, and lifetime order totals
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by Name, Email, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32]"
          />
        </div>
        <Button type="submit" variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
          Search
        </Button>
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">City / Location</th>
                <th className="px-4 py-3.5">Orders Count</th>
                <th className="px-4 py-3.5">Lifetime Spend</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined On</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const name =
                    c.name ||
                    (c.profile
                      ? `${c.profile.firstName || ''} ${c.profile.lastName || ''}`.trim() || c.profile.displayName
                      : 'Customer');
                  const defaultCity = c.city || c.addresses?.[0]?.city || '—';
                  const ordersCount = c.totalOrdersCount ?? c.totalOrders ?? c.orders?.length ?? 0;
                  const spend = c.lifetimeSpend ?? c.totalSpent ?? 0;

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#292323]">{name}</div>
                        <div className="text-[10px] text-neutral-400">ID: #{c.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-neutral-700 font-medium">{c.email}</div>
                        {c.phone && c.phone !== '—' && (
                          <div className="text-[10px] text-neutral-500 font-mono">{c.phone}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-neutral-600 font-medium">
                        {defaultCity}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-neutral-800">
                          {ordersCount}
                        </span>
                        <span className="text-neutral-400 ml-1">orders</span>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#641B32]">
                        {formatPrice(spend)}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleToggleStatus(c.id, e)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {c.isActive ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3 text-neutral-500">
                        {c.createdAt || c.joinedAt
                          ? new Date(c.createdAt || c.joinedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenProfile(c)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
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
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} customers)
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
                  className={`px-2.5 py-1 rounded border text-xs font-medium cursor-pointer ${
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

      {/* Customer Quick Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A05A]">
                  Customer Dossier
                </span>
                <h3 className="text-base font-bold text-[#292323] font-heading">
                  {selectedCustomer.name ||
                    (selectedCustomer.profile
                      ? `${selectedCustomer.profile.firstName || ''} ${selectedCustomer.profile.lastName || ''}`.trim()
                      : 'Customer Details')}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2.5 py-1 rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-[#641B32]" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Customer'}</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveCustomer} className="space-y-3 p-4 bg-amber-50/40 rounded-lg border border-amber-200/60">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs bg-white focus:outline-none focus:border-[#641B32]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs bg-white focus:outline-none focus:border-[#641B32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs bg-white focus:outline-none focus:border-[#641B32]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs bg-white focus:outline-none focus:border-[#641B32]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.isActive}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                      className="rounded text-[#641B32]"
                    />
                    <span className="font-semibold text-neutral-800">Account Active (Can log in & order)</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-amber-200">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={savingEdit}>
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save Customer Updates
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="text-neutral-400">Email Address</div>
                  <div className="font-semibold text-neutral-800">{selectedCustomer.email}</div>
                </div>
                <div>
                  <div className="text-neutral-400">Mobile Phone</div>
                  <div className="font-semibold text-neutral-800 font-mono">
                    {selectedCustomer.phone || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Total Orders Placed</div>
                  <div className="font-bold text-[#641B32] text-sm">
                    {selectedCustomer.totalOrdersCount ?? selectedCustomer.totalOrders ?? selectedCustomer.orders?.length ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Lifetime Revenue</div>
                  <div className="font-bold text-emerald-700 text-sm">
                    {formatPrice(selectedCustomer.lifetimeSpend ?? selectedCustomer.totalSpent ?? 0)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="font-semibold text-neutral-700 mb-1">Recent Orders by this Customer:</div>
              {!selectedCustomer.orders || selectedCustomer.orders.length === 0 ? (
                <div className="text-neutral-400 italic p-3 bg-neutral-50 rounded text-center">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded overflow-hidden">
                  {selectedCustomer.orders.map((o) => (
                    <div key={o.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                      <div>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="font-mono font-bold text-[#641B32] hover:underline flex items-center gap-1"
                        >
                          <span>{o.orderNumber}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </Link>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#292323]">{formatPrice(o.totalAmount)}</div>
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : o.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
