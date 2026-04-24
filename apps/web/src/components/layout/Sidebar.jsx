import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Stethoscope, Receipt, 
  Pill, BedDouble, FileText, BarChart3, 
  Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const NAV_ITEMS = [
  {
    section: 'MAIN',
    items: [
      { id: 'home', label: 'Dashboard', icon: Home, href: '/dashboard', roles: ['admin', 'doctor', 'receptionist', 'pharmacist', 'nurse'] },
      { id: 'patients', label: 'Patients', icon: Users, href: '/dashboard/patients', roles: ['admin', 'doctor', 'receptionist'] },
      { id: 'opd', label: 'OPD Queue', icon: Stethoscope, href: '/dashboard/opd', roles: ['admin', 'doctor', 'receptionist', 'nurse'], badge: { type: 'count', value: '3' } },
      { id: 'billing', label: 'Billing', icon: Receipt, href: '/dashboard/billing', roles: ['admin', 'receptionist', 'billing', 'doctor', 'pharmacist'], badge: { type: 'warning', value: '2' } }
    ]
  },
  {
    section: 'CLINICAL',
    items: [
      { id: 'pharmacy', label: 'Pharmacy', icon: Pill, href: '/dashboard/pharmacy', roles: ['admin', 'pharmacist', 'doctor'], badge: { type: 'alert', value: '!' } },
      { id: 'ipd', label: 'IPD', icon: BedDouble, href: '/dashboard/ipd', roles: ['admin', 'doctor', 'nurse', 'receptionist'], badge: { type: 'grey', value: '12/20' } },
      { id: 'rx', label: 'Prescriptions', icon: FileText, href: '/dashboard/prescriptions', roles: ['admin', 'doctor', 'pharmacist'] }
    ]
  },
  {
    section: 'ADMIN',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports', roles: ['admin'] },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['admin'] }
    ]
  }
];

export const Sidebar = ({ collapsed = false, onNavClick }) => {
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const userRole = user?.role || 'receptionist';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/all');
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
      addToast('Logged out successfully', 'success');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderBadge = (badge, isCollapsed) => {
    if (!badge) return null;
    
    if (isCollapsed) {
      return (
        <span className={cn(
          "absolute top-1 right-1 w-2 h-2 rounded-full",
          badge.type === 'alert' && "bg-red-500",
          badge.type === 'count' && "bg-brand-green",
          badge.type === 'warning' && "bg-brand-gold",
          badge.type === 'grey' && "bg-gray-400"
        )} />
      );
    }

    return (
      <span className={cn(
        "ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
        badge.type === 'alert' && "bg-brand-errorBg text-brand-error",
        badge.type === 'count' && "bg-[#EDF4EF] text-[#1A6B3C]",
        badge.type === 'warning' && "bg-[#FDF4E7] text-[#92400E]",
        badge.type === 'grey' && "bg-gray-100 text-gray-600"
      )}>
        {badge.value}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Brand area */}
      <div className={cn(
        "h-16 flex items-center shrink-0 border-b border-brand-border",
        collapsed ? "justify-center px-0" : "px-6"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">+</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">+</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#0F1F17]">CareSync</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {NAV_ITEMS.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <div className="px-6 mb-2 text-[10px] font-bold text-[#4A6258] uppercase tracking-wider">
                  {section.section}
                </div>
              )}
              
              <ul className="space-y-1 px-3">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="relative group">
                      <NavLink
                        to={item.href}
                        onClick={onNavClick}
                        className={({ isActive }) => cn(
                          "flex items-center rounded-lg transition-colors relative",
                          collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 gap-3",
                          isActive 
                            ? "bg-[#EDF4EF] text-brand-green font-bold" 
                            : "text-[#4A6258] hover:bg-[#F4FAF6] hover:text-brand-green font-medium"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && !collapsed && (
                              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-green rounded-r-full" />
                            )}
                            {isActive && collapsed && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-green rounded-full" />
                            )}
                            
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                            
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-sm whitespace-nowrap">{item.label}</span>
                                {renderBadge(item.badge, false)}
                              </>
                            )}

                            {collapsed && renderBadge(item.badge, true)}
                          </>
                        )}
                      </NavLink>
                      
                      {/* Tooltip for collapsed state (custom CSS tooltip fallback if radix is missing) */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#0F1F17] text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] px-1 py-0.5 rounded uppercase leading-none",
                              item.badge.type === 'alert' && "bg-red-500/20 text-red-300",
                              item.badge.type === 'count' && "bg-brand-green/20 text-brand-green-light",
                              item.badge.type === 'warning' && "bg-brand-gold/20 text-brand-gold",
                              item.badge.type === 'grey' && "bg-white/20 text-white"
                            )}>
                              {item.badge.value}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="shrink-0 border-t border-brand-border p-3">
        {collapsed ? (
          <button 
            onClick={handleLogout}
            className="w-10 h-10 mx-auto rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center hover:bg-brand-errorBg hover:text-brand-error transition-colors relative group"
          >
            <div className="group-hover:hidden font-bold text-sm">{getInitials(user?.name)}</div>
            <LogOut size={18} className="hidden group-hover:block" />
            
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-brand-error text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F1F17] truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-muted text-brand-text-sec uppercase">
                  {user?.role || 'Staff'}
                </span>
                <span className="text-xs text-[#4A6258] truncate">{tenant?.name || 'Clinic'}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[#4A6258] hover:text-brand-error hover:bg-brand-errorBg p-1.5 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
