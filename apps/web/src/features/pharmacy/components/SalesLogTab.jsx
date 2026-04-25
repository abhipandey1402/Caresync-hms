import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ShoppingCart, IndianRupee, User, Calendar, Receipt } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format((Number(amount) || 0) / 100);

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const SalesLogTab = () => {
  const { addToast } = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadSales = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/pharmacy/sales');
      setSales(res.data?.data || []);
    } catch (err) {
      addToast('Failed to load sales log', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || 
      sale.billNumber?.toLowerCase().includes(normalizedQuery) ||
      sale.patientId?.name?.toLowerCase().includes(normalizedQuery) ||
      sale.patientId?.uhid?.toLowerCase().includes(normalizedQuery);
    
    if (activeFilter === 'all') return matchesQuery;
    return matchesQuery && sale.status === activeFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec" size={16} />
            <input
              type="text"
              placeholder="Search by bill # or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm outline-none focus:border-brand-green"
            />
          </div>
          <button
            onClick={() => loadSales(true)}
            disabled={refreshing || loading}
            className="p-2 border border-brand-border rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {['all', 'paid', 'unpaid', 'partial'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg border whitespace-nowrap transition-colors uppercase tracking-wider",
                activeFilter === f
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-white text-brand-text-sec border-brand-border hover:border-brand-green/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border">
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider">Bill #</th>
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-brand-text-sec uppercase tracking-wider">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-brand-text-sec">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt size={32} className="opacity-20" />
                      <p>No sales records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-[#0F1F17] text-sm">{sale.billNumber}</td>
                    <td className="px-4 py-4 text-xs text-brand-text-sec">{formatDateTime(sale.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0F1F17]">{sale.patientId?.name || 'Walk-in'}</span>
                        <span className="text-[10px] text-brand-text-sec">{sale.patientId?.uhid || 'No UHID'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-right">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                        sale.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        sale.status === 'partial' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-brand-text-sec">
                      {sale.lineItems?.length || 0} items
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
