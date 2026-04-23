import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Globe, User as UserIcon, LogOut, Settings, Key } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';

export const DashboardHeader = ({ onMenuClick, sidebarCollapsed, onCollapseToggle }) => {
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/all');
    } catch (e) {
      console.error('Logout error', e);
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

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-brand-text-sec hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Desktop sidebar toggle - optional if we put it in sidebar, but putting it here or sidebar works */}
        <button 
          onClick={onCollapseToggle}
          className="hidden lg:flex p-2 text-brand-text-sec hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">+</span>
          </div>
        </Link>
      </div>

      {/* Center - Search (Desktop) */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-xl px-8">
        <button className="w-full bg-[#FAFDF9] border border-brand-border rounded-xl px-4 py-2.5 flex items-center gap-3 text-brand-text-sec hover:border-brand-green/50 hover:bg-white transition-all group">
          <Search size={18} className="group-hover:text-brand-green transition-colors" />
          <span className="flex-1 text-left text-sm">मरीज़ या feature खोजें...</span>
          <span className="text-[10px] font-bold border border-brand-border rounded bg-white px-1.5 py-0.5 shadow-sm">⌘K</span>
        </button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="md:hidden p-2 text-brand-text-sec hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors">
          <Search size={20} />
        </button>

        <button onClick={() => navigate('/dashboard/notifications')} className="relative p-2 text-brand-text-sec hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-error rounded-full ring-2 ring-white"></span>
        </button>

        <button className="hidden sm:flex items-center gap-1.5 p-2 text-brand-text-sec hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors text-sm font-bold">
          <Globe size={20} />
          <span>EN</span>
        </button>

        <div className="h-6 w-px bg-brand-border mx-1"></div>

        {/* User Menu Trigger */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-brand-muted transition-colors border border-transparent hover:border-brand-border"
          >
            <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">
              {getInitials(user?.name)}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden py-2">
                <div className="px-4 py-3 border-b border-brand-border mb-2">
                  <p className="text-sm font-bold text-[#0F1F17] truncate">{user?.name}</p>
                  <p className="text-xs text-[#4A6258] mt-0.5 truncate">{tenant?.name}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-sm text-[#0F1F17] hover:bg-brand-muted hover:text-brand-green flex items-center gap-2">
                  <UserIcon size={16} /> My Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-[#0F1F17] hover:bg-brand-muted hover:text-brand-green flex items-center gap-2">
                  <Key size={16} /> Change Password
                </button>
                {user?.role === 'admin' && (
                  <button className="w-full text-left px-4 py-2 text-sm text-[#0F1F17] hover:bg-brand-muted hover:text-brand-green flex items-center gap-2">
                    <Settings size={16} /> Clinic Settings
                  </button>
                )}
                
                <div className="h-px bg-brand-border my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-brand-error hover:bg-brand-errorBg flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
