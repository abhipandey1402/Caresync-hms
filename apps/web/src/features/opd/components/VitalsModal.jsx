import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { opdApi } from '../hooks/useOpd';

const VitalField = ({ label, unit, value, onChange, min, max, alertCondition, criticalCondition }) => {
  const num = parseFloat(value);
  const isCritical = criticalCondition && !isNaN(num) && criticalCondition(num);
  const isAlert = alertCondition && !isNaN(num) && alertCondition(num);

  return (
    <div>
      <label className="text-xs font-bold text-[#0F1F17] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        {label}
        {isCritical && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">CRITICAL</span>}
        {!isCritical && isAlert && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">HIGH</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className={cn(
            "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors",
            isCritical
              ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
              : isAlert
              ? "border-orange-400 bg-orange-50 focus:border-orange-500 focus:ring-orange-500/20"
              : "border-brand-border focus:border-brand-green focus:ring-brand-green/20"
          )}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-text-sec font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export const VitalsModal = ({ visit, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    systolicBp: '',
    diastolicBp: '',
    pulse: '',
    temperatureF: '',
    spo2: '',
    weight: '',
    height: '',
    rbs: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  // Computed BMI
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = () => {
    if (!bmi) return null;
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (b < 25) return { label: 'Normal', color: 'text-brand-green' };
    if (b < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const handleSubmit = async () => {
    const body = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && !isNaN(parseFloat(v))) body[k] = parseFloat(v);
    });

    if (Object.keys(body).length === 0) {
      setError('Please enter at least one vital');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await opdApi.recordVitals(visit._id, body);
      onSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const bmiCat = bmiCategory();

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F1F17]">Record Vitals</h2>
              <p className="text-xs text-brand-text-sec mt-0.5">
                {visit?.patientId?.name || 'Patient'} · Token #{visit?.tokenNumber}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-brand-muted rounded-full text-brand-text-sec">
              <X size={20} />
            </button>
          </div>

          {/* Alert thresholds info */}
          <div className="mx-6 mt-4 p-3 bg-brand-bg border border-brand-border rounded-xl flex items-start gap-2 shrink-0">
            <Activity size={16} className="text-brand-green shrink-0 mt-0.5" />
            <p className="text-xs text-brand-text-sec">All fields are optional. Abnormal values will be highlighted automatically.</p>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* Blood Pressure */}
              <div>
                <p className="text-xs font-bold text-[#0F1F17] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Blood Pressure
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <VitalField
                    label="Systolic"
                    unit="mmHg"
                    value={form.systolicBp}
                    onChange={set('systolicBp')}
                    min={50} max={300}
                    alertCondition={v => v > 140}
                    criticalCondition={v => v >= 180}
                  />
                  <VitalField
                    label="Diastolic"
                    unit="mmHg"
                    value={form.diastolicBp}
                    onChange={set('diastolicBp')}
                    min={30} max={200}
                    alertCondition={v => v > 90}
                    criticalCondition={v => v >= 110}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <VitalField
                  label="Pulse"
                  unit="bpm"
                  value={form.pulse}
                  onChange={set('pulse')}
                  min={20} max={300}
                />
                <VitalField
                  label="Temperature"
                  unit="°F"
                  value={form.temperatureF}
                  onChange={set('temperatureF')}
                  min={90} max={115}
                  alertCondition={v => v > 100.4}
                  criticalCondition={v => v >= 104}
                />
              </div>

              <VitalField
                label="SpO₂"
                unit="%"
                value={form.spo2}
                onChange={set('spo2')}
                min={50} max={100}
                alertCondition={v => v < 97}
                criticalCondition={v => v < 94}
              />

              <VitalField
                label="RBS (Blood Sugar)"
                unit="mg/dL"
                value={form.rbs}
                onChange={set('rbs')}
                min={20} max={1000}
                alertCondition={v => v > 200}
                criticalCondition={v => v > 400}
              />

              {/* Weight + Height with BMI */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <VitalField
                    label="Weight"
                    unit="kg"
                    value={form.weight}
                    onChange={set('weight')}
                    min={0.5} max={500}
                  />
                  <VitalField
                    label="Height"
                    unit="cm"
                    value={form.height}
                    onChange={set('height')}
                    min={20} max={300}
                  />
                </div>
                {bmi && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 bg-brand-bg rounded-lg border border-brand-border">
                    <CheckCircle size={14} className="text-brand-green shrink-0" />
                    <span className="text-xs text-brand-text-sec">BMI: </span>
                    <span className="text-sm font-bold text-[#0F1F17]">{bmi}</span>
                    {bmiCat && <span className={cn("text-xs font-bold", bmiCat.color)}>{bmiCat.label}</span>}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-brand-errorBg border border-brand-error/30 rounded-xl flex items-center gap-2 text-sm text-brand-error font-medium">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-brand-border shrink-0 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-brand-border rounded-xl text-sm font-bold text-brand-text-sec hover:bg-brand-muted transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
              {submitting ? 'Saving…' : 'Save Vitals'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
