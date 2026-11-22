import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image,
  Info,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';
import ImageUploader from '../components/ImageUploader';

export const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    shortDescription: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    gstRate: '5',
    stockQuantity: '10',
    lowStockThreshold: '3',
    fabric: '',
    color: '',
    sareeLength: '',
    blouseDetails: '',
    washingInstructions: '',
    occasion: '',
    weaveType: '',
    zariType: '',
    includesBlouse: true,
    isHandloom: true,
    isFeatured: false,
    isActive: true,
    categoryIds: [],
    images: [
      {
        url: '',
        altText: '',
        isPrimary: true,
        displayOrder: 0,
      },
    ],
    variants: [],
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminService.getCategories();
        if (res && res.data) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const loadProduct = async () => {
        try {
          const res = await adminService.getProductById(id);
          if (res && res.data) {
            const p = res.data;
            setFormData({
              name: p.name || '',
              slug: p.slug || '',
              sku: p.sku || '',
              barcode: p.barcode || '',
              shortDescription: p.shortDescription || '',
              description: p.description || '',
              purchasePrice: p.purchasePrice !== null ? p.purchasePrice.toString() : '',
              sellingPrice: p.sellingPrice ? p.sellingPrice.toString() : '',
              mrp: p.mrp ? p.mrp.toString() : '',
              gstRate: p.gstRate ? p.gstRate.toString() : '5',
              stockQuantity: p.stockQuantity ? p.stockQuantity.toString() : '0',
              lowStockThreshold: p.lowStockThreshold ? p.lowStockThreshold.toString() : '3',
              fabric: p.fabric || '',
              color: p.color || '',
              sareeLength: p.sareeLength || '',
              blouseDetails: p.blouseDetails || '',
              washingInstructions: p.washingInstructions || '',
              occasion: p.occasion || '',
              weaveType: p.weaveType || '',
              zariType: p.zariType || '',
              includesBlouse: Boolean(p.includesBlouse),
              isHandloom: Boolean(p.isHandloom),
              isFeatured: Boolean(p.isFeatured),
              isActive: Boolean(p.isActive),
              categoryIds: p.categories?.map((c) => c.categoryId) || [],
              images: p.images?.length > 0 ? p.images : [{ url: '', altText: '', isPrimary: true, displayOrder: 0 }],
              variants: p.variants?.map((v) => ({
                id: v.id,
                variantValue: v.variantValue || '',
                colorCode: v.colorCode || '#9B2226',
                imageUrl: v.imageUrl || '',
                stockQuantity: v.stockQuantity !== undefined ? v.stockQuantity.toString() : '10',
                sku: v.sku || '',
              })) || [],
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch product');
        } finally {
          setInitialLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEdit]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, name: val, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleCategoryToggle = (catId) => {
    setFormData((prev) => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((cid) => cid !== catId)
          : [...prev.categoryIds, catId],
      };
    });
  };

  const handleImageChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      return { ...prev, images: updated };
    });
  };

  const handleAddImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: '',
          altText: 'Product View',
          isPrimary: prev.images.length === 0,
          displayOrder: prev.images.length,
        },
      ],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          variantValue: '',
          colorCode: '#9B2226',
          imageUrl: '',
          stockQuantity: '10',
          sku: '',
        },
      ],
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => {
      const updated = (prev.variants || []).filter((_, i) => i !== index);
      return { ...prev, variants: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validVariants = formData.variants
        ? formData.variants
            .filter((v) => (v.variantValue && v.variantValue.trim()) || v.imageUrl)
            .map((v) => ({
              id: v.id,
              variantName: 'Color',
              variantValue: v.variantValue.trim(),
              colorCode: v.colorCode || null,
              imageUrl: v.imageUrl || null,
              stockQuantity: v.stockQuantity !== '' ? parseInt(v.stockQuantity, 10) || 0 : 0,
              sku: v.sku || undefined,
            }))
        : [];

      const totalStock =
        validVariants.length > 0
          ? validVariants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)
          : formData.stockQuantity !== ''
          ? parseInt(formData.stockQuantity, 10) || 0
          : 10;

      const payload = {
        ...formData,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        sellingPrice: parseFloat(formData.sellingPrice),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        gstRate: parseFloat(formData.gstRate) || 5,
        stockQuantity: totalStock,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 3,
        barcode: formData.barcode?.trim() || null,
        images: formData.images.filter((img) => img.url && img.url.trim() !== ''),
        variants: validVariants,
      };

      if (isEdit) {
        await adminService.updateProduct(id, payload);
      } else {
        await adminService.createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-12 text-center text-sm text-neutral-500 animate-pulse">Loading product details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products"
            className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
              {isEdit ? 'Edit Saree' : 'New Product Entry'}
            </span>
            <h1 className="text-2xl font-heading font-bold text-[#292323]">
              {isEdit ? formData.name || 'Edit Product' : 'Add Saree to Catalog'}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            size="sm"
            disabled={loading}
            className="bg-[#641B32] hover:bg-[#7B1E35]"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Saree' : 'Publish Saree'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Information */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#292323] border-b border-neutral-100 pb-2">
            1. Core Identification & SKU
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Product Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Peshwai Double Pallu Paithani Saree"
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
                className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] bg-neutral-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Unique Product Code / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. S7B3 or P102"
                className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-mono uppercase font-bold text-[#641B32]"
              />
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Matches the tags in the Kolhapur physical store for instant barcode search.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Physical Barcode / Tag ID
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="890123456789"
                className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#292323] border-b border-neutral-100 pb-2">
            2. Pricing, Margin & Stock Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/70">
              <label className="block font-semibold text-amber-900 mb-1">
                Purchase Price (Admin Only)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="9500"
                  className="w-full pl-7 pr-3 py-1.5 border border-amber-300 rounded focus:outline-none focus:border-[#641B32] bg-white font-medium"
                />
              </div>
              <p className="text-[9px] text-amber-800 mt-1">Never shown to public customers</p>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Selling Price (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="14999"
                  className="w-full pl-7 pr-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-bold text-[#641B32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                MRP (Strikethrough)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  placeholder="18999"
                  className="w-full pl-7 pr-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                GST Rate (%)
              </label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] bg-white"
              >
                <option value="0">0% (Nil)</option>
                <option value="5">5% (Handloom Sarees)</option>
                <option value="12">12% (Ready-made garments)</option>
                <option value="18">18% (Luxury accessories)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Current Stock Qty <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                readOnly={formData.variants && formData.variants.length > 0}
                value={
                  formData.variants && formData.variants.length > 0
                    ? formData.variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)
                    : formData.stockQuantity
                }
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className={`w-full px-3 py-1.5 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32] font-semibold ${
                  formData.variants && formData.variants.length > 0
                    ? 'bg-amber-50/70 text-[#641B32] cursor-not-allowed border-amber-300'
                    : ''
                }`}
              />
              {formData.variants && formData.variants.length > 0 && (
                <p className="text-[10px] text-amber-800 font-medium mt-1">
                  ⚡ Auto-summed from {formData.variants.length} color variants ({formData.variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)} pcs total)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specifications & Textile Details */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#292323] border-b border-neutral-100 pb-2">
            3. Authentic Handloom Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Fabric</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                placeholder="Pure Katan Silk / Chanderi"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Colour</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Maroon with Gold Zari"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Saree Length</label>
              <input
                type="text"
                value={formData.sareeLength}
                onChange={(e) => setFormData({ ...formData, sareeLength: e.target.value })}
                placeholder="5.5 meters"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Blouse Details</label>
              <input
                type="text"
                value={formData.blouseDetails}
                onChange={(e) => setFormData({ ...formData, blouseDetails: e.target.value })}
                placeholder="0.8 m unstitched matching piece"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Weave Technique</label>
              <input
                type="text"
                value={formData.weaveType}
                onChange={(e) => setFormData({ ...formData, weaveType: e.target.value })}
                placeholder="Handloom / Jacquard Weave"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Zari Quality</label>
              <input
                type="text"
                value={formData.zariType}
                onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                placeholder="Tested Metallic Gold Zari"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Occasion</label>
              <input
                type="text"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                placeholder="Wedding, Festive, Engagement"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Washing / Care</label>
              <input
                type="text"
                value={formData.washingInstructions}
                onChange={(e) => setFormData({ ...formData, washingInstructions: e.target.value })}
                placeholder="Dry Clean Only"
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Short Summary (Catalog)</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Authentic Yeola Paithani woven with real peacock motifs."
                className="w-full px-3 py-1.5 border border-neutral-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Full Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed story of the weave, legacy, pallu design..."
                className="w-full px-3 py-1.5 border border-neutral-200 rounded font-sans"
              />
            </div>
          </div>
        </div>

        {/* Categories Selection */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-3">
          <h2 className="text-sm font-heading font-bold text-[#292323] border-b border-neutral-100 pb-2">
            4. Categories & Collections
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
            {categories.map((c) => (
              <label
                key={c.id}
                className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                  formData.categoryIds.includes(c.id)
                    ? 'border-[#641B32] bg-[#641B32]/5 text-[#641B32] font-semibold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(c.id)}
                  onChange={() => handleCategoryToggle(c.id)}
                  className="rounded text-[#641B32] focus:ring-[#641B32]"
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Images Gallery */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-heading font-bold text-[#292323]">
                5. Product Gallery & Photography
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Upload photos from your computer or enter high-resolution image URLs.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={handleAddImage}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Photo Slot</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.images.map((img, idx) => (
              <div
                key={idx}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A05A]">
                    {img.isPrimary ? '★ Primary Cover Image' : `Gallery Image #${idx + 1}`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        img.isPrimary
                          ? 'bg-[#C5A05A] text-white'
                          : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {img.isPrimary ? 'Cover Image' : 'Set As Cover'}
                    </button>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <ImageUploader
                  value={img.url}
                  onChange={(newUrl) => handleImageChange(idx, 'url', newUrl)}
                  label="Upload Photo"
                  placeholder="e.g. Upload photo from computer or paste image URL..."
                />

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Photo Description / Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pallu close-up, Zari border detail, Pleats view"
                    value={img.altText}
                    onChange={(e) => handleImageChange(idx, 'altText', e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded bg-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Color Variants & Specific Images */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-[#C5A05A]" />
                <h2 className="text-sm font-heading font-bold text-[#292323]">
                  6. Color Variants & Separate Images
                </h2>
              </div>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Add multiple color choices with separate photos, swatch colors, and stock counts.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddVariant}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Color Variant</span>
            </Button>
          </div>

          {(!formData.variants || formData.variants.length === 0) ? (
            <div className="text-center py-6 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400 text-xs">
              No color variants added yet. Click &quot;Add Color Variant&quot; above to add specific saree shades with distinct photos.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-amber-50/40 rounded-lg border border-amber-200/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-xs inline-block"
                        style={{ backgroundColor: v.colorCode || '#9B2226' }}
                      />
                      <span className="text-xs font-bold text-[#641B32]">
                        Color Variant #{idx + 1}: {v.variantValue || 'Untitled Shade'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove Color Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Color Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={v.variantValue}
                        onChange={(e) => handleVariantChange(idx, 'variantValue', e.target.value)}
                        placeholder="e.g. Peacock Blue, Rani Pink, Wine Red"
                        className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded bg-white"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Swatch Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={v.colorCode || '#9B2226'}
                          onChange={(e) => handleVariantChange(idx, 'colorCode', e.target.value)}
                          className="w-8 h-8 rounded border border-neutral-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={v.colorCode || '#9B2226'}
                          onChange={(e) => handleVariantChange(idx, 'colorCode', e.target.value)}
                          placeholder="#9B2226"
                          className="w-24 px-2 py-1.5 text-xs font-mono border border-neutral-200 rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Stock Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stockQuantity}
                        onChange={(e) => handleVariantChange(idx, 'stockQuantity', e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      value={v.imageUrl}
                      onChange={(newUrl) => handleVariantChange(idx, 'imageUrl', newUrl)}
                      label={`Photo for ${v.variantValue || `Color #${idx + 1}`}`}
                      placeholder="Upload photo or paste URL for this specific color..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggles & Visibility */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex flex-wrap gap-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-[#641B32] focus:ring-[#641B32]"
            />
            <span className="font-semibold text-neutral-800">Publish Immediately to Storefront</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded text-[#641B32] focus:ring-[#641B32]"
            />
            <span className="font-semibold text-neutral-800">Feature on Homepage Banner Grid</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHandloom}
              onChange={(e) => setFormData({ ...formData, isHandloom: e.target.checked })}
              className="rounded text-[#641B32] focus:ring-[#641B32]"
            />
            <span className="font-semibold text-neutral-800">Verified Authentic Handloom Tag</span>
          </label>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            className="bg-[#641B32] hover:bg-[#7B1E35] px-6"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
