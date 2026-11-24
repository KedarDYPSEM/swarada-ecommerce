import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      disabled = false,
      isLoading = false,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 tracking-wide';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#641B32] via-[#7A1A31] to-[#480C1E] text-white hover:opacity-95 shadow-md hover:shadow-xl rounded-full',
      secondary:
        'bg-white/90 text-[#641B32] border border-[#D4AF37]/50 hover:bg-[#FAF7F2] shadow-xs hover:shadow-md rounded-full',
      gold:
        'bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#C5A05A] text-[#1E1719] font-bold shadow-md hover:shadow-xl rounded-full gold-shimmer-btn',
      outline:
        'border-2 border-[#641B32] text-[#641B32] hover:bg-[#641B32] hover:text-white rounded-full',
      ghost:
        'text-[#1E1719] hover:bg-[#FAF7F2] hover:text-[#641B32] rounded-full',
      link:
        'text-[#641B32] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-11 px-6 py-2.5 rounded-full text-xs sm:text-sm tracking-wide',
      sm: 'h-9 px-4 py-1.5 rounded-full text-xs tracking-wider uppercase',
      lg: 'h-13 px-8 py-3.5 rounded-full text-sm sm:text-base tracking-wide',
      icon: 'h-10 w-10 rounded-full p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
