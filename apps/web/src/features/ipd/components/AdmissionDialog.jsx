import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';
import { User, Stethoscope, Bed, CreditCard, ClipboardList } from 'lucide-react';

export const AdmissionDialog = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [availableBeds, setAvailableBeds] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    bedId: '',
    admissionType: 'routine',
    diagnosis: '',
    attendant: { name: '', phone: '', relation: '' },
    depositAmount: 0,
    depositReceipt: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [ptsRes, drsRes, wdsRes] = await Promise.allSettled([
            api.get('/patients', { params: { limit: 50 } }),
            api.get('/admin/staff', { params: { role: 'doctor', limit: 100 } }),
            api.get('/ipd/bed-map')
          ]);

          if (ptsRes.status === 'fulfilled') {
            setPatients(ptsRes.value.data?.data?.items || ptsRes.value.data?.data || []);
          } else {
            console.error('Patients fetch error:', ptsRes.reason);
            addToast('Failed to load patients', 'error');
          }

          if (drsRes.status === 'fulfilled') {
            setDoctors(drsRes.value.data?.data?.staff || drsRes.value.data?.data?.items || drsRes.value.data?.data || []);
          } else {
            console.error('Doctors fetch error:', drsRes.reason);
            addToast('Failed to load doctors', 'error');
          }

          if (wdsRes.status === 'fulfilled') {
            setWards(wdsRes.value.data?.data || []);
          } else {
            console.error('Wards fetch error:', wdsRes.reason);
            addToast('Failed to load wards/beds', 'error');
          }
        } catch (err) {
          addToast('Critical error loading form data', 'error');
        }
      };
      fetchData();
    }
  }, [isOpen, addToast]);

  useEffect(() => {
    if (selectedWardId) {
      const ward = wards.find(w => w._id === selectedWardId);
      setAvailableBeds(ward?.beds.filter(b => b.status === 'available') || []);
    } else {
      setAvailableBeds([]);
    }
  }, [selectedWardId, wards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert deposit to paise
      const payload = {
        ...formData,
        depositAmount: Number(formData.depositAmount) * 100
      };
      await api.post('/ipd/admissions', payload);
      addToast('Patient admitted successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Admission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Patient Admission" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Patient" icon={User} required>
            <select
              required
              value={formData.patientId}
              onChange={e => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
            >
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.uhid})</option>)}
            </select>
          </FormField>

          <FormField label="Consulting Doctor" icon={Stethoscope} required>
            <select
              required
              value={formData.doctorId}
              onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
            >
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </FormField>

          <FormField label="Ward" icon={Bed} required>
            <select
              required
              value={selectedWardId}
              onChange={e => {
                setSelectedWardId(e.target.value);
                setFormData({ ...formData, bedId: '' });
              }}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
            >
              <option value="">Select Ward</option>
              {wards.map(w => <option key={w._id} value={w._id}>{w.name} ({w.floor})</option>)}
            </select>
          </FormField>

          <FormField label="Bed" icon={Bed} required>
            <select
              required
              disabled={!selectedWardId}
              value={formData.bedId}
              onChange={e => setFormData({ ...formData, bedId: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm disabled:bg-slate-50"
            >
              <option value="">Select Bed</option>
              {availableBeds.map(b => (
                <option key={b._id} value={b._id}>
                  {b.bedNumber} - ₹{(b.dailyRate / 100).toLocaleString()}/day
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Diagnosis / Reason for Admission" icon={ClipboardList} required>
          <textarea
            required
            rows={2}
            value={formData.diagnosis}
            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="Initial diagnosis..."
            className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
          />
        </FormField>

        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Attendant Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              required
              placeholder="Name"
              value={formData.attendant.name}
              onChange={e => setFormData({ ...formData, attendant: { ...formData.attendant, name: e.target.value } })}
              className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
            />
            <input
              required
              placeholder="Phone"
              value={formData.attendant.phone}
              onChange={e => setFormData({ ...formData, attendant: { ...formData.attendant, phone: e.target.value } })}
              className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
            />
            <input
              required
              placeholder="Relation"
              value={formData.attendant.relation}
              onChange={e => setFormData({ ...formData, attendant: { ...formData.attendant, relation: e.target.value } })}
              className="w-full px-4 py-2 border border-brand-border rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Initial Deposit (₹)" icon={CreditCard}>
            <input
              type="number"
              value={formData.depositAmount}
              onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
            />
          </FormField>
          <FormField label="Receipt Number" icon={ClipboardList}>
            <input
              value={formData.depositReceipt}
              onChange={e => setFormData({ ...formData, depositReceipt: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-xl text-sm"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-brand-border rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 bg-brand-green text-white font-bold rounded-xl text-sm hover:bg-brand-green-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Admitting...' : 'Confirm Admission'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
