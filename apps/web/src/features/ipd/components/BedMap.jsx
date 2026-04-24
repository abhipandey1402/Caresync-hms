import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Bed as BedIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export const BedMap = () => {
  const { addToast } = useToast();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBedMap = async () => {
      try {
        const res = await api.get('/ipd/bed-map');
        setWards(res.data?.data || []);
      } catch (err) {
        addToast('Failed to load bed map', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBedMap();
  }, [addToast]);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2].map(i => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wards.length === 0) {
    return (
      <div className="py-12 text-center text-brand-text-sec">
        <BedIcon className="mx-auto h-12 w-12 text-brand-text-sec/30 mb-4" />
        <h3 className="text-lg font-bold">No Wards Configured</h3>
        <p className="text-sm">Please go to IPD Settings to add wards and beds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {wards.map(ward => {
        const occupiedCount = ward.beds.filter(b => b.status === 'occupied').length;
        const totalCount = ward.beds.length;
        
        return (
          <div key={ward._id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-text font-display">{ward.name}</h3>
                <p className="text-xs text-brand-text-sec">Floor: {ward.floor || 'N/A'}</p>
              </div>
              <Badge variant="outline" className={cn(
                occupiedCount === totalCount ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                {occupiedCount}/{totalCount} Occupied
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {ward.beds.map(bed => (
                <div
                  key={bed._id}
                  className={cn(
                    "relative p-4 rounded-2xl border transition-all cursor-pointer group",
                    bed.status === 'available' && "bg-emerald-50/50 border-emerald-100 hover:border-emerald-300",
                    bed.status === 'occupied' && "bg-rose-50/50 border-rose-100 hover:border-rose-300",
                    bed.status === 'maintenance' && "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{bed.bedNumber}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      bed.status === 'available' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                      bed.status === 'occupied' && "bg-rose-500",
                      bed.status === 'maintenance' && "bg-slate-400"
                    )} />
                  </div>
                  
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-text-sec/60 mb-1">
                    {bed.type.replace('_', ' ')}
                  </div>
                  
                  <div className="text-xs font-medium">
                    {bed.status === 'available' ? 'Available' : bed.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                  </div>

                  {bed.status === 'occupied' && (
                    <div className="mt-2 pt-2 border-t border-rose-100/50">
                       <button className="text-[10px] font-bold text-rose-600 hover:underline">View Details</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
