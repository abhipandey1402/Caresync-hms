import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterPatient } from '../hooks/usePatients';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Loader2, CloudOff, UserPlus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export const PatientRegistration = () => {
  const isOnline = useNetworkStatus();
  const registerPatient = useRegisterPatient();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(patientSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const patient = await registerPatient.mutateAsync(data);
      if (patient.offline) {
        // Patient saved offline
        navigate('/patients', { state: { message: "Patient saved offline. Will sync when online." }});
      } else {
        navigate(`/patients/${patient._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register patient");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-soft border border-brand-border font-body">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-brand-text font-display flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-brand-green" />
          Register Patient
        </h1>
        
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-sm font-medium border border-brand-gold/20">
            <CloudOff className="w-4 h-4" />
            <span>Offline - Will sync later</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-text-sec">Full Name *</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
              placeholder="e.g. Ramesh Kumar"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-text-sec">Phone Number *</label>
            <input
              {...register('phone')}
              className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
              placeholder="10 digit number"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-text-sec">Gender *</label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-text-sec">Date of Birth</label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-6 py-2 border border-brand-border text-brand-text-sec rounded-lg hover:bg-brand-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-mid transition-colors flex items-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Register Patient
          </button>
        </div>
      </form>
    </div>
  );
};
