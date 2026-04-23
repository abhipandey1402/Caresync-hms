import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useAuthStore } from '@/store/authStore';
import { Users, Clock, IndianRupee, FileText, Calendar as CalendarIcon, RefreshCw, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { 
  doctorWeeklyData as weeklyData,
  doctorQueue,
  doctorFollowUps,
  doctorIpdPatients
} from '../utils/mockData';

export const DoctorDashboard = () => {
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
        subtitle={`${today} · आज की OPD`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          icon={<Users size={20} />}
          title="My OPD Today"
          value="42"
          trend={{ direction: 'up', value: '4 more', label: 'vs yesterday' }}
          subStats={[
            { label: 'Completed', value: '38', color: 'green' },
            { label: 'Waiting', value: '4', color: 'gold' }
          ]}
          loading={loading}
        />
        <KPICard 
          icon={<Clock size={20} />}
          title="Avg Wait Time"
          value="18 min"
          trend={{ direction: 'down', value: '2 min', label: 'improvement' }}
          loading={loading}
        />
        <KPICard 
          icon={<IndianRupee size={20} />}
          title="My Collection"
          value="₹44,000"
          trend={{ direction: 'up', value: '15%', label: '' }}
          loading={loading}
        />
        <KPICard 
          icon={<FileText size={20} />}
          title="Pending Rx"
          value="2"
          trend={{ direction: 'neutral', value: 'Drafts', label: '' }}
          action={{ label: 'Complete Now →', href: '/dashboard/prescriptions' }}
          loading={loading}
        />
      </div>

      {/* Row 2: Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Patient Card - Hero (2 cols) */}
        <div className="lg:col-span-2">
          <DashboardCard title="🔵 NOW SEEING" loading={loading} className="border-brand-green ring-1 ring-brand-green/20">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-mono text-brand-green font-bold">#38</span>
                  <h2 className="text-3xl font-display font-bold text-[#0F1F17]">Ramesh Kumar Singh</h2>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-brand-text-sec mb-6">
                  <span>P-00012</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Age 39M</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-red-500">B+</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-brand-bg rounded-xl p-4 border border-brand-border">
                    <p className="text-xs text-brand-text-sec font-bold uppercase mb-1">Chief Complaint</p>
                    <p className="text-[#0F1F17] font-medium">Fever since 2 days, mild cough</p>
                  </div>

                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium">
                    <span className="font-bold">⚠️ Allergy:</span> Penicillin
                  </div>

                  <div className="bg-white border border-brand-border rounded-xl p-4">
                    <p className="text-xs text-brand-text-sec font-bold uppercase mb-1">Last Visit (15 Dec)</p>
                    <p className="text-sm text-[#0F1F17]">Fever, prescribed Azithromycin.</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-48 space-y-3 shrink-0 flex flex-col justify-end h-full mt-auto">
                <Link to="/dashboard/prescriptions/new?patient=P-00012" className="w-full block text-center px-4 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-mid shadow-sm transition-colors">
                  Start Prescription
                </Link>
                <Link to="/dashboard/patients/P-00012" className="w-full block text-center px-4 py-3 bg-white border border-brand-border text-[#0F1F17] rounded-xl font-bold hover:bg-brand-muted transition-colors">
                  View History
                </Link>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* My Queue (1 col) */}
        <DashboardCard title="My Queue" action={{ label: 'View All', href: '/dashboard/opd' }} loading={loading}>
          <div className="space-y-3">
            {doctorQueue.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0 group cursor-pointer hover:bg-brand-bg -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-brand-text-sec font-medium w-8">#{p.token}</span>
                  <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold",
                  p.status === 'Next' ? "bg-brand-green/10 text-brand-green" : "bg-brand-gold/10 text-brand-gold"
                )}>
                  {p.status === 'Next' ? '🔵 Next' : '⏳ Wait'}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Row 3: Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="📅 Follow-ups Today (4)" action={{ label: 'View all →', href: '/dashboard/patients' }} loading={loading}>
          <div className="space-y-4">
            {doctorFollowUps.map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1">
                  {f.status === 'overdue' && <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>}
                  {f.status === 'upcoming' && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold"></div>}
                  {f.status === 'later' && <div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={cn("text-sm font-bold", f.status === 'overdue' ? "text-red-700" : "text-[#0F1F17]")}>
                        {f.name} <span className="text-xs font-normal text-brand-text-sec ml-2">{f.id}</span>
                      </p>
                      <p className="text-xs text-brand-text-sec mt-0.5">{f.reason}</p>
                    </div>
                    <span className="text-xs font-bold text-[#0F1F17] bg-brand-muted px-2 py-1 rounded">{f.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="My IPD Patients" action={{ label: 'View Ward', href: '/dashboard/ipd' }} loading={loading}>
          <div className="space-y-3">
            {doctorIpdPatients.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0 hover:bg-brand-bg -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                  <p className="text-[11px] text-brand-text-sec">{p.dx} · Day {p.day}</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#0F1F17]">{p.bed}</span>
              </div>
            ))}
            <div className="pt-2 text-center">
              <span className="text-xs text-brand-text-sec font-medium">+ 2 more patients in IPD</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Row 4: My Stats */}
      <DashboardCard title="My OPD Trend (This Week)" loading={loading} noPadding>
        <div className="p-6 h-48 flex flex-col justify-between">
          <div>
            <span className="text-3xl font-display font-bold text-[#0F1F17]">126</span>
            <span className="text-sm text-brand-text-sec ml-2">patients seen this week</span>
          </div>
          <div className="h-24 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="count" stroke="#1A6B3C" strokeWidth={3} dot={{ r: 4, fill: '#1A6B3C', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardCard>

    </div>
  );
};
