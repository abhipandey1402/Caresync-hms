import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterPatient } from '../hooks/usePatients';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Loader2, CloudOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';

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
        navigate('/dashboard/patients', { state: { message: "Patient saved offline. Will sync when online." }});
      } else {
        navigate(`/dashboard/patients/${patient._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register patient");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Patient"
        subtitle="Create a new patient profile"
        breadcrumb={[
          { label: 'Directory', href: '/dashboard/patients' },
          { label: 'New Patient' }
        ]}
        actions={
          !isOnline && (
            <div className="flex items-center gap-2 px-3 py-2 bg-brand-gold/10 text-brand-gold rounded-xl text-sm font-bold border border-brand-gold/20">
              <CloudOff size={16} />
              <span className="hidden sm:inline">Offline Mode - Will sync later</span>
            </div>
          )
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6 sm:p-8 font-body">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Full Name *</label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm font-medium"
                placeholder="e.g. Ramesh Kumar"
              />
              {errors.name && <p className="text-brand-error text-xs font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Phone Number *</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm font-medium"
                placeholder="10 digit number"
              />
              {errors.phone && <p className="text-brand-error text-xs font-medium">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Gender *</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm font-medium bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-brand-error text-xs font-medium">{errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm font-medium"
              />
              {errors.dateOfBirth && <p className="text-brand-error text-xs font-medium">{errors.dateOfBirth.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-sec uppercase tracking-wider">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm font-medium bg-white"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodGroup && <p className="text-brand-error text-xs font-medium">{errors.bloodGroup.message}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard/patients')}
              className="px-6 py-3 bg-white border border-brand-border text-[#0F1F17] rounded-xl hover:bg-brand-bg transition-colors font-bold text-sm shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 transition-colors flex items-center gap-2 font-bold text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
