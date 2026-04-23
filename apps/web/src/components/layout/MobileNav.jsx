import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Stethoscope, Receipt, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const MAIN_TABS = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'patients', label: 'Patients', icon: Users, href: '/dashboard/patients' },
  { id: 'opd', label: 'OPD', icon: Stethoscope, href: '/dashboard/opd' },
  { id: 'billing', label: 'Billing', icon: Receipt, href: '/dashboard/billing' }
];

export const MobileNav = ({ onMoreClick }) => {
  const userRole = useAuthStore(state => state.user?.role) || 'receptionist';
  
  // Quick role filtering for bottom nav - simple version
  const visibleTabs = MAIN_TABS.filter(tab => {
    if (userRole === 'pharmacist' && tab.id === 'opd') return false;
    if (userRole === 'nurse' && tab.id === 'billing') return false;
    return true;
  }).slice(0, 4);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.id}
              to={tab.href}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 relative",
                isActive ? "text-brand-green" : "text-[#4A6258] hover:text-brand-green"
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-brand-green rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
        
        <button 
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-[#4A6258] hover:text-brand-green"
        >
          <MoreHorizontal size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </div>
  );
};
