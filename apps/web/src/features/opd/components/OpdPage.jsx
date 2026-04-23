import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Plus, RefreshCw, Radio, Wifi, WifiOff,
  ChevronRight, Activity, Clock, User,
  CheckCircle, XCircle, Phone, Stethoscope,
  Volume2, VolumeX, Filter, Calendar,
  ArrowRight, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '../hooks/useQueue';
import { opdApi } from '../hooks/useOpd';
import { NewVisitModal } from './NewVisitModal';
import { VitalsModal } from './VitalsModal';
import api from '@/services/api';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  queued: { label: 'Waiting', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  checked_in: { label: 'Checked In', color: 'bg-brand-green/10 text-brand-green border-brand-green/30', dot: 'bg-brand-green' },
  in_consultation: { label: 'In Consultation', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  completed: { label: 'Done', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
  no_show: { label: 'No Show', color: 'bg-red-50 text-red-500 border-red-200', dot: 'bg-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-400 border-gray-200', dot: 'bg-gray-300' }
};

const WAIT_COLORS = {
  green: 'text-brand-green bg-brand-green/10',
  orange: 'text-orange-600 bg-orange-50',
  red: 'text-red-600 bg-red-50'
};

// ─── Token Card (large display) ───────────────────────────────────────────────
const TokenCard = ({ visit, isActive, onStatusChange, onVitals, role }) => {
  const [updating, setUpdating] = useState(false);
  const statusConfig = STATUS_CONFIG[visit.status] || STATUS_CONFIG.queued;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(visit._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const waitMins = visit.waitMinutes || 0;
  const patient = visit.patientId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "bg-white border rounded-2xl p-4 transition-all",
        isActive ? "border-brand-green shadow-md shadow-brand-green/10 ring-1 ring-brand-green/20" : "border-brand-border",
        visit.status === 'no_show' && "opacity-50",
        visit.status === 'completed' && "opacity-70"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Token number */}
        <div className={cn(
          "shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-display font-bold",
          isActive
            ? "bg-brand-green text-white"
            : visit.status === 'completed' || visit.status === 'no_show'
            ? "bg-gray-100 text-gray-400"
            : "bg-[#EDF4EF] text-brand-green"
        )}>
          <span className="text-[10px] uppercase tracking-widest font-sans font-medium opacity-70">Token</span>
          <span className="text-2xl leading-none">{visit.tokenNumber ?? '—'}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-[#0F1F17] text-base leading-tight">
                {patient?.name || 'Unknown Patient'}
              </p>
              <p className="text-xs text-brand-text-sec mt-0.5">
                {patient?.uhid} {patient?.phone && `· ${patient.phone}`}
              </p>
            </div>

            {/* Status badge */}
            <span className={cn(
              "text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5",
              statusConfig.color
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
              {statusConfig.label}
            </span>
          </div>

          {/* Chief complaint */}
          {visit.chiefComplaint && (
            <p className="text-sm text-brand-text-sec mt-2 line-clamp-2 italic">
              "{visit.chiefComplaint}"
            </p>
          )}

          {/* Vitals quick view */}
          {visit.vitals && (visit.vitals.pulse || visit.vitals.systolicBp) && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {visit.vitals.systolicBp && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  visit.vitals.bpStatus === 'critical' ? "bg-red-100 text-red-600" :
                  visit.vitals.bpStatus === 'high' ? "bg-orange-100 text-orange-600" :
                  "bg-brand-bg text-brand-text-sec"
                )}>
                  BP: {visit.vitals.systolicBp}/{visit.vitals.diastolicBp}
                </span>
              )}
              {visit.vitals.pulse && (
                <span className="text-xs font-medium bg-brand-bg text-brand-text-sec px-2 py-0.5 rounded-full">
                  Pulse: {visit.vitals.pulse}bpm
                </span>
              )}
              {visit.vitals.spo2 && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  visit.vitals.spo2Status === 'critical' ? "bg-red-100 text-red-600" :
                  visit.vitals.spo2Status === 'low' ? "bg-orange-100 text-orange-600" :
                  "bg-brand-bg text-brand-text-sec"
                )}>
                  SpO₂: {visit.vitals.spo2}%
                </span>
              )}
            </div>
          )}

          {/* Wait time */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1",
              WAIT_COLORS[visit.waitStatus || 'green']
            )}>
              <Clock size={11} />
              {waitMins < 1 ? 'Just arrived' : `${waitMins}m wait`}
            </span>

            {visit.waitingBefore > 0 && (
              <span className="text-xs text-brand-text-sec">
                {visit.waitingBefore} ahead
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {visit.status !== 'completed' && visit.status !== 'cancelled' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-border flex-wrap">
          {/* Vitals */}
          {(role === 'nurse' || role === 'doctor' || role === 'admin') && (
            <button
              onClick={() => onVitals(visit)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-brand-bg border border-brand-border rounded-lg hover:border-brand-green hover:bg-brand-green/5 hover:text-brand-green transition-colors"
            >
              <Activity size={13} /> Vitals
            </button>
          )}

          {/* Status transitions */}
          {visit.status === 'queued' && (role === 'receptionist' || role === 'nurse' || role === 'admin') && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('checked_in')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCircle size={13} /> Check In
            </button>
          )}
          {(visit.status === 'queued' || visit.status === 'checked_in') && (role === 'doctor' || role === 'admin') && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('in_consultation')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-orange-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <Stethoscope size={13} /> Call In
            </button>
          )}
          {visit.status === 'in_consultation' && (role === 'doctor' || role === 'admin') && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('completed')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-brand-green border border-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={13} /> Complete
            </button>
          )}

          {/* No Show */}
          {(visit.status === 'queued' || visit.status === 'checked_in') && (
            <button
              disabled={updating}
              onClick={() => handleStatusChange('no_show')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-text-sec border border-brand-border rounded-lg hover:bg-brand-errorBg hover:text-brand-error hover:border-brand-error/30 transition-colors ml-auto disabled:opacity-50"
            >
              <XCircle size={13} /> No Show
            </button>
          )}

          {/* View full profile */}
          {patient && (
            <Link
              to={`/dashboard/patients/${patient._id}`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-text-sec border border-brand-border rounded-lg hover:border-brand-green/50 hover:text-brand-green transition-colors"
            >
              <User size={13} /> Profile
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main OPD Page ─────────────────────────────────────────────────────────────
export const OpdPage = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'receptionist';

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // null = today
  const [doctors, setDoctors] = useState([]);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [vitalsVisit, setVitalsVisit] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active'); // 'all' | 'active' | 'completed'

  const { queue, loading, connected, refetch } = useQueue(selectedDoctorId, selectedDate);

  // Load doctors list
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.get('/admin/staff', { params: { role: 'doctor', limit: 100 } });
        const list = res.data.data?.staff || res.data.data || [];
        setDoctors(list);
        if (list.length > 0 && !selectedDoctorId && role === 'doctor') {
          // Auto-select current doctor's own view
          const me = list.find(d => d._id === user?._id);
          if (me) setSelectedDoctorId(me._id);
        }
      } catch {
        setDoctors([]);
      }
    };
    loadDoctors();
  }, [role, user?._id]);

  const handleStatusChange = useCallback(async (visitId, status) => {
    await opdApi.updateStatus(visitId, status);
    refetch();
  }, [refetch]);

  const handleVitalsSuccess = useCallback(() => {
    setVitalsVisit(null);
    refetch();
  }, [refetch]);

  const handleNewVisitSuccess = useCallback((data) => {
    setShowNewVisit(false);
    refetch();
  }, [refetch]);

  // Queue stats
  const stats = {
    total: queue.length,
    waiting: queue.filter(v => v.status === 'queued' || v.status === 'checked_in').length,
    inConsultation: queue.filter(v => v.status === 'in_consultation').length,
    completed: queue.filter(v => v.status === 'completed').length,
    noShow: queue.filter(v => v.status === 'no_show').length
  };

  // Filtered queue
  const filteredQueue = queue.filter(v => {
    if (activeFilter === 'active') return ['queued', 'checked_in', 'in_consultation'].includes(v.status);
    if (activeFilter === 'completed') return ['completed', 'no_show', 'cancelled'].includes(v.status);
    return true;
  });

  const currentlyInConsultation = queue.find(v => v.status === 'in_consultation');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="OPD Queue"
        subtitle={`${today} · ${stats.waiting} patients waiting`}
        actions={
          <div className="flex items-center gap-2">
            {/* SSE connection indicator */}
            <span className={cn(
              "hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border",
              connected
                ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}>
              {connected ? <Radio size={13} className="animate-pulse" /> : <WifiOff size={13} />}
              {connected ? 'Live' : 'Offline'}
            </span>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(p => !p)}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                soundEnabled
                  ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                  : "bg-white text-brand-text-sec border-brand-border hover:border-brand-green/50"
              )}
              title={soundEnabled ? 'Mute notifications' : 'Enable sound notifications'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 bg-white border border-brand-border rounded-lg text-brand-text-sec hover:bg-brand-muted disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {(role === 'receptionist' || role === 'admin') && (
              <button
                onClick={() => setShowNewVisit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-colors shadow-sm"
              >
                <Plus size={18} /> New Visit
              </button>
            )}
          </div>
        }
      />

      {/* Doctor selector + date */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Doctor filter */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Filter size={16} className="text-brand-text-sec shrink-0" />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSelectedDoctorId(null)}
              className={cn(
                "px-3 py-2 text-sm font-bold rounded-lg border whitespace-nowrap transition-colors",
                !selectedDoctorId
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-white text-brand-text-sec border-brand-border hover:border-brand-green/50"
              )}
            >
              All Doctors
            </button>
            {doctors.map(doc => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoctorId(doc._id)}
                className={cn(
                  "px-3 py-2 text-sm font-bold rounded-lg border whitespace-nowrap transition-colors",
                  selectedDoctorId === doc._id
                    ? "bg-brand-green text-white border-brand-green"
                    : "bg-white text-brand-text-sec border-brand-border hover:border-brand-green/50"
                )}
              >
                {doc.name?.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2 shrink-0">
          <Calendar size={16} className="text-brand-text-sec" />
          <input
            type="date"
            value={selectedDate || new Date().toISOString().split('T')[0]}
            onChange={e => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(e.target.value === today ? null : e.target.value);
            }}
            className="text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-green bg-white"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Waiting', value: stats.waiting, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'In Consultation', value: stats.inConsultation, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { label: 'Completed', value: stats.completed, color: 'text-brand-green', bg: 'bg-brand-green/5 border-brand-green/20' },
          { label: 'No Show', value: stats.noShow, color: 'text-red-500', bg: 'bg-red-50 border-red-100' }
        ].map(stat => (
          <div key={stat.label} className={cn("rounded-2xl border p-4", stat.bg)}>
            <p className={cn("text-3xl font-display font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs font-bold text-brand-text-sec mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Currently in consultation banner */}
      {currentlyInConsultation && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <Stethoscope size={22} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Currently In Consultation</p>
            <p className="font-bold text-[#0F1F17] text-lg mt-0.5">
              Token #{currentlyInConsultation.tokenNumber} · {currentlyInConsultation.patientId?.name}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-brand-text-sec">Doctor</p>
            <p className="font-bold text-[#0F1F17] text-sm">{currentlyInConsultation.doctorId?.name}</p>
          </div>
        </div>
      )}

      {/* Queue filter tabs */}
      <div className="flex bg-brand-bg border border-brand-border rounded-xl p-1 gap-1 w-fit">
        {[
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: 'All' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-colors",
              activeFilter === f.key
                ? "bg-white text-[#0F1F17] shadow-sm"
                : "text-brand-text-sec hover:text-[#0F1F17]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Queue list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-brand-border rounded-2xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-brand-bg rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-brand-bg rounded w-1/3" />
                  <div className="h-3 bg-brand-bg rounded w-1/4" />
                  <div className="h-3 bg-brand-bg rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : filteredQueue.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={28} className="text-brand-green/50" />
            </div>
            <p className="font-bold text-[#0F1F17] text-lg">Queue is clear</p>
            <p className="text-brand-text-sec text-sm mt-1">
              {activeFilter === 'active' ? 'No patients waiting right now' : 'No visits found for this filter'}
            </p>
            {(role === 'receptionist' || role === 'admin') && activeFilter === 'active' && (
              <button
                onClick={() => setShowNewVisit(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-colors mx-auto"
              >
                <Plus size={16} /> Add First Patient
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredQueue.map((visit) => (
              <TokenCard
                key={visit._id}
                visit={visit}
                isActive={visit.status === 'in_consultation'}
                role={role}
                onStatusChange={handleStatusChange}
                onVitals={setVitalsVisit}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      {showNewVisit && (
        <NewVisitModal
          doctors={doctors}
          onClose={() => setShowNewVisit(false)}
          onSuccess={handleNewVisitSuccess}
        />
      )}

      {vitalsVisit && (
        <VitalsModal
          visit={vitalsVisit}
          onClose={() => setVitalsVisit(null)}
          onSuccess={handleVitalsSuccess}
        />
      )}
    </div>
  );
};
