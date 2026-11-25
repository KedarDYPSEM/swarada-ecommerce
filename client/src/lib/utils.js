import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Indian Rupee (₹) currency format
 * e.g. 14999 -> ₹14,999
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '₹0';
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(mrp, sellingPrice) {
  if (!mrp || !sellingPrice || mrp <= sellingPrice) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

/**
 * Extracts YouTube video ID from any standard YouTube URL
 * Supports watch?v=, youtu.be/, shorts/, embed/, live/
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

/**
 * Builds an autoplaying embed URL for YouTube
 */
export function getYouTubeEmbedUrl(
  url,
  { isBackground = false, autoPlay = true, loop = true, muted = true, controls = true } = {}
) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const params = new URLSearchParams();
  if (autoPlay) params.set('autoplay', '1');
  if (muted) params.set('mute', '1');
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  params.set('playsinline', '1');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  if (isBackground || !controls) {
    params.set('controls', '0');
    params.set('showinfo', '0');
    params.set('disablekb', '1');
  } else {
    params.set('controls', '1');
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
