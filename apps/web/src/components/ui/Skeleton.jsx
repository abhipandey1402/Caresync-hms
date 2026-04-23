import React from 'react';

export const Skeleton = ({ variant = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-brand-border/40';
  
  const variants = {
    text: 'h-4 w-3/4 rounded',
    card: 'h-32 w-full rounded-xl',
    'table-row': 'h-12 w-full rounded-lg',
    avatar: 'h-10 w-10 rounded-full'
  };

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.text} ${className}`} />
  );
};
