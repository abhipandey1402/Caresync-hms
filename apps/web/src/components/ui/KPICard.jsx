import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';

export const KPICard = ({
  icon,
  title,
  titleHi,
  value,
  trend,
  subStats,
  action,
  loading = false,
  error = null,
  highlight = false
}) => {
  if (loading) {
    return (
      <div className={cn(
        "bg-white border rounded-[14px] p-5 shadow-sm overflow-hidden relative",
        highlight ? "border-brand-gold/40" : "border-brand-border"
      )}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                {titleHi && <div className="h-3 bg-gray-200 rounded w-16"></div>}
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32 mt-4"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            {subStats && (
              <div className="space-y-2 pt-2 border-t border-gray-100 mt-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "bg-brand-errorBg border border-brand-error/20 rounded-[14px] p-5 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[160px]",
        highlight && "border-brand-gold"
      )}>
        <span className="font-bold text-brand-error mb-2">⚠️ Data load नहीं हुआ</span>
        <span className="text-sm text-brand-error/70">Please refresh the page</span>
      </div>
    );
  }

  const renderTrend = () => {
    if (!trend) return null;
    
    let colorClass, bgClass, Icon;
    switch (trend.direction) {
      case 'up':
        colorClass = 'text-brand-green';
        bgClass = 'bg-brand-green/10';
        Icon = ArrowUpRight;
        break;
      case 'down':
        colorClass = 'text-brand-error';
        bgClass = 'bg-brand-errorBg';
        Icon = ArrowDownRight;
        break;
      default:
        colorClass = 'text-brand-text-sec';
        bgClass = 'bg-brand-muted';
        Icon = Minus;
    }

    return (
      <div className="flex items-center gap-2 mt-2">
        <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold", colorClass, bgClass)}>
          <Icon size={14} strokeWidth={2.5} />
          <span>{trend.value}</span>
        </div>
        {trend.label && <span className="text-xs text-brand-text-sec font-medium">{trend.label}</span>}
      </div>
    );
  };

  const getSubStatColor = (color) => {
    switch(color) {
      case 'green': return 'text-brand-green';
      case 'gold': return 'text-brand-gold';
      case 'red': return 'text-brand-error';
      default: return 'text-brand-text-sec';
    }
  };

  const isZero = String(value).replace(/[^0-9]/g, '') === '0';

  return (
    <div className={cn(
      "bg-white border rounded-[14px] p-5 shadow-sm transition-all hover:shadow-md flex flex-col h-full",
      highlight ? "border-brand-gold ring-1 ring-brand-gold/20 bg-brand-gold/5" : "border-brand-border"
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          highlight ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-green/10 text-brand-green"
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-[#0F1F17] text-sm">{title}</h3>
          {titleHi && <p className="text-[11px] text-[#4A6258] font-medium leading-tight">{titleHi}</p>}
        </div>
      </div>

      <div className="mt-auto">
        <div className={cn("font-display font-bold text-3xl", isZero ? "text-brand-text-sec" : "text-[#0F1F17]")}>
          <AnimatedCounter value={value} duration={1} />
        </div>
        
        {isZero ? (
          <p className="text-xs text-brand-text-sec italic mt-2 font-medium">आज कोई transaction नहीं</p>
        ) : (
          renderTrend()
        )}
      </div>

      {subStats && subStats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-border space-y-1.5">
          {subStats.map((stat, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs font-medium">
              <span className="text-brand-text-sec">{stat.label}</span>
              <span className={cn("font-bold", getSubStatColor(stat.color))}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {action && (
        <Link 
          to={action.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-green hover:text-brand-green-mid hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
};
