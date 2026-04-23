import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const EmptyState = ({ 
  icon, 
  title, 
  titleEn, 
  description, 
  action, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      
      <h3 className="font-display font-bold text-xl text-[#0F1F17] mb-1">
        {title}
      </h3>
      
      {titleEn && (
        <p className="text-sm font-medium text-brand-text-sec mb-2">
          {titleEn}
        </p>
      )}
      
      {description && (
        <p className="text-sm text-[#4A6258] max-w-[280px] mx-auto mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Link 
          to={action.href}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-mid transition-colors shadow-sm"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
};
