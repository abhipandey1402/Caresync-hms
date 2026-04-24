import { useState, useEffect } from 'react';
import { usePatientSearch } from '../hooks/usePatients';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Search, Plus, Phone, Hash, Loader2, CloudOff, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';

export const PatientSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: patients, isLoading } = usePatientSearch(debouncedQuery);
  const isOnline = useNetworkStatus();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Directory"
        subtitle="Search or register new patients"
        actions={
          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-2 bg-brand-gold/10 text-brand-gold rounded-xl text-sm font-bold border border-brand-gold/20">
                <CloudOff size={16} />
                <span className="hidden sm:inline">Offline Mode</span>
              </div>
            )}
            <button 
              onClick={() => navigate('/dashboard/patients/new')}
              className="px-4 py-2 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
            >
              <Plus size={18} />
              New Patient
            </button>
          </div>
        }
      />

      <div className="relative group max-w-3xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-brand-text-sec group-focus-within:text-brand-green transition-colors" />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-12 py-4 border border-brand-border rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all shadow-sm text-base font-medium"
          placeholder="Search by name, phone number, or UHID (e.g. P-00123)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 size={20} className="text-brand-green animate-spin" />
          </div>
        )}
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
        {patients?.length === 0 && !isLoading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center mb-4">
              <Search size={28} className="text-brand-green/50" />
            </div>
            <p className="text-lg font-bold text-[#0F1F17]">No patients found</p>
            <p className="text-sm text-brand-text-sec mt-1 mb-6">We couldn't find anyone matching "{query}"</p>
            <button 
              onClick={() => navigate('/dashboard/patients/new')}
              className="px-5 py-2.5 bg-[#EDF4EF] text-brand-green font-bold rounded-xl hover:bg-brand-green hover:text-white transition-colors"
            >
              Register as New Patient
            </button>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/50">
            <AnimatePresence mode="popLayout">
              {patients?.map((patient) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={patient._id} 
                >
                  <button
                    onClick={() => navigate(`/dashboard/patients/${patient._id}`)}
                    className="w-full text-left p-4 sm:p-5 hover:bg-[#F4FAF6] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EDF4EF] text-brand-green rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                        {patient.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-[#0F1F17] truncate">{patient.name}</p>
                        <div className="flex items-center gap-3 text-sm text-brand-text-sec mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1.5 bg-brand-bg px-2 py-0.5 rounded-md font-medium text-xs">
                            <Hash size={12} />
                            {patient.uhid || "Pending"}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-xs">
                            <Phone size={12} />
                            {patient.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:inline-flex px-2.5 py-1 bg-brand-bg text-brand-text-sec text-xs font-bold uppercase tracking-wider rounded-lg border border-brand-border">
                        {patient.gender}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-brand-text-sec group-hover:bg-brand-green group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
