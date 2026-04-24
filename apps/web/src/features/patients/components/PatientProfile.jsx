import { useParams, useNavigate } from 'react-router-dom';
import { usePatientProfile } from '../hooks/usePatients';
import { AlertTriangle, Clock, CreditCard, Activity, ArrowLeft, HeartPulse, Stethoscope, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';

export const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError } = usePatientProfile(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="p-12 text-center text-red-600 font-body bg-red-50 rounded-2xl border border-red-100 max-w-lg mx-auto mt-12">
        <p className="font-bold text-lg">Failed to load patient profile.</p>
        <button 
          onClick={() => navigate('/dashboard/patients')} 
          className="mt-6 px-4 py-2 bg-white text-brand-green border border-brand-border rounded-xl font-bold hover:bg-brand-bg transition-colors"
        >
          Go back to directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Profile"
        subtitle={`Registered on ${new Date(patient.createdAt).toLocaleDateString('en-IN')}`}
        breadcrumb={[
          { label: 'Directory', href: '/dashboard/patients' },
          { label: patient.name }
        ]}
      />

      {patient.allergies?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-red-800 text-sm uppercase tracking-wider mb-1">Known Allergies</h3>
            <p className="text-red-700 font-medium">
              {patient.allergies.join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
            <div className="p-6 bg-brand-bg border-b border-brand-border text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-green/10 to-transparent"></div>
              <div className="relative w-24 h-24 bg-brand-green text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto shadow-md font-display ring-4 ring-white">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-[#0F1F17] mt-4 font-display">{patient.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-brand-text-sec font-bold text-sm bg-white px-2 py-1 rounded-md border border-brand-border">{patient.uhid}</span>
                {patient.abhaLinked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ABHA Linked
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm font-medium">Phone</span>
                <span className="font-bold text-[#0F1F17]">{patient.phone}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm font-medium">Gender / Age</span>
                <span className="font-bold text-[#0F1F17] capitalize">
                  {patient.gender} • {patient.age || '-'} yrs
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm font-medium">Blood Group</span>
                <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">{patient.bloodGroup || 'N/A'}</span>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => navigate('/dashboard/opd')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 transition-colors font-bold shadow-sm"
                >
                  <Activity className="w-5 h-5" />
                  Add to OPD Queue
                </button>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-brand-text-sec uppercase tracking-wider flex items-center gap-2 mb-4">
              <CreditCard size={16} />
              Account Status
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[#0F1F17] font-medium">Pending Balance</span>
              <span className={`text-xl font-bold ${patient.pendingBalance > 0 ? 'text-red-600' : 'text-brand-green'}`}>
                ₹{patient.pendingBalance?.toLocaleString() || 0}
              </span>
            </div>
            {patient.pendingBalance > 0 && (
              <button className="mt-4 w-full px-4 py-2.5 bg-brand-bg border border-brand-border text-[#0F1F17] rounded-xl hover:border-brand-green/50 transition-colors font-bold text-sm">
                Collect Payment
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Medical History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Health Tags */}
          {patient.tags?.length > 0 && (
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-brand-text-sec uppercase tracking-wider mb-4 flex items-center gap-2">
                <HeartPulse size={16} />
                Health Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-lg text-sm font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-sm font-bold text-brand-text-sec uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                Visit History
              </h3>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-green/10 text-brand-green">
                {patient.totalVisits || 0} Total
              </span>
            </div>
            
            <div className="p-0">
              {patient.visits?.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
                    <Stethoscope size={28} className="text-brand-text-sec/50" />
                  </div>
                  <p className="text-lg font-bold text-[#0F1F17]">No past visits</p>
                  <p className="text-sm text-brand-text-sec mt-1">Visit history will appear here once recorded.</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-border/50">
                  {patient.visits?.map((visit, idx) => (
                    <div key={idx} className="p-6 hover:bg-[#F4FAF6] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-[#0F1F17] text-lg">
                            {new Date(visit.visitDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-brand-green font-bold mt-1 flex items-center gap-1.5">
                            <Stethoscope size={14} />
                            {visit.doctorId?.name || 'Doctor'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 bg-white border border-brand-border rounded-xl p-4 text-sm shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold text-brand-text-sec uppercase tracking-wider block mb-1">Chief Complaint</span>
                            <span className="text-[#0F1F17] font-medium">{visit.chiefComplaint || '-'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-brand-text-sec uppercase tracking-wider block mb-1">Diagnosis</span>
                            <span className="text-[#0F1F17] font-medium">{visit.diagnosisCodes?.join(", ") || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
