import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, ChevronRight, Stethoscope, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { opdApi } from '../hooks/useOpd';

const COMPLAINT_SUGGESTIONS = [
  'Fever and headache', 'Cough and cold', 'Stomach pain', 'Back pain',
  'Chest pain', 'Diabetes follow-up', 'BP check', 'Joint pain', 'Skin rash', 'Eye pain'
];

export const NewVisitModal = ({ doctors = [], onClose, onSuccess, tenantId }) => {
  const [step, setStep] = useState(1); // 1: search patient, 2: select doctor + complaint
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [visitType, setVisitType] = useState('opd');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get('/patients', { params: { q, limit: 8 } });
      setSearchResults(res.data.data?.patients || res.data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await opdApi.createVisit({
        patientId: selectedPatient._id,
        doctorId: selectedDoctor._id,
        type: visitType,
        chiefComplaint: chiefComplaint.trim() || undefined
      });
      onSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0F1F17]/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F1F17]">New OPD Visit</h2>
              <p className="text-xs text-brand-text-sec mt-0.5">
                Step {step} of 2: {step === 1 ? 'Select Patient' : 'Visit Details'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-brand-muted rounded-full text-brand-text-sec">
              <X size={20} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex px-6 pt-4 gap-2">
            {[1, 2].map(s => (
              <div key={s} className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-brand-green" : "bg-brand-border"
              )} />
            ))}
          </div>

          {/* Step 1: Patient Search */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by name, phone, or UHID…"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
                {searching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-text-sec" />
                )}
              </div>

              {/* Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(patient => (
                    <button
                      key={patient._id}
                      onClick={() => { setSelectedPatient(patient); setStep(2); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:border-brand-green hover:bg-brand-green/5",
                        selectedPatient?._id === patient._id
                          ? "border-brand-green bg-brand-green/5"
                          : "border-brand-border"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm shrink-0">
                        {patient.name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0F1F17] text-sm truncate">{patient.name}</p>
                        <p className="text-xs text-brand-text-sec">{patient.uhid} · {patient.phone}</p>
                      </div>
                      <ChevronRight size={16} className="text-brand-text-sec shrink-0" />
                    </button>
                  ))
                ) : searchQuery.length >= 2 && !searching ? (
                  <div className="text-center py-8 text-brand-text-sec">
                    <User size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No patients found</p>
                    <a href="/dashboard/patients/new" className="text-xs text-brand-green hover:underline flex items-center justify-center gap-1 mt-2">
                      <Plus size={14} /> Register new patient
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 2: Visit Details */}
          {step === 2 && (
            <div className="p-6 space-y-5">
              {/* Selected patient card */}
              <div className="flex items-center gap-3 p-3 bg-brand-bg rounded-xl border border-brand-border">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedPatient?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0F1F17] text-sm">{selectedPatient?.name}</p>
                  <p className="text-xs text-brand-text-sec">{selectedPatient?.uhid}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-brand-green font-bold hover:underline">
                  Change
                </button>
              </div>

              {/* Visit type */}
              <div>
                <label className="text-xs font-bold text-[#0F1F17] uppercase tracking-wider mb-2 block">Visit Type</label>
                <div className="flex gap-2">
                  {['opd', 'follow_up', 'emergency'].map(t => (
                    <button
                      key={t}
                      onClick={() => setVisitType(t)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                        visitType === t
                          ? t === 'emergency'
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-brand-green border-brand-green text-white"
                          : "border-brand-border text-brand-text-sec hover:border-brand-green/50"
                      )}
                    >
                      {t === 'opd' ? 'OPD' : t === 'follow_up' ? 'Follow-up' : '⚡ Emergency'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor selection */}
              <div>
                <label className="text-xs font-bold text-[#0F1F17] uppercase tracking-wider mb-2 block">
                  <Stethoscope size={12} className="inline mr-1" />Assign Doctor *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {doctors.length === 0 ? (
                    <p className="text-sm text-brand-text-sec text-center py-4">No doctors available</p>
                  ) : doctors.map(doc => (
                    <button
                      key={doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        selectedDoctor?._id === doc._id
                          ? "border-brand-green bg-brand-green/5"
                          : "border-brand-border hover:border-brand-green/50"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xs">
                        {doc.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F1F17] text-sm">{doc.name}</p>
                        {doc.speciality && <p className="text-xs text-brand-text-sec">{doc.speciality}</p>}
                      </div>
                      {selectedDoctor?._id === doc._id && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-brand-green flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="text-xs font-bold text-[#0F1F17] uppercase tracking-wider mb-2 block">Chief Complaint</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fever and headache since 2 days"
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-sm resize-none focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMPLAINT_SUGGESTIONS.slice(0, 5).map(s => (
                    <button
                      key={s}
                      onClick={() => setChiefComplaint(s)}
                      className="text-[11px] px-2 py-1 bg-brand-bg border border-brand-border rounded-full text-brand-text-sec hover:border-brand-green hover:text-brand-green transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-brand-errorBg border border-brand-error/30 rounded-xl text-sm text-brand-error font-medium">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="px-6 pb-6 flex gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-brand-border rounded-xl text-sm font-bold text-brand-text-sec hover:bg-brand-muted transition-colors">
                Back
              </button>
            )}
            {step === 2 ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedDoctor || submitting}
                className="flex-1 py-3 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {submitting ? 'Creating…' : 'Add to Queue'}
              </button>
            ) : (
              <button onClick={onClose} className="flex-1 py-3 border border-brand-border rounded-xl text-sm font-bold text-brand-text-sec hover:bg-brand-muted transition-colors">
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
