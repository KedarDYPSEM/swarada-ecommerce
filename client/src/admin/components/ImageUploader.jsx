import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle, ExternalLink } from 'lucide-react';
import adminService from '../../services/adminService';

export const ImageUploader = ({
  value = '',
  onChange,
  label = 'Upload Image',
  placeholder = 'e.g. Upload photo or paste direct image URL...',
  className = '',
  aspectRatio = 'square', // 'square' | 'video' | 'banner'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await adminService.uploadImage(file);
      if (res && res.data && res.data.url) {
        // Store relative URL so it is always served via the current origin/protocol (HTTP/HTTPS)
        const normalized = res.data.url.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1');
        onChange(normalized);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const getAspectClass = () => {
    if (aspectRatio === 'banner') return 'h-36 sm:h-44 w-full';
    if (aspectRatio === 'video') return 'h-32 sm:h-40 w-full';
    return 'h-24 w-24';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
      />

      {/* Main Image Control Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#641B32] hover:bg-[#7B1E35] text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-2xs disabled:opacity-50 shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? 'Uploading...' : label}</span>
        </button>

        {/* URL Text Input (allows manual URL as alternative) */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 border border-neutral-200 rounded text-xs focus:outline-none focus:border-[#641B32] pr-8 bg-white"
          />
          {value ? (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-rose-600 cursor-pointer p-0.5"
              title="Clear Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      )}

      {/* Live Preview Container if Image Exists */}
      {value && (
        <div className="relative inline-block border border-neutral-200 rounded overflow-hidden bg-neutral-900 group">
          <img
            src={value.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1')}
            alt="Preview"
            className={`${getAspectClass()} object-cover object-center`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <a
              href={value.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/90 text-neutral-800 rounded-full hover:bg-white"
              title="Open full view"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-emerald-400 text-[9px] font-mono rounded flex items-center space-x-1">
            <CheckCircle className="w-2.5 h-2.5 inline" />
            <span>Ready</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
