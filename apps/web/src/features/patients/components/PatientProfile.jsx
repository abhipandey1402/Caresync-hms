import { useParams, useNavigate } from 'react-router-dom';
import { usePatientProfile } from '../hooks/usePatients';
import { AlertTriangle, Clock, CreditCard, Activity, ArrowLeft, HeartPulse, Stethoscope, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="p-6 text-center text-red-600 font-body">
        <p>Failed to load patient profile.</p>
        <button onClick={() => navigate('/patients')} className="mt-4 text-brand-green font-medium">Go back to search</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-body">
      {/* Header Banner */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-brand-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-brand-text-sec" />
        </button>
        <h1 className="text-2xl font-bold text-brand-text font-display">Patient Profile</h1>
      </div>

      {patient.allergies?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-soft"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 font-display">Known Allergies</h3>
            <p className="text-red-700 font-medium mt-1">
              {patient.allergies.join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden">
            <div className="p-6 bg-brand-muted border-b border-brand-border text-center">
              <div className="w-20 h-20 bg-brand-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-md font-display">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-brand-text mt-4 font-display">{patient.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-brand-green-mid font-medium">{patient.uhid}</span>
                {patient.abhaLinked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3" /> ABHA Linked
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm">Phone</span>
                <span className="font-medium text-brand-text">{patient.phone}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm">Gender / Age</span>
                <span className="font-medium text-brand-text capitalize">
                  {patient.gender} • {patient.age || '-'} yrs
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-brand-border/50">
                <span className="text-brand-text-sec text-sm">Blood Group</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{patient.bloodGroup || 'N/A'}</span>
              </div>

              <div className="pt-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-mid transition-colors font-medium">
                  <Activity className="w-4 h-4" />
                  Start New Visit
                </button>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-xl shadow-soft border border-brand-border p-6">
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2 mb-4 font-display">
              <CreditCard className="w-5 h-5 text-brand-text-sec" />
              Account Status
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-brand-text-sec">Pending Balance</span>
              <span className={`text-xl font-bold ${patient.pendingBalance > 0 ? 'text-red-600' : 'text-brand-green'}`}>
                ₹{patient.pendingBalance?.toLocaleString() || 0}
              </span>
            </div>
            {patient.pendingBalance > 0 && (
              <button className="mt-4 w-full px-4 py-2 border border-brand-border text-brand-text-sec rounded-lg hover:bg-brand-muted transition-colors font-medium text-sm">
                Collect Payment
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Medical History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Health Tags */}
          {patient.tags?.length > 0 && (
            <div className="bg-white rounded-xl shadow-soft border border-brand-border p-6">
              <h3 className="text-sm font-semibold text-brand-text-sec uppercase tracking-wider mb-3 flex items-center gap-2 font-display">
                <HeartPulse className="w-4 h-4" />
                Health Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-soft border border-brand-border overflow-hidden">
            <div className="px-6 py-5 border-b border-brand-border bg-brand-muted/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2 font-display">
                <Clock className="w-5 h-5 text-brand-text-sec" />
                Visit History
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green ml-2 font-body">
                  {patient.totalVisits || 0} Total
                </span>
              </h3>
            </div>
            
            <div className="p-0">
              {patient.visits?.length === 0 ? (
                <div className="p-8 text-center text-brand-text-sec flex flex-col items-center">
                  <Stethoscope className="w-10 h-10 text-brand-text-sec/50 mb-3" />
                  <p>No past visits recorded.</p>
                </div>
              ) : (
                <ul className="divide-y divide-brand-border/50">
                  {patient.visits?.map((visit, idx) => (
                    <li key={idx} className="p-6 hover:bg-brand-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-brand-text">
                            {new Date(visit.visitDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-brand-green font-medium mt-1 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5" />
                            {visit.doctorId?.name || 'Doctor'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${
                          visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 bg-white border border-brand-border/50 rounded-lg p-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-brand-text-sec block mb-1">Chief Complaint</span>
                            <span className="text-brand-text">{visit.chiefComplaint || '-'}</span>
                          </div>
                          <div>
                            <span className="text-brand-text-sec block mb-1">Diagnosis</span>
                            <span className="text-brand-text">{visit.diagnosisCodes?.join(", ") || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
