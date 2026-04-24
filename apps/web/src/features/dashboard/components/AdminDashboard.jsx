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

import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';

export const AdminDashboard = () => {
  const { user, tenant } = useAuthStore();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month', 'all'

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      let query = '';
      const now = new Date();
      if (dateFilter === 'today') {
        query = '?date=today';
      } else if (dateFilter === 'week') {
        const from = new Date(now);
        from.setDate(now.getDate() - 7);
        query = `?from=${from.toISOString()}&to=${now.toISOString()}`;
      } else if (dateFilter === 'month') {
        const from = new Date(now);
        from.setMonth(now.getMonth() - 1);
        query = `?from=${from.toISOString()}&to=${now.toISOString()}`;
      } else if (dateFilter === 'all') {
        const from = new Date('2020-01-01');
        query = `?from=${from.toISOString()}&to=${now.toISOString()}`;
      }

      const res = await api.get(`/reports/dashboard${query}`);
      setDashboardData(res.data?.data);
    } catch (err) {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      addToast(`Requesting ${type} export...`, 'info');
      const res = await api.post('/reports/export', { type, from: new Date().toISOString(), to: new Date().toISOString() });
      addToast(`Export requested! Job ID: ${res.data?.data?.jobId}`, 'success');
    } catch (err) {
      addToast('Failed to request export', 'error');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateFilter]);

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
            <div className="flex items-center bg-white border border-brand-border rounded-lg overflow-hidden">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: '7 Days' },
                { id: 'month', label: '30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-bold ${dateFilter === f.id ? 'bg-brand-green text-white' : 'text-brand-text-sec hover:bg-brand-muted'} border-r border-brand-border last:border-r-0`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button 
              onClick={fetchDashboard}
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
          value={`₹${((dashboardData?.revenue?.collected || 0) / 100).toLocaleString('en-IN')}`}
          highlight={true}
          trend={{ direction: 'up', value: 'Live', label: 'aggregation' }}
          subStats={[
            { label: 'Total', value: `₹${((dashboardData?.revenue?.total || 0) / 100).toLocaleString('en-IN')}`, color: 'grey' },
            { label: 'Pending', value: `₹${((dashboardData?.revenue?.pending || 0) / 100).toLocaleString('en-IN')}`, color: 'gold' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<Users size={20} />}
          title="OPD Today"
          value={dashboardData?.opd?.total || 0}
          trend={{ direction: 'neutral', value: dashboardData?.opd?.pending || 0, label: 'waiting' }}
          subStats={[
            { label: 'Completed', value: dashboardData?.opd?.completed || 0, color: 'green' },
            { label: 'Cancelled', value: dashboardData?.opd?.cancelled || 0, color: 'grey' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<BedDouble size={20} />}
          title="Beds Occupied"
          value={`${dashboardData?.ipd?.occupied || 0}/${dashboardData?.ipd?.total || 0}`}
          trend={{ direction: 'neutral', value: 'Live', label: 'occupancy' }}
          subStats={[
            { label: 'Admitted Today', value: dashboardData?.ipd?.admittedToday || 0, color: 'grey' },
            { label: 'Discharged', value: dashboardData?.ipd?.dischargedToday || 0, color: 'grey' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<AlertCircle size={20} />}
          title="Pending Dues"
          value={`₹${((dashboardData?.revenue?.pending || 0) / 100).toLocaleString('en-IN')}`}
          trend={{ direction: 'neutral', value: 'Action Required', label: '' }}
          action={{ label: 'Collect Now →', href: '/dashboard/billing' }}
          loading={loading}
        />
        <KPICard 
          icon={<Pill size={20} />}
          title="Pharma Sales"
          value={`₹${((dashboardData?.pharmacy?.salesToday || 0) / 100).toLocaleString('en-IN')}`}
          trend={{ direction: 'neutral', value: 'Today', label: '' }}
          subStats={[
            { label: 'Transactions', value: 'Live', color: 'grey' }
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
              <AreaChart data={dashboardData?.revenueByHour?.map(h => ({ time: h.hour, revenue: h.amount / 100 })) || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E9B59" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E9B59" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => [`₹${val}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#2E9B59" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
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
        <DashboardCard title="Doctor Collection — Today" action={{ label: 'Export', onClick: () => handleExport('doctor-collection') }} loading={loading}>
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
                {dashboardData?.doctorWise?.map((d, idx) => {
                  const maxCollection = Math.max(...dashboardData.doctorWise.map(doc => doc.collection || 1));
                  const progress = `${Math.round(((d.collection || 0) / maxCollection) * 100)}%`;
                  
                  return (
                    <tr key={idx}>
                      <td className="py-3 font-bold text-[#0F1F17]">{d.doctor}</td>
                      <td className="py-3 text-center">{d.opd}</td>
                      <td className="py-3 text-right font-mono font-bold">₹{((d.collection || 0) / 100).toLocaleString('en-IN')}</td>
                      <td className="py-3 pl-4">
                        <div className="w-full bg-brand-muted h-2 rounded-full overflow-hidden">
                          <div className={`bg-brand-green h-full opacity-100`} style={{ width: progress }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!dashboardData?.doctorWise || dashboardData.doctorWise.length === 0) && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-brand-text-sec text-xs italic">No collection data for today</td>
                  </tr>
                )}
                <tr className="bg-brand-bg font-bold">
                  <td className="py-3 text-[#0F1F17]">Total</td>
                  <td className="py-3 text-center">{dashboardData?.doctorWise?.reduce((s, d) => s + d.opd, 0) || 0}</td>
                  <td className="py-3 text-right font-mono text-brand-green">₹{((dashboardData?.revenue?.collected || 0) / 100).toLocaleString('en-IN')}</td>
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
