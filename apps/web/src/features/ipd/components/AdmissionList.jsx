import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Search, User, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export const AdmissionList = () => {
  const { addToast } = useToast();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const res = await api.get('/ipd/admissions', { params: { status: 'admitted' } });
        setAdmissions(res.data?.data || []);
      } catch (err) {
        addToast('Failed to load admissions', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmissions();
  }, [addToast]);

  const filteredAdmissions = admissions.filter(adm => 
    adm.patientId?.name.toLowerCase().includes(search.toLowerCase()) ||
    adm.admissionNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-96 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec" size={16} />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
        />
      </div>

      <div className="border border-brand-border rounded-xl overflow-hidden bg-white">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-brand-muted text-xs font-bold text-brand-text-sec uppercase tracking-wider">
          <div className="col-span-2">Admission ID</div>
          <div className="col-span-4">Patient</div>
          <div className="col-span-2">Ward/Bed</div>
          <div className="col-span-2">Admitted On</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-brand-border">
          {filteredAdmissions.length === 0 ? (
            <div className="px-6 py-12 text-center text-brand-text-sec text-sm">
              No active admissions found.
            </div>
          ) : (
            filteredAdmissions.map((adm) => (
              <div key={adm._id} className="grid sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-2 font-bold text-brand-text">{adm.admissionNumber}</div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-brand-text">{adm.patientId?.name}</div>
                    <div className="text-[10px] text-brand-text-sec">{adm.patientId?.uhid}</div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium">{adm.bedId?.bedNumber || 'N/A'}</div>
                  <div className="text-[10px] text-brand-text-sec">Ward: {adm.bedId?.wardId?.name || 'N/A'}</div>
                </div>
                <div className="col-span-2 text-sm">
                  {new Date(adm.admissionDate).toLocaleDateString()}
                </div>
                <div className="col-span-2 text-right">
                  <button className="text-brand-green font-bold text-xs flex items-center gap-1 justify-end hover:underline ml-auto">
                    Manage <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
