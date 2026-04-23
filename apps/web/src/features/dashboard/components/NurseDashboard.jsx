import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useAuthStore } from '@/store/authStore';
import { BedDouble, Activity, Stethoscope, RefreshCw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { nurseVitalsDue, nursePendingCharges } from '../utils/mockData';

export const NurseDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`नमस्ते, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`Nursing Station · ${today}`}
        actions={
          <button 
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="p-2 bg-white border border-brand-border rounded-lg text-[#0F1F17] hover:bg-brand-muted"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard icon={<BedDouble size={20} />} title="Active IPD Patients" value="12" trend={{ direction: 'up', value: '3 admitted today', label: '' }} loading={loading} />
        <KPICard icon={<Activity size={20} />} title="Vitals Pending" value="4" trend={{ direction: 'down', value: 'Action req', label: '' }} highlight={true} loading={loading} />
        <KPICard icon={<Stethoscope size={20} />} title="OPD Waiting" value="8" trend={{ direction: 'neutral', value: 'Requires triage', label: '' }} loading={loading} />
      </div>

      {/* Row 2: Compact Bed Map */}
      <DashboardCard title="Compact Bed Map" action={{ label: 'Manage IPD Ward →', href: '/dashboard/ipd' }} loading={loading}>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-[#0F1F17] mb-3">General Ward <span className="text-brand-text-sec font-normal">(8/10 Occupied)</span></p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const bedNo = `G${String(i + 1).padStart(2, '0')}`;
                const status = i < 6 || i === 7 || i === 8 ? 'occupied' : i === 6 ? 'maintenance' : 'available';
                
                return (
                  <div key={i} className={cn(
                    "w-14 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors",
                    status === 'occupied' ? "bg-red-50 border-red-200" : 
                    status === 'maintenance' ? "bg-gray-100 border-gray-300" : 
                    "bg-[#EDF4EF] border-[#C8DDD0] hover:bg-[#C8DDD0]"
                  )}>
                    <span className="text-xs font-bold text-[#0F1F17]">{bedNo}</span>
                    <span className="text-[10px]">
                      {status === 'occupied' ? '🔴' : status === 'maintenance' ? '⚙️' : '✅'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#0F1F17] mb-3">Private Ward <span className="text-brand-text-sec font-normal">(2/4 Occupied)</span></p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const bedNo = `P${String(i + 1).padStart(2, '0')}`;
                const status = i < 2 ? 'occupied' : 'available';
                
                return (
                  <div key={i} className={cn(
                    "w-14 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors",
                    status === 'occupied' ? "bg-red-50 border-red-200" : "bg-[#EDF4EF] border-[#C8DDD0] hover:bg-[#C8DDD0]"
                  )}>
                    <span className="text-xs font-bold text-[#0F1F17]">{bedNo}</span>
                    <span className="text-[10px]">
                      {status === 'occupied' ? '🔴' : '✅'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Row 3: Split lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="🩺 Vitals Due Today" action={{ label: 'View All', href: '/dashboard/ipd/vitals' }} loading={loading}>
          <div className="space-y-3">
            {nurseVitalsDue.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-brand-border last:border-0 hover:bg-brand-bg -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-brand-muted px-1.5 rounded">{p.bed}</span>
                    <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                  </div>
                  <p className="text-[11px] text-brand-text-sec mt-0.5">{p.dr} · {p.time}</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-bold text-brand-green hover:bg-brand-green hover:text-white transition-colors">
                  <Plus size={14} /> Record
                </button>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="🧾 IPD Daily Charges Pending" loading={loading}>
          <p className="text-xs text-brand-text-sec mb-4">Patients missing today's charge entries (Nursing/Visit fee)</p>
          <div className="space-y-3">
            {nursePendingCharges.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0 hover:bg-brand-bg -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-brand-muted px-1.5 rounded">{p.bed}</span>
                    <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                  </div>
                  <p className="text-[11px] text-brand-text-sec mt-0.5">Admitted Day {p.day}</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-bold text-[#0F1F17] hover:bg-[#0F1F17] hover:text-white transition-colors">
                  Add Charge
                </button>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
