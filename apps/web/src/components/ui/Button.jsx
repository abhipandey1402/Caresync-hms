import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200";
  const variants = {
    primary: "bg-brand-green text-white hover:bg-brand-greenMid shadow-soft hover:-translate-y-0.5",
    ghost: "bg-transparent text-brand-green hover:bg-brand-muted",
    outline: "border-2 border-brand-border text-brand-green hover:bg-brand-muted hover:-translate-y-0.5"
  };
  const sizes = {
    default: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    sm: "h-10 px-4 text-sm"
  };

  return (
    <button ref={ref} className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';
