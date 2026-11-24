import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-gradient-to-r from-[#641B32] to-[#851C3B] text-white shadow-xs',
    gold: 'bg-gradient-to-r from-[#D4AF37] to-[#B89230] text-[#1E1719] shadow-xs font-bold',
    secondary: 'bg-white/90 text-[#641B32] border border-[#D4AF37]/50 shadow-xs',
    discount: 'bg-emerald-700 text-white shadow-xs',
    outline: 'border border-[#D4AF37] text-[#641B32]',
    bestseller: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xs',
    new: 'bg-gradient-to-r from-[#7A1A31] to-[#480C1E] text-white shadow-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
