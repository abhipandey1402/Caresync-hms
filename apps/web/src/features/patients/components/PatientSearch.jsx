import { useState, useEffect } from 'react';
import { usePatientSearch } from '../hooks/usePatients';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Search, Plus, Phone, Hash, Loader2, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-display">Patient Directory</h1>
          <p className="text-sm text-brand-text-sec mt-1">Search or register new patients</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-gold/10 text-brand-gold rounded-full text-sm font-medium border border-brand-gold/20">
              <CloudOff className="w-4 h-4" />
              <span>Offline Mode</span>
            </div>
          )}
          <button 
            onClick={() => navigate('/dashboard/patients/new')}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-mid transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Patient
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-brand-text-sec group-focus-within:text-brand-green transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 border border-brand-border rounded-xl leading-5 bg-white placeholder-brand-text-sec focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all text-lg shadow-soft"
          placeholder="Search by name, phone number, or UHID (e.g. P-00123)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-5 w-5 text-brand-text-sec animate-spin" />
          </div>
        )}
      </div>

      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-soft">
        {patients?.length === 0 && !isLoading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-brand-text-sec" />
            </div>
            <h3 className="text-lg font-medium text-brand-text mb-1 font-display">No patients found</h3>
            <p className="text-brand-text-sec mb-6">No matches for &quot;{query}&quot;.</p>
            <button 
              onClick={() => navigate('/dashboard/patients/new')}
              className="px-4 py-2 border border-brand-border text-brand-text-sec rounded-lg hover:bg-brand-muted transition-colors font-medium"
            >
              Register as New Patient
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border/50">
            {patients?.map((patient) => (
              <motion.li 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={patient._id} 
              >
                <button
                  onClick={() => navigate(`/dashboard/patients/${patient._id}`)}
                  className="w-full text-left p-4 hover:bg-brand-muted/50 transition-colors flex items-center justify-between group"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-muted text-brand-green rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-brand-border/50 transition-colors">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-brand-text">{patient.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-brand-text-sec mt-1">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5" />
                          {patient.uhid || "Pending"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-medium rounded-full">
                      {patient.gender}
                    </span>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
