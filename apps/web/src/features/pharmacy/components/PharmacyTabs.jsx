import React from 'react';
import { ShoppingCart, Package, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PharmacyTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'alerts', label: 'Expiry & Alerts', icon: AlertTriangle },
    { id: 'sales', label: 'Sales Log', icon: FileText }
  ];

  return (
    <div className="flex space-x-1 border-b border-brand-border px-4 pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors border-b-2 outline-none',
              isActive
                ? 'border-brand-green text-brand-green bg-brand-green/5'
                : 'border-transparent text-[#6E857B] hover:text-[#4A6258] hover:bg-slate-50'
            )}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
