import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Image,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';
import ImageUploader from '../components/ImageUploader';

export const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      if (res && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: '',
      description: '',
      imageUrl: '',
      displayOrder: categories.length,
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      parentId: category.parentId ? category.parentId.toString() : '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      displayOrder: category.displayOrder || 0,
      isActive: Boolean(category.isActive),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, name: val, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
        setSuccessMessage(`Category "${payload.name}" updated successfully! Changes are live on the storefront.`);
      } else {
        await adminService.createCategory(payload);
        setSuccessMessage(`Category "${payload.name}" created successfully!`);
      }

      setModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Taxonomy & Navigation
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Categories & Collections
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize sarees, dresses, and ethnic wear into parent and subcategories for the storefront
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          className="bg-[#641B32] hover:bg-[#7B1E35]"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Category</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5 w-12">Order</th>
                <th className="px-4 py-3.5">Category Name</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5">Hierarchy (Parent)</th>
                <th className="px-4 py-3.5">Products Count</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-400 animate-pulse">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-500">
                    No categories found. Create your first category above.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-neutral-400 font-medium">
                      #{c.displayOrder}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#641B32]/10 text-[#641B32] flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#292323]">{c.name}</div>
                          {c.description && (
                            <div className="text-[10px] text-neutral-400 line-clamp-1">
                              {c.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#641B32] text-[11px]">
                      /{c.slug}
                    </td>
                    <td className="px-4 py-3">
                      {c.parent ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                          <FolderTree className="w-3 h-3 text-neutral-400" />
                          <span>Child of {c.parent.name}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A05A]">
                          Top-Level Parent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-neutral-700">
                        {c._count?.productCategories || 0}
                      </span>
                      <span className="text-neutral-400 ml-1">items</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                          c.isActive ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-neutral-600">
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-neutral-600 hover:text-[#641B32] rounded hover:bg-neutral-100"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100"
                          title="Delete Category"
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

      {/* Modal Dialog for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#292323] font-heading">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Configure collection name, parent tier, and display position.
            </p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Paithani Sarees"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-mono bg-neutral-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Parent Category (Hierarchy)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] bg-white"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Cover Photography
                </label>
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={(newUrl) => setFormData((prev) => ({ ...prev, imageUrl: newUrl }))}
                  label="Upload Category Cover"
                  placeholder="e.g. Upload photo from computer or paste image URL..."
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief description for SEO and category banner..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#641B32] focus:ring-[#641B32]"
                    />
                    <span className="font-semibold text-neutral-700">Active (Visible)</span>
                  </label>
                </div>
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
                  {actionLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
