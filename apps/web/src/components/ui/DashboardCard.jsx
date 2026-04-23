import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DashboardCard = ({ 
  title, 
  titleHi, 
  action, 
  loading = false, 
  error = null,
  onRetry,
  className, 
  children,
  noPadding = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white border border-brand-border rounded-[14px] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center bg-white/50">
        <div>
          <h3 className="font-display font-bold text-[#0F1F17] text-lg leading-tight">{title}</h3>
          {titleHi && <p className="text-xs text-[#4A6258] font-medium mt-0.5">{titleHi}</p>}
        </div>
        
        {action && (
          <Link 
            to={action.href}
            className="text-sm font-bold text-brand-green hover:text-brand-green-mid hover:underline flex items-center gap-1 transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
      
      <div className={cn("flex-1 relative", !noPadding && "p-5")}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-errorBg/50 text-brand-error z-10 p-4 text-center">
            <span className="font-bold mb-2">⚠️ Data load नहीं हुआ</span>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="px-4 py-2 bg-white rounded-lg shadow-sm border border-brand-error/20 text-sm font-bold hover:bg-brand-errorBg transition-colors"
              >
                Retry ↻
              </button>
            )}
          </div>
        ) : null}
        
        {children}
      </div>
    </motion.div>
  );
};
