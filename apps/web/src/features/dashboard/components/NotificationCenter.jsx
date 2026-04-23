import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell, AlertTriangle, TrendingDown, IndianRupee, BedDouble, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { allNotifications as INITIAL_NOTIFICATIONS } from '../utils/mockData';

const TABS = ['All', 'Alerts', 'Billing', 'IPD', 'System'];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('All');

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Alerts') return n.type === 'alert' || n.type === 'low_stock';
    return n.type === activeTab.toLowerCase();
  });

  const groupedNotifications = filteredNotifications.reduce((acc, curr) => {
    if (!acc[curr.dateGroup]) acc[curr.dateGroup] = [];
    acc[curr.dateGroup].push(curr);
    return acc;
  }, {});

  const getIconForType = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={20} className="text-red-500" />;
      case 'low_stock': return <TrendingDown size={20} className="text-brand-gold" />;
      case 'billing': return <IndianRupee size={20} className="text-brand-gold" />;
      case 'ipd': return <BedDouble size={20} className="text-blue-500" />;
      case 'follow_up': return <Calendar size={20} className="text-brand-green" />;
      case 'system': return <Info size={20} className="text-gray-500" />;
      default: return <Bell size={20} className="text-brand-green" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Notifications" 
        actions={
          <button 
            onClick={handleMarkAllRead}
            disabled={!notifications.some(n => n.unread)}
            className="px-4 py-2 bg-white border border-brand-border rounded-lg text-sm font-bold text-[#0F1F17] hover:bg-brand-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Mark all read
          </button>
        }
      />

      <div className="bg-white border border-brand-border rounded-[14px] shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-brand-border overflow-x-auto hide-scrollbar bg-brand-bg/50">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab 
                  ? "border-brand-green text-brand-green bg-white" 
                  : "border-transparent text-brand-text-sec hover:text-[#0F1F17] hover:bg-white/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-brand-border">
          {filteredNotifications.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon={<CheckCircle2 size={40} />}
                title="कोई notification नहीं 🎉"
                titleEn="You're all caught up!"
                description={`No ${activeTab.toLowerCase()} notifications to show right now.`}
              />
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([group, items]) => (
              <div key={group}>
                <div className="bg-brand-bg/50 px-6 py-2 border-b border-brand-border text-[10px] font-bold text-brand-text-sec tracking-wider">
                  {group}
                </div>
                <div className="divide-y divide-brand-border/50">
                  <AnimatePresence>
                    {items.map(notification => (
                      <motion.div 
                        key={notification.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "px-6 py-4 flex gap-4 hover:bg-brand-bg/50 transition-colors group relative overflow-hidden",
                          notification.unread ? "bg-brand-green/5" : ""
                        )}
                      >
                        {notification.unread && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green" />
                        )}
                        
                        <div className="mt-1 relative">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            notification.type === 'alert' && "bg-red-50",
                            (notification.type === 'billing' || notification.type === 'low_stock') && "bg-orange-50",
                            notification.type === 'ipd' && "bg-blue-50",
                            notification.type === 'system' && "bg-gray-100",
                          )}>
                            {getIconForType(notification.type)}
                          </div>
                          {notification.unread && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-green rounded-full border-2 border-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                            <h4 className={cn("font-bold text-[#0F1F17] truncate", notification.unread ? "font-bold" : "font-medium")}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-brand-text-sec whitespace-nowrap shrink-0">{notification.time}</span>
                          </div>
                          <p className="text-sm text-brand-text-sec mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-brand-border text-brand-text-sec uppercase tracking-wider">
                              {notification.source}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0">
                          <button 
                            onClick={() => handleDismiss(notification.id)}
                            className="px-3 py-1.5 text-xs font-bold text-brand-text-sec hover:text-brand-error hover:bg-brand-errorBg rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                          {notification.action && (
                            <button className="px-3 py-1.5 text-xs font-bold bg-white border border-brand-border text-[#0F1F17] hover:bg-brand-muted rounded-lg transition-colors shadow-sm">
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredNotifications.length > 0 && (
          <div className="p-4 bg-brand-bg/50 border-t border-brand-border text-center">
            <button className="text-sm font-bold text-brand-green hover:underline">
              Load older notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
