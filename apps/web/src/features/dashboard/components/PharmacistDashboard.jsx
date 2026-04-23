import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { useAuthStore } from '@/store/authStore';
import { IndianRupee, Pill, AlertTriangle, TrendingDown, PackagePlus, ShoppingCart, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  pharmacyExpiryAlerts,
  pharmacyLowStock,
  pharmacySalesLog,
  pharmacyTopSelling
} from '../utils/mockData';

export const PharmacistDashboard = () => {
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const ActionButton = ({ icon, label, labelHi, href, colorClass }) => (
    <Link 
      to={href}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[20px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border",
        colorClass
      )}
    >
      <div className="mb-3">{icon}</div>
      <span className="font-display font-bold text-lg text-[#0F1F17] leading-tight mb-1">{labelHi}</span>
      <span className="text-sm font-medium text-brand-text-sec">{label}</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="नमस्ते 👋"
        subtitle={`${tenant?.name || 'Clinic'} Pharmacy`}
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
        <KPICard icon={<IndianRupee size={20} />} title="Sales Today" value="₹15,200" trend={{ direction: 'up', value: '18%', label: 'vs yesterday' }} loading={loading} />
        <KPICard icon={<Pill size={20} />} title="Items Sold" value="124" trend={{ direction: 'up', value: '12 more', label: '' }} loading={loading} />
        <KPICard icon={<AlertTriangle size={20} />} title="Expiry Alerts" value="3" trend={{ direction: 'down', value: 'Action req', label: '' }} highlight={true} loading={loading} />
        <KPICard icon={<TrendingDown size={20} />} title="Low Stock" value="5" trend={{ direction: 'neutral', value: 'Items', label: '' }} loading={loading} />
      </div>

      {/* Row 2: QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <ActionButton 
          icon={<ShoppingCart size={40} className="text-brand-green" />}
          label="New Sale / POS" labelHi="दवा बेचें" href="/dashboard/pharmacy/pos"
          colorClass="bg-[#EDF4EF] border-[#C8DDD0]"
        />
        <ActionButton 
          icon={<PackagePlus size={40} className="text-blue-600" />}
          label="Add Stock / Purchase Entry" labelHi="Stock चढ़ाएं" href="/dashboard/pharmacy/purchase"
          colorClass="bg-blue-50 border-blue-200"
        />
      </div>

      {/* Row 3: Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="⚠️ Expiry Alerts" action={{ label: 'Manage Inventory →', href: '/dashboard/pharmacy/inventory' }} loading={loading}>
          <div className="space-y-3">
            {pharmacyExpiryAlerts.map((i, idx) => (
              <div key={idx} className={cn(
                "p-3 rounded-xl border-l-4 border bg-white flex justify-between items-center",
                i.status === 'red' ? "border-l-red-500 border-red-100" : "border-l-brand-gold border-brand-gold/20"
              )}>
                <div>
                  <p className="font-bold text-[#0F1F17]">{i.name}</p>
                  <p className="text-xs text-brand-text-sec mt-0.5">Batch: {i.batch} · Exp: {i.exp}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-[#0F1F17]">{i.qty} units</p>
                  <p className={cn("text-[10px] font-bold uppercase", i.status === 'red' ? "text-red-600" : "text-brand-gold")}>
                    in {i.days} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="📉 Low Stock Items" action={{ label: 'Order Report →', href: '/dashboard/pharmacy/reports' }} loading={loading}>
          <div className="space-y-3">
            {pharmacyLowStock.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div>
                  <p className="text-sm font-bold text-[#0F1F17]">{i.name}</p>
                  <p className="text-[11px] text-brand-text-sec">Supplier: {i.supplier}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-bold text-red-600">{i.qty} left</p>
                    <p className="text-[10px] text-brand-text-sec">Min: {i.min}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs font-bold text-brand-green hover:bg-brand-green hover:text-white transition-colors">
                    Add Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Row 4: Logs & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Today's Sales Log" action={{ label: 'View All', href: '/dashboard/pharmacy/sales' }} loading={loading}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-text-sec border-b border-brand-border">
                <tr>
                  <th className="pb-2 font-medium">Receipt</th>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {pharmacySalesLog.map((s, i) => (
                  <tr key={i} className="hover:bg-brand-bg transition-colors">
                    <td className="py-2.5 font-mono text-brand-green font-bold cursor-pointer hover:underline">{s.id}</td>
                    <td className="py-2.5 text-brand-text-sec text-xs">{s.time}</td>
                    <td className="py-2.5 text-[#0F1F17]">{s.items}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#0F1F17]">₹{s.amt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard title="Top Selling (This Week)" loading={loading}>
          <div className="space-y-4 pt-2">
            {pharmacyTopSelling.map((i, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm font-bold text-[#0F1F17]">{i.name}</p>
                  <p className="text-xs font-mono font-bold">{i.qty} units <span className="text-brand-text-sec font-normal ml-1">({i.rev})</span></p>
                </div>
                <div className="w-full bg-brand-muted h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-green h-full" style={{ width: `${i.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
