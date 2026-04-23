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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Failed to load patient profile.</p>
        <button onClick={() => navigate('/patients')} className="mt-4 text-indigo-600 font-medium">Go back to search</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
      </div>

      {patient.allergies?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Known Allergies</h3>
            <p className="text-red-700 font-medium mt-1">
              {patient.allergies.join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100 text-center">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-md">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">{patient.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-indigo-700 font-medium">{patient.uhid}</span>
                {patient.abhaLinked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3" /> ABHA Linked
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Phone</span>
                <span className="font-medium text-gray-900">{patient.phone}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Gender / Age</span>
                <span className="font-medium text-gray-900 capitalize">
                  {patient.gender} • {patient.age || '-'} yrs
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Blood Group</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{patient.bloodGroup || 'N/A'}</span>
              </div>

              <div className="pt-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  <Activity className="w-4 h-4" />
                  Start New Visit
                </button>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Account Status
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Balance</span>
              <span className={`text-xl font-bold ${patient.pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{patient.pendingBalance?.toLocaleString() || 0}
              </span>
            </div>
            {patient.pendingBalance > 0 && (
              <button className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Collect Payment
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Medical History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Health Tags */}
          {patient.tags?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" />
                Health Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Visit History
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ml-2">
                  {patient.totalVisits || 0} Total
                </span>
              </h3>
            </div>
            
            <div className="p-0">
              {patient.visits?.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Stethoscope className="w-10 h-10 text-gray-300 mb-3" />
                  <p>No past visits recorded.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {patient.visits?.map((visit, idx) => (
                    <li key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(visit.visitDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-indigo-600 font-medium mt-1 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5" />
                            {visit.doctorId?.name || 'Doctor'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${
                          visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 bg-white border border-gray-100 rounded-lg p-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-500 block mb-1">Chief Complaint</span>
                            <span className="text-gray-900">{visit.chiefComplaint || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Diagnosis</span>
                            <span className="text-gray-900">{visit.diagnosisCodes?.join(", ") || '-'}</span>
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
