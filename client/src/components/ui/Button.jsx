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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A05A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
      primary:
        'bg-[#641B32] text-white hover:bg-[#7B1E35] active:bg-[#4e1225] shadow-sm',
      secondary:
        'bg-[#FFF9F0] text-[#641B32] border border-[#C5A05A] hover:bg-[#FFF4E0] active:bg-[#FFECCE]',
      gold:
        'bg-[#C5A05A] text-white hover:bg-[#B38D48] active:bg-[#9E7A37] shadow-sm',
      outline:
        'border border-[#641B32] text-[#641B32] hover:bg-[#641B32] hover:text-white',
      ghost:
        'text-[#292323] hover:bg-[#FFF4E0] hover:text-[#641B32]',
      link:
        'text-[#641B32] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-11 px-6 py-2.5 rounded-sm text-sm tracking-wide',
      sm: 'h-9 px-4 py-1.5 rounded-sm text-xs tracking-wider uppercase',
      lg: 'h-13 px-8 py-3 rounded-sm text-base tracking-wide',
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
