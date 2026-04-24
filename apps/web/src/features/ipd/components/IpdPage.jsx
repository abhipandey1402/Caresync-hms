import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Bed, UserPlus, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BedMap } from './BedMap';
import { AdmissionDialog } from './AdmissionDialog';
import { AdmissionList } from './AdmissionList';
import { IpdSettings } from './IpdSettings';

export const IpdPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bed-map';
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'bed-map', label: 'Bed Map', icon: LayoutGrid },
    { id: 'admissions', label: 'Admissions', icon: Bed },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Management"
        titleHi="आईपीडी प्रबंधन"
        subtitle="Manage wards, beds, and patient admissions"
        actions={
          <button 
            onClick={() => setIsAdmissionOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-bold rounded-xl text-sm hover:bg-brand-green-dark transition-colors"
          >
            <UserPlus size={16} /> New Admission
          </button>
        }
      />

      <div className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden">
        <div className="flex space-x-1 border-b border-brand-border px-4 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

        <div className="p-6">
          {currentTab === 'bed-map' && <BedMap key={refreshKey} />}
          {currentTab === 'admissions' && <AdmissionList />}
          {currentTab === 'settings' && <IpdSettings />}
        </div>
      </div>

      <AdmissionDialog 
        isOpen={isAdmissionOpen} 
        onClose={() => setIsAdmissionOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};
