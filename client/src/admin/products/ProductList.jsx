import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import adminService from '../../services/adminService';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [stockFilter, setStockFilter] = useState(searchParams.get('stock') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  // Stock Adjust Modal State
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Manual stock adjustment / physical count');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = {
        page,
        limit: 12,
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        stock: searchParams.get('stock') || undefined,
        status: searchParams.get('status') || undefined,
      };

      const res = await adminService.getProducts(params);
      if (res && res.data) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories();
      if (res && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) newParams.set('search', searchTerm);
    else newParams.delete('search');
    if (selectedCategory) newParams.set('category', selectedCategory);
    else newParams.delete('category');
    if (stockFilter) newParams.set('stock', stockFilter);
    else newParams.delete('stock');
    if (statusFilter) newParams.set('status', statusFilter);
    else newParams.delete('status');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleDuplicate = async (id, name) => {
    if (!window.confirm(`Create a duplicate draft of "${name}"?`)) return;
    try {
      await adminService.duplicateProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await adminService.deleteProduct(id);
      if (res?.message || res?.data?.message) {
        alert(res?.message || res?.data?.message);
      }
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!stockModalProduct || !adjustQty) return;
    setActionLoading(true);
    try {
      await adminService.adjustStock(stockModalProduct.id, {
        quantity: parseInt(adjustQty, 10),
        reason: adjustReason,
      });
      setStockModalProduct(null);
      setAdjustQty('');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Catalog Management
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Sarees & Ethnic Wear Products
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage product inventory, pricing, SKUs, and online storefront visibility
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/admin/products/new">
            <Button variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Name, Fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32]"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32] bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32] bg-white"
          >
            <option value="">All Inventory Statuses</option>
            <option value="low">Low Stock (≤ 4)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32] bg-white"
          >
            <option value="">All Publishing Statuses</option>
            <option value="active">Active (Published)</option>
            <option value="inactive">Inactive (Draft)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button type="submit" variant="primary" size="sm" className="w-full bg-[#641B32] hover:bg-[#7B1E35]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Apply Filters</span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setStockFilter('');
              setStatusFilter('');
              setSearchParams({});
            }}
            className="px-3 py-2 border border-neutral-200 rounded text-xs text-neutral-600 hover:bg-neutral-50"
            title="Reset filters"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5 w-14">Image</th>
                <th className="px-4 py-3.5">Product Details</th>
                <th className="px-4 py-3.5">SKU / Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price & MRP</th>
                <th className="px-4 py-3.5 bg-amber-50/50">Purchase Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-neutral-500">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={primaryImg}
                          alt={product.name}
                          className="w-11 h-14 object-cover rounded border border-neutral-200 shadow-xs"
                        />
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-[#292323] hover:text-[#641B32] transition-colors line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {product.fabric || 'Pure Handloom'} • {product.color || 'Multi'}
                        </div>
                        {product.isFeatured && (
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-[#641B32] bg-[#641B32]/5 px-2 py-1 rounded text-[11px]">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {product.categories?.[0]?.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#292323]">{formatPrice(product.sellingPrice)}</div>
                        {product.mrp && (
                          <div className="text-[10px] text-neutral-400 line-through">
                            {formatPrice(product.mrp)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 bg-amber-50/40 font-mono text-neutral-700 font-medium">
                        {product.purchasePrice ? formatPrice(product.purchasePrice) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setStockModalProduct(product)}
                          className="group text-left"
                          title="Click to adjust stock"
                        >
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              product.stockQuantity === 0
                                ? 'bg-rose-100 text-rose-800'
                                : product.stockQuantity <= 4
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span>{product.stockQuantity} in stock</span>
                          </span>
                          <span className="block text-[9px] text-neutral-400 group-hover:text-[#641B32] underline mt-0.5">
                            Quick adjust
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                            product.isActive ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        <span className="text-[11px] font-medium text-neutral-600">
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100"
                            title="Preview on storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-neutral-600 hover:text-[#641B32] rounded hover:bg-neutral-100"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(product.id, product.name)}
                            className="p-1.5 text-neutral-600 hover:text-blue-600 rounded hover:bg-neutral-100"
                            title="Duplicate as new draft"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} products)
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

      {/* Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#292323] font-heading">
              Adjust Inventory Quantity
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Adjust stock for <span className="font-semibold text-[#641B32]">{stockModalProduct.name}</span> ({stockModalProduct.sku})
            </p>

            <form onSubmit={handleStockAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  New Absolute Stock Count
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder={`Current count: ${stockModalProduct.stockQuantity}`}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded text-sm focus:outline-none focus:border-[#641B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason for Adjustment (Audit Log)
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded text-sm focus:outline-none focus:border-[#641B32]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 border border-neutral-200 rounded text-xs text-neutral-600 hover:bg-neutral-50"
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
                  {actionLoading ? 'Saving...' : 'Update Inventory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
