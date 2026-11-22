import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Eye,
  Calendar,
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
        setPagination(res.pagination);
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
                <th className="px-4 py-3.5">Joined On</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const name = c.profile
                    ? `${c.profile.firstName || ''} ${c.profile.lastName || ''}`.trim() || c.profile.displayName
                    : 'Customer';
                  const defaultCity = c.addresses?.[0]?.city || '—';

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#292323]">{name}</div>
                        <div className="text-[10px] text-neutral-400">ID: #{c.id}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-neutral-700">{c.email}</div>
                        {c.phone && <div className="text-[10px] text-neutral-500 font-mono">{c.phone}</div>}
                      </td>

                      <td className="px-4 py-3 text-neutral-600">
                        {defaultCity}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-800">
                          {c.totalOrdersCount || 0}
                        </span>
                        <span className="text-neutral-400 ml-1">orders</span>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#641B32]">
                        {formatPrice(c.lifetimeSpend || 0)}
                      </td>

                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
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

      {/* Customer Quick Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A05A]">
                  Customer Dossier
                </span>
                <h3 className="text-base font-bold text-[#292323] font-heading">
                  {selectedCustomer.profile
                    ? `${selectedCustomer.profile.firstName || ''} ${selectedCustomer.profile.lastName || ''}`.trim()
                    : 'Customer Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

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
                  {selectedCustomer.totalOrdersCount || 0}
                </div>
              </div>
              <div>
                <div className="text-neutral-400">Lifetime Revenue</div>
                <div className="font-bold text-emerald-700 text-sm">
                  {formatPrice(selectedCustomer.lifetimeSpend || 0)}
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-neutral-700 mb-1">Recent Orders by this Customer:</div>
              {selectedCustomer.orders?.length === 0 ? (
                <div className="text-neutral-400 italic">No orders recorded yet.</div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded">
                  {selectedCustomer.orders?.map((o) => (
                    <div key={o.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-semibold text-[#641B32]">{o.orderNumber}</span>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#292323]">{formatPrice(o.totalAmount)}</div>
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700">
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
