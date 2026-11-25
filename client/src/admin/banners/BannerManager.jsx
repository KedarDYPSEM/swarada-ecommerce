import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  Video,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import adminService from '../../services/adminService';
import ImageUploader from '../components/ImageUploader';

const BANNER_TYPES = ['HERO', 'PROMOTIONAL', 'POPUP', 'CATEGORY'];

export const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    mobileImageUrl: '',
    videoUrl: '',
    isVideo: false,
    showText: true,
    linkUrl: '/shop',
    type: 'HERO',
    displayOrder: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBanners();
      if (res && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      mobileImageUrl: '',
      videoUrl: '',
      isVideo: false,
      showText: true,
      linkUrl: '/shop',
      type: 'HERO',
      displayOrder: banners.length,
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      mobileImageUrl: b.mobileImageUrl || '',
      videoUrl: b.videoUrl || '',
      isVideo: Boolean(b.isVideo || b.videoUrl),
      showText: b.showText !== undefined ? Boolean(b.showText) : true,
      linkUrl: b.linkUrl || '/shop',
      type: b.type || 'HERO',
      displayOrder: b.displayOrder || 0,
      isActive: Boolean(b.isActive),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleBannerVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      const res = await adminService.uploadVideo(file);
      if (res?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          videoUrl: res.data.url,
          isVideo: true,
          imageUrl: prev.imageUrl || res.data.url,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setVideoUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
      } else {
        await adminService.createBanner(payload);
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await adminService.deleteBanner(id);
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
            Visual Merchandising
          </span>
          <h1 className="text-2xl font-heading font-bold text-[#292323]">
            Homepage Banners & Hero Slides
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure dynamic homepage slideshows, festival sales, and call-to-action link targets
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="sm"
          className="bg-[#641B32] hover:bg-[#7B1E35]"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Banner</span>
        </Button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-neutral-400 animate-pulse">
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-neutral-500">
            No banners active. Create your first slide above.
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 bg-neutral-900 group">
                {b.isVideo && (b.videoUrl || b.imageUrl) ? (
                  <video
                    src={b.videoUrl || b.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C5A05A] text-white">
                    {b.type}
                  </span>
                  {b.isVideo && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#641B32] text-white flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      b.showText !== false
                        ? 'bg-emerald-800/80 text-white'
                        : 'bg-purple-800/80 text-white'
                    }`}
                  >
                    {b.showText !== false ? 'Text Overlay: ON' : 'Text Overlay: OFF'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/60 text-white">
                    #{b.displayOrder}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-base font-heading font-bold line-clamp-1">{b.title}</div>
                  {b.subtitle && (
                    <div className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                      {b.subtitle}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs border-t border-neutral-100">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Link Target:</div>
                  <div className="font-mono text-[#641B32]">{b.linkUrl || '/shop'}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      b.isActive ? 'bg-emerald-500' : 'bg-neutral-400'
                    }`}
                  />
                  <span className="text-[11px] text-neutral-600 mr-2">
                    {b.isActive ? 'Active' : 'Disabled'}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-neutral-600 hover:text-[#641B32] rounded hover:bg-neutral-100"
                    title="Edit Banner"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-lg font-bold text-[#292323] font-heading">
              {editingBanner ? 'Edit Banner Slide' : 'Create New Banner'}
            </h3>
            <p className="text-neutral-500 mt-1">
              Configure hero photography, video loops, text overlays, and destination links.
            </p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Text Overlay Toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showText}
                      onChange={(e) => setFormData({ ...formData, showText: e.target.checked })}
                      className="w-4 h-4 rounded text-[#641B32] focus:ring-[#641B32]"
                    />
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      {formData.showText ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                      Display Text & Button Overlay
                    </span>
                  </label>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      formData.showText
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {formData.showText ? 'Overlay Visible' : 'Overlay Hidden'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {formData.showText
                    ? 'Headline, subtitle, and CTA button will be overlaid on top of the banner.'
                    : 'Text overlay is turned off. The entire banner graphic is clickable. Ideal when your graphic banner or video already has designed text.'}
                </p>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Main Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Authentic Yeola Paithani Sarees"
                  className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                />
              </div>

              {formData.showText && (
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Sub-heading / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Handcrafted in pure silk with tested metallic zari"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:border-[#641B32]"
                  />
                </div>
              )}

              {/* Hero Video Banner Section */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVideo}
                      onChange={(e) => setFormData({ ...formData, isVideo: e.target.checked })}
                      className="w-4 h-4 rounded text-[#641B32] focus:ring-[#641B32]"
                    />
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#641B32]" />
                      Hero Background Video Loop
                    </span>
                  </label>
                  {formData.isVideo && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#641B32] text-white">
                      Video Mode Active
                    </span>
                  )}
                </div>

                {formData.isVideo && (
                  <div className="space-y-2 pt-1 border-t border-neutral-200/80">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <label className="inline-flex items-center justify-center px-3 py-1.5 rounded bg-[#641B32] hover:bg-[#7B1E35] text-white text-xs font-semibold cursor-pointer shrink-0">
                        <Video className="w-3.5 h-3.5 mr-1" />
                        <span>{videoUploading ? 'Uploading...' : 'Upload Video File'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/ogg"
                          onChange={handleBannerVideoUpload}
                          disabled={videoUploading}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={formData.videoUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            videoUrl: e.target.value,
                            imageUrl: formData.imageUrl || e.target.value,
                          })
                        }
                        placeholder="Or paste video URL (/uploads/... or .mp4)"
                        className="w-full sm:flex-1 px-3 py-1.5 border border-neutral-200 rounded bg-white text-xs font-mono"
                      />
                    </div>

                    {formData.videoUrl && (
                      <div className="relative h-28 bg-black rounded overflow-hidden">
                        <video
                          src={formData.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-neutral-500">
                      The desktop image below serves as the fallback poster if the video is loading or unsupported.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Desktop Hero Photography (1920×700 Recommended){' '}
                  {!formData.isVideo && <span className="text-rose-500">*</span>}
                </label>
                <ImageUploader
                  value={formData.imageUrl}
                  onChange={(newUrl) => setFormData({ ...formData, imageUrl: newUrl })}
                  label="Upload Desktop Banner"
                  placeholder="e.g. Upload photo from computer or paste image URL..."
                  aspectRatio="banner"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Mobile Hero Photography (Optional, 800×800)
                </label>
                <ImageUploader
                  value={formData.mobileImageUrl}
                  onChange={(newUrl) => setFormData({ ...formData, mobileImageUrl: newUrl })}
                  label="Upload Mobile Banner"
                  placeholder="e.g. Upload mobile photo or paste image URL..."
                  aspectRatio="square"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Banner Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded bg-white"
                  >
                    {BANNER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Destination Link URL
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/shop or /category/paithani"
                    className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded"
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
                    <span className="font-semibold text-neutral-700">Active (Live on Website)</span>
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
                  {actionLoading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;
