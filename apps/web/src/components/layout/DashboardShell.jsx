import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuthStore } from '@/store/authStore';
import { Pill, BedDouble, BarChart3, Settings, LogOut, X } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export const DashboardShell = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  
  const { tenant, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToast();

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

  const trialDaysLeft = () => {
    if (!tenant?.trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(tenant.trialEndsAt) - new Date()) / 86400000));
  };

  const isTrial = tenant?.isTrialActive;

  return (
    <div className="h-[100dvh] bg-[#FAFDF9] flex flex-col overflow-hidden">
      {/* Trial Banner */}
      {isTrial && (
        <div className="bg-brand-gold text-[#0F1F17] text-xs sm:text-sm font-bold py-2 px-4 text-center z-[60] flex items-center justify-center gap-2">
          <span>🎯 Trial — {trialDaysLeft()} days left</span>
          <button onClick={() => navigate('/dashboard/settings/billing')} className="underline hover:text-white transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Header */}
      <DashboardHeader 
        onMenuClick={() => setMobileSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(p => !p)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out border-r border-brand-border bg-white z-40 relative",
          sidebarCollapsed ? "w-16" : "w-[240px]"
        )}>
          <Sidebar collapsed={sidebarCollapsed} onNavClick={() => {}} />
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#0F1F17]/40 z-[60] lg:hidden backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[70] lg:hidden shadow-2xl"
              >
                <div className="absolute right-4 top-4 z-[80]">
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-2 bg-brand-bg rounded-full text-brand-text-sec hover:text-brand-green">
                    <X size={20} />
                  </button>
                </div>
                <Sidebar collapsed={false} onNavClick={() => setMobileSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 relative custom-scrollbar">
          <div className="p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav onMoreClick={() => setMoreSheetOpen(true)} />

      {/* Mobile More Sheet */}
      <AnimatePresence>
        {moreSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F1F17]/40 z-[60] lg:hidden backdrop-blur-sm"
              onClick={() => setMoreSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] lg:hidden shadow-2xl"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setMoreSheetOpen(false);
              }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-6" />
              
              <div className="px-6 pb-safe">
                <div className="space-y-1 mb-6">
                  {user?.role !== 'receptionist' && (
                    <button onClick={() => { navigate('/dashboard/pharmacy'); setMoreSheetOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-bg text-[#0F1F17] font-medium">
                      <Pill size={22} className="text-[#4A6258]" /> Pharmacy
                    </button>
                  )}
                  <button onClick={() => { navigate('/dashboard/ipd'); setMoreSheetOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-bg text-[#0F1F17] font-medium">
                    <BedDouble size={22} className="text-[#4A6258]" /> IPD
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => { navigate('/dashboard/reports'); setMoreSheetOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-bg text-[#0F1F17] font-medium">
                        <BarChart3 size={22} className="text-[#4A6258]" /> Reports
                      </button>
                      <button onClick={() => { navigate('/dashboard/settings'); setMoreSheetOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-bg text-[#0F1F17] font-medium">
                        <Settings size={22} className="text-[#4A6258]" /> Settings
                      </button>
                    </>
                  )}
                </div>

                <div className="border-t border-brand-border pt-4 pb-6">
                  <div className="flex items-center gap-3 px-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F1F17]">{user?.name}</p>
                      <p className="text-xs text-[#4A6258] uppercase font-bold">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-errorBg text-brand-error font-bold">
                    <LogOut size={22} /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
