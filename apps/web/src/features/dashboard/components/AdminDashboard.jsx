import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { QuickActionsPanel } from '@/components/ui/QuickActionsPanel';
import { useAuthStore } from '@/store/authStore';
import { IndianRupee, Users, BedDouble, AlertCircle, Pill, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';

import { 
  adminRevenueData as revenueData,
  adminOpdHourlyData as opdHourlyData,
  adminTodayOpd,
  adminActiveIpd,
  adminPharmacyExpiring,
  adminPharmacyLowStock,
  adminDoctorCollection,
  adminRecentTransactions
} from '../utils/mockData';

export const AdminDashboard = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
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
        title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`${tenant?.name || 'Clinic'} · ${today}`}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-border rounded-lg text-sm font-medium text-[#0F1F17] hover:bg-brand-muted">
              <CalendarIcon size={16} /> Today
            </button>
            <button 
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="p-2 bg-white border border-brand-border rounded-lg text-[#0F1F17] hover:bg-brand-muted"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          icon={<IndianRupee size={20} />}
          title="Today's Revenue"
          titleHi="आज की कमाई"
          value="₹84,500"
          highlight={true}
          trend={{ direction: 'up', value: '12%', label: 'vs yesterday' }}
          subStats={[
            { label: 'Collected', value: '₹72,000', color: 'green' },
            { label: 'Pending', value: '₹12,500', color: 'gold' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<Users size={20} />}
          title="OPD Today"
          value="42"
          trend={{ direction: 'up', value: '5 more', label: '' }}
          subStats={[
            { label: 'Completed', value: '38', color: 'green' },
            { label: 'Pending', value: '4', color: 'gold' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<BedDouble size={20} />}
          title="Beds Occupied"
          value="12/20"
          trend={{ direction: 'neutral', value: '60%', label: 'occupancy' }}
          subStats={[
            { label: 'Admitted Today', value: '3', color: 'grey' },
            { label: 'Discharged', value: '1', color: 'grey' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<AlertCircle size={20} />}
          title="Pending Dues"
          value="₹28,400"
          trend={{ direction: 'down', value: '8 patients', label: '' }}
          action={{ label: 'Collect Now →', href: '/dashboard/billing' }}
          loading={loading}
        />
        <KPICard 
          icon={<Pill size={20} />}
          title="Pharma Sales"
          value="₹15,200"
          trend={{ direction: 'up', value: '18%', label: 'vs yest.' }}
          subStats={[
            { label: 'Items Sold', value: '23', color: 'grey' }
          ]}
          loading={loading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DashboardCard title="Revenue — Last 30 Days" loading={loading} className="h-96" noPadding>
          <div className="p-4 border-b border-brand-border flex gap-2">
            {['All', 'OPD', 'Pharmacy', 'IPD'].map(f => (
              <button key={f} className={`px-3 py-1 rounded-full text-xs font-bold ${f === 'All' ? 'bg-[#0F1F17] text-white' : 'bg-brand-muted text-brand-text-sec hover:bg-brand-border'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}K`} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="OPD" stackId="a" fill="#1A6B3C" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="Pharmacy" stackId="a" fill="#2E9B59" />
                <Bar dataKey="IPD" stackId="a" fill="#C8DDD0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="OPD by Hour" loading={loading} className="h-96" noPadding>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={opdHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E9B59" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E9B59" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="patients" stroke="#2E9B59" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Row 3: Live Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <DashboardCard 
          title="Today's OPD" 
          action={{ label: 'View All →', href: '/dashboard/opd' }}
          loading={loading}
        >
          <p className="text-xs text-brand-text-sec mb-4">42 total · 4 waiting · 38 done</p>
          <div className="space-y-3">
            {adminTodayOpd.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-brand-text-sec font-medium w-8">#{p.token}</span>
                  <div>
                    <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                    <p className="text-[11px] text-brand-text-sec">{p.dr}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-brand-gold/10 text-brand-gold">⏳ Wait</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard 
          title="Active IPD Patients" 
          action={{ label: 'View →', href: '/dashboard/ipd' }}
          loading={loading}
        >
          <p className="text-xs text-brand-text-sec mb-4">12 admitted · 8 general · 4 private</p>
          <div className="space-y-3">
            {adminActiveIpd.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div>
                  <p className="text-sm font-bold text-[#0F1F17] flex items-center gap-1">
                    {p.name} {p.tag && <span className="bg-blue-100 text-blue-700 text-[10px] px-1 rounded">A</span>}
                  </p>
                  <p className="text-[11px] text-brand-text-sec">{p.dr} · Day {p.day}</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#0F1F17]">{p.bed}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard 
          title="⚠️ Pharmacy Alerts" 
          action={{ label: 'View →', href: '/dashboard/pharmacy' }}
          loading={loading}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-brand-text-sec mb-2">EXPIRING SOON (3)</p>
              <div className="space-y-2">
                {adminPharmacyExpiring.map((p, idx) => (
                  <div key={idx} className={`border-l-2 ${idx === 0 ? 'border-red-500' : 'border-yellow-500'} pl-2`}>
                    <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                    <p className="text-[11px] text-brand-text-sec">Exp: {p.exp} · Qty: {p.qty}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-brand-text-sec mb-2">LOW STOCK (2)</p>
              {adminPharmacyLowStock.map((p, idx) => (
                <div key={idx} className="border-l-2 border-red-500 pl-2">
                  <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                  <p className="text-[11px] text-brand-text-sec">Qty: {p.qty} (min {p.min})</p>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Row 4: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <DashboardCard title="Doctor Collection — Today" action={{ label: 'Export', href: '#' }} loading={loading}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-text-sec border-b border-brand-border">
                <tr>
                  <th className="pb-2 font-medium">Doctor</th>
                  <th className="pb-2 font-medium text-center">OPD</th>
                  <th className="pb-2 font-medium text-right">Collected</th>
                  <th className="pb-2 w-1/3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {adminDoctorCollection.map((d, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-[#0F1F17]">{d.name}</td>
                    <td className="py-3 text-center">{d.opd}</td>
                    <td className="py-3 text-right font-mono font-bold">{d.collected}</td>
                    <td className="py-3 pl-4">
                      <div className="w-full bg-brand-muted h-2 rounded-full overflow-hidden">
                        <div className={`bg-brand-green h-full opacity-${d.opacity}`} style={{ width: d.progress }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-brand-bg font-bold">
                  <td className="py-3 text-[#0F1F17]">Total</td>
                  <td className="py-3 text-center">42</td>
                  <td className="py-3 text-right font-mono text-brand-green">₹84,500</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Transactions" action={{ label: 'View All', href: '/dashboard/billing' }} loading={loading}>
          <div className="space-y-4">
            {adminRecentTransactions.map((t, i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="mt-0.5">{t.status}</span>
                  <div>
                    <p className="text-sm font-bold text-[#0F1F17]">{t.name}</p>
                    <p className="text-[11px] text-brand-text-sec mt-0.5">{t.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-mono font-bold", t.amountColor || "text-[#0F1F17]")}>₹{t.amount}</p>
                  <p className="text-[11px] text-brand-text-sec mt-0.5">{t.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Row 5: Quick Actions */}
      <QuickActionsPanel />
    </div>
  );
};
