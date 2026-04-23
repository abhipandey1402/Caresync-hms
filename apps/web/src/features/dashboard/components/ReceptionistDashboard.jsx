import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useAuthStore } from '@/store/authStore';
import { Users, IndianRupee, FileText, UserPlus, Stethoscope, Receipt, BedDouble, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  receptionistOpdQueue,
  receptionistPendingCollection,
  receptionistRegistrations
} from '../utils/mockData';

export const ReceptionistDashboard = () => {
  const { user, tenant } = useAuthStore();
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

  const ActionButton = ({ icon, label, labelHi, href, colorClass }) => (
    <Link 
      to={href}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[20px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border",
        colorClass
      )}
    >
      <div className="mb-4">{icon}</div>
      <span className="font-display font-bold text-lg text-[#0F1F17] leading-tight mb-1">{labelHi}</span>
      <span className="text-sm font-medium text-brand-text-sec">{label}</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`${tenant?.name || 'Clinic'} · ${today}`}
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
        <KPICard icon={<Users size={20} />} title="Patients Today" value="42" trend={{ direction: 'up', value: '5 more', label: 'vs yesterday' }} loading={loading} />
        <KPICard icon={<IndianRupee size={20} />} title="Bills Collected" value="₹72,000" trend={{ direction: 'up', value: '12%', label: '' }} loading={loading} />
        <KPICard icon={<Receipt size={20} />} title="Pending Collection" value="₹12,500" trend={{ direction: 'down', value: '₹2k less', label: '' }} loading={loading} />
        <KPICard icon={<UserPlus size={20} />} title="New Registrations" value="12" trend={{ direction: 'up', value: '3 more', label: '' }} loading={loading} />
      </div>

      {/* Row 2: PRIMARY ACTIONS (Large Buttons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <ActionButton 
          icon={<UserPlus size={40} className="text-brand-green" />}
          label="Register Patient" labelHi="नया मरीज़ Register करें" href="/dashboard/patients/new"
          colorClass="bg-[#EDF4EF] border-[#C8DDD0]"
        />
        <ActionButton 
          icon={<Stethoscope size={40} className="text-blue-600" />}
          label="Start OPD Visit" labelHi="नई OPD शुरू करें" href="/dashboard/opd/new"
          colorClass="bg-blue-50 border-blue-200"
        />
        <ActionButton 
          icon={<Receipt size={40} className="text-brand-gold" />}
          label="Create Bill" labelHi="नया Bill बनाएं" href="/dashboard/billing/new"
          colorClass="bg-[#FDF4E7] border-[#E8A020]/30"
        />
        <ActionButton 
          icon={<BedDouble size={40} className="text-purple-600" />}
          label="Admit Patient" labelHi="IPD में Admit करें" href="/dashboard/ipd/admit"
          colorClass="bg-purple-50 border-purple-200"
        />
      </div>

      {/* Row 3: Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Today's OPD Queue" action={{ label: 'Manage Queue →', href: '/dashboard/opd' }} loading={loading}>
          <div className="space-y-3">
            {receptionistOpdQueue.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0 hover:bg-brand-bg -mx-2 px-2 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-brand-text-sec font-medium w-8">#{p.token}</span>
                  <div>
                    <p className="text-sm font-bold text-[#0F1F17]">{p.name}</p>
                    <p className="text-[11px] text-brand-text-sec">{p.dr} · {p.dept}</p>
                  </div>
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

        <DashboardCard title="⏳ Pending Collection (Top 5)" action={{ label: 'View All →', href: '/dashboard/billing' }} loading={loading}>
          <div className="space-y-3">
            {receptionistPendingCollection.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div>
                  <p className="text-sm font-bold text-[#0F1F17]">{b.name}</p>
                  <p className="text-[11px] text-brand-text-sec">{b.reason}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-[#0F1F17]">₹{b.amount}</span>
                  <button className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-bold text-brand-green hover:bg-brand-green hover:text-white transition-colors">
                    Collect
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-2 flex justify-between items-center text-sm">
              <span className="text-brand-text-sec font-medium">Total Pending:</span>
              <span className="font-mono font-bold text-brand-error">₹28,400</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Recent Patient Registrations" action={{ label: 'Patient Directory →', href: '/dashboard/patients' }} loading={loading}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-text-sec border-b border-brand-border">
                <tr>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">UHID</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {receptionistRegistrations.map((p, i) => (
                  <tr key={i} className="hover:bg-brand-bg transition-colors">
                    <td className="py-2.5 font-bold text-[#0F1F17]">{p.name}</td>
                    <td className="py-2.5 text-brand-text-sec font-mono text-xs">{p.id}</td>
                    <td className="py-2.5 text-brand-text-sec text-xs">{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard title="Upcoming Appointments" loading={loading}>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <CalendarIcon size={32} className="text-brand-green/30 mb-3" />
            <p className="text-[#0F1F17] font-bold">No appointments left today</p>
            <p className="text-sm text-brand-text-sec mt-1">All scheduled patients have arrived.</p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
