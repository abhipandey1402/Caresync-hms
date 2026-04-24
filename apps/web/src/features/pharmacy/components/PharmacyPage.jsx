import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { PharmacyTabs } from './PharmacyTabs';
import { InventoryTab } from './InventoryTab';
import { AlertsTab } from './AlertsTab';
import { POSTab } from './POSTab';

export const PharmacyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pos';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Dashboard"
        titleHi="फ़ार्मेसी डेस्क"
        subtitle="Manage inventory, batches, point-of-sale, and alerts"
        actions={<></>}
      />

      <div className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden">
        <PharmacyTabs activeTab={currentTab} onTabChange={handleTabChange} />
        
        <div className="p-6">
          {currentTab === 'pos' && <POSTab />}
          {currentTab === 'inventory' && <InventoryTab />}
          {currentTab === 'alerts' && <AlertsTab />}
          {currentTab === 'sales' && <div>Sales Log view coming soon...</div>}
        </div>
      </div>
    </div>
  );
};
