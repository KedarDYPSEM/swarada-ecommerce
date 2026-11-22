import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-[#641B32] text-white',
    gold: 'bg-[#C5A05A] text-white',
    secondary: 'bg-[#FFF9F0] text-[#641B32] border border-[#C5A05A]',
    discount: 'bg-emerald-700 text-white',
    outline: 'border border-[#C5A05A] text-[#641B32]',
    bestseller: 'bg-amber-600 text-white',
    new: 'bg-[#7B1E35] text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase',
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
