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
