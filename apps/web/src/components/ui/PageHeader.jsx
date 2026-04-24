import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PageHeader = ({ 
  title, 
  titleHi, 
  subtitle, 
  actions, 
  breadcrumb,
  className 
}) => {
  return (
    <div className={cn("mb-6 lg:mb-8", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm font-medium text-brand-text-sec mb-4">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
              {item.href ? (
                <Link to={item.href} className="hover:text-brand-green transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#0F1F17]">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-display font-bold text-[#0F1F17] leading-tight flex items-center gap-3">
            {title}
            {titleHi && <span className="text-brand-text-sec text-xl font-medium border-l border-brand-border pl-3 hidden sm:inline">{titleHi}</span>}
          </h1>
          {subtitle && (
            <p className="text-[#4A6258] mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:shrink-0 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
