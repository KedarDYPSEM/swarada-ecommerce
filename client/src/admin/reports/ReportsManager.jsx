import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Receipt,
  Download,
  Package,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';

export const ReportsManager = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = null;

      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      }

      const res = await adminService.getSalesReport({ startDate });
      if (res && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Failed to load sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Financial Analytics
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Executive Sales & Tax Reports
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Revenue trends, GST tax collections, and product category profitability
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center space-x-2 text-xs">
          {['all', 'month', 'week', 'today'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-[#641B32] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : p === 'week' ? 'Past 7 Days' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Net Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#292323]">
            {loading ? '...' : formatPrice(report?.kpis?.netRevenue || 0)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Gross: {loading ? '...' : formatPrice(report?.kpis?.grossSales || 0)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#641B32]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#292323]">
            {loading ? '...' : report?.kpis?.ordersCount || 0}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Confirmed & Paid Orders</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-[#C5A05A]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#292323]">
            {loading ? '...' : formatPrice(report?.kpis?.averageOrderValue || 0)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Per transaction average</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>GST Tax Collected</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#292323]">
            {loading ? '...' : formatPrice(report?.kpis?.totalTax || 0)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">5% Handloom tax ledger</div>
        </div>
      </div>

      {/* Two Column Layout: Categories & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5 space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#292323]">
            Sales by Saree Category
          </h3>

          <div className="overflow-x-auto text-xs">
            {loading ? (
              <div className="p-8 text-center text-neutral-400 animate-pulse">Loading categories...</div>
            ) : (!report?.categoryPerformance || report.categoryPerformance.length === 0) ? (
              <div className="p-8 text-center text-neutral-400">No category sales recorded for this period.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Units Sold</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {report.categoryPerformance.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-semibold text-[#292323]">{c.name}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-neutral-700">{c.unitsSold}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#641B32]">
                        {formatPrice(c.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top-Selling Sarees */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5 space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#292323]">
            Top-Selling Saree Products
          </h3>

          <div className="overflow-x-auto text-xs">
            {loading ? (
              <div className="p-8 text-center text-neutral-400 animate-pulse">Loading top products...</div>
            ) : (!report?.topProducts || report.topProducts.length === 0) ? (
              <div className="p-8 text-center text-neutral-400">No products sold in this period.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Product & SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {report.topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#292323] line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-[#641B32] font-mono font-medium">SKU: {p.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-neutral-800">{p.unitsSold}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#641B32]">
                        {formatPrice(p.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
