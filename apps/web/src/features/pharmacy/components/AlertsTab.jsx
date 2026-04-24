import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export const AlertsTab = () => {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pharmacy/expiry-alerts');
        if (!ignore) {
          setAlerts(res.data?.data);
        }
      } catch (err) {
        if (!ignore) addToast('Failed to load alerts', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAlerts();
    return () => { ignore = true; };
  }, [addToast]);

  const renderSection = (title, items, badgeColor, emptyMsg) => (
    <div className="mb-8">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        {title}
        <Badge color={badgeColor}>{items?.length || 0}</Badge>
      </h3>
      {items && items.length > 0 ? (
        <div className="border border-brand-border rounded-xl overflow-hidden bg-white divide-y divide-brand-border">
          {items.map(item => (
            <div key={`${item._id}-${item.batchNumber}`} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{item.medicineName}</div>
                <div className="text-sm text-brand-text-sec">Batch: {item.batchNumber} • Qty: {item.qty}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {item.daysToExpiry < 0 ? 'Expired' : `Expires in ${item.daysToExpiry} days`}
                </div>
                <div className="text-sm text-brand-text-sec">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-brand-border text-center text-brand-text-sec">
          <CheckCircle2 className="mx-auto h-8 w-8 text-brand-green/40 mb-2" />
          {emptyMsg}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {renderSection('Expired Medicines', alerts?.expired, 'red', 'No expired medicines in stock')}
      {renderSection('Expiring in 30 Days', alerts?.expiring30, 'amber', 'No medicines expiring in the next 30 days')}
      {renderSection('Expiring in 60 Days', alerts?.expiring60, 'yellow', 'No medicines expiring in the next 60 days')}
    </div>
  );
};
