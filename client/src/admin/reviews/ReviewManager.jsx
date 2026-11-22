import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  Check,
  EyeOff,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

export const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus === 'approved') params.status = 'approved';
      if (filterStatus === 'pending') params.status = 'pending';

      const res = await adminService.getReviews(params);
      if (res && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const handleToggle = async (id, currentStatus) => {
    try {
      await adminService.toggleReviewApproval(id, !currentStatus);
      fetchReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminService.deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Social Proof & Feedback
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Moderate customer product feedback, verified purchases, and storefront display
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded font-medium ${
              filterStatus === 'all'
                ? 'bg-[#641B32] text-white'
                : 'bg-white border border-neutral-200 text-neutral-700'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded font-medium ${
              filterStatus === 'approved'
                ? 'bg-[#641B32] text-white'
                : 'bg-white border border-neutral-200 text-neutral-700'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded font-medium ${
              filterStatus === 'pending'
                ? 'bg-[#641B32] text-white'
                : 'bg-white border border-neutral-200 text-neutral-700'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Review Content</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-500">
                    No customer reviews recorded yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const customerName = r.user?.profile
                    ? `${r.user.profile.firstName || ''} ${r.user.profile.lastName || ''}`.trim()
                    : r.user?.email || 'Anonymous';

                  return (
                    <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-[#292323] line-clamp-1">
                          {r.product?.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          SKU: {r.product?.sku}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#292323]">{customerName}</div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-0.5 text-amber-500">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-md">
                        {r.title && <div className="font-semibold text-[#292323] mb-0.5">{r.title}</div>}
                        <div className="text-neutral-600 line-clamp-2 leading-relaxed">
                          "{r.comment}"
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            r.isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span>{r.isApproved ? 'Approved' : 'Pending'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggle(r.id, r.isApproved)}
                            className={`p-1.5 rounded transition-colors ${
                              r.isApproved
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={r.isApproved ? 'Hide from storefront' : 'Approve for storefront'}
                          >
                            {r.isApproved ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewManager;
