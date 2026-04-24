import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format((Number(amount) || 0) / 100);

export const InventoryTab = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pharmacy/inventory', { params: { q: search } });
        if (!ignore) {
          setItems(res.data?.data || []);
        }
      } catch (err) {
        if (!ignore) {
          addToast('Failed to load inventory', 'error');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchInventory, 300);
    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [search, addToast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec" size={16} />
          <input
            type="text"
            placeholder="Search medicines, codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-bold rounded-xl text-sm hover:bg-brand-green-dark transition-colors">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      <div className="border border-brand-border rounded-xl overflow-hidden bg-white">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-brand-muted text-xs font-bold text-brand-text-sec uppercase tracking-wider">
          <div className="col-span-4">Medicine</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3 text-right">Available Stock</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        <div className="divide-y divide-brand-border">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="px-4 py-4"><Skeleton className="h-6 w-full" /></div>
            ))
          ) : items.length === 0 ? (
            <div className="py-12">
               <EmptyState
                  icon={<Package size={28} />}
                  title="No medicines found"
                  description="Try adjusting your search or add a new medicine to inventory."
                />
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="grid sm:grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="col-span-4 min-w-0">
                  <div className="font-bold text-brand-text truncate">{item.medicineName}</div>
                  <div className="text-xs text-brand-text-sec truncate">{item.genericName || 'No generic name'}</div>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="capitalize">{item.unit || 'Tab'}</Badge>
                </div>
                <div className="col-span-3 text-right font-medium">
                  {item.totalQty} {item.unit}s
                </div>
                <div className="col-span-3 text-right flex justify-end gap-2">
                  {item.isLowStock && (
                    <Badge color="amber" className="flex items-center gap-1">
                      <AlertCircle size={12} /> Low Stock
                    </Badge>
                  )}
                  {item.daysToExpiry !== null && item.daysToExpiry <= 30 && (
                    <Badge color="red">Expiring Soon</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
