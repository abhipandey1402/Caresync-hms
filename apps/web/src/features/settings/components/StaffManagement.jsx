import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Edit2, Ban, RefreshCw } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/Toast';

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const getAvatarColor = (name) => {
  const colors = ['#1A6B3C', '#2563EB', '#9333EA', '#DC2626', '#D97706', '#0891B2'];
  return colors[name.charCodeAt(0) % colors.length];
};

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-brand-green text-white',
    doctor: 'bg-[#E8F5EE] text-[#1A6B3C]',
    receptionist: 'bg-[#EFF6FF] text-[#1E40AF]',
    pharmacist: 'bg-[#FDF4E7] text-[#92400E]',
    nurse: 'bg-[#F5F0FF] text-[#5B21B6]',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
      {role}
    </span>
  );
};

export const StaffManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(null);
  const { addToast } = useToast();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const selectedRole = watch('role', '');

  // Mock data
  const [staff, setStaff] = useState([
    { id: 1, name: 'Dr. Rajesh Sharma', role: 'doctor', speciality: 'Orthopedics', phone: '+91 98765 43210', lastLogin: '2 hrs ago', active: true, mci: 'MCI-12345' },
    { id: 2, name: 'Sunita Devi', role: 'receptionist', phone: '+91 87654 32109', lastLogin: '1 day ago', active: true },
    { id: 3, name: 'Amit Kumar', role: 'pharmacist', phone: '+91 76543 21098', lastLogin: '1 week ago', active: false },
  ]);

  const onAddSubmit = (data) => {
    setStaff([...staff, { id: Date.now(), ...data, active: true, lastLogin: 'Never' }]);
    setIsAddModalOpen(false);
    reset();
    addToast(`${data.name} added — WhatsApp पर password भेजा गया`, "success");
  };

  const toggleStatus = (id, newStatus) => {
    setStaff(staff.map(s => s.id === id ? { ...s, active: newStatus } : s));
    setIsDeactivateOpen(null);
    addToast(newStatus ? "Staff reactivated" : "Staff deactivated", newStatus ? "success" : "warning");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text font-display">Staff Management</h1>
          <p className="text-sm text-brand-text-sec mt-1">अपने clinic की team manage करें</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-mid transition-colors flex items-center gap-2 font-medium shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.map((member) => (
          <div key={member.id} className={`bg-white rounded-2xl p-6 border ${member.active ? 'border-brand-border shadow-soft' : 'border-gray-200 bg-gray-50 opacity-75'} transition-all`}>
            <div className="flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm"
                style={{ backgroundColor: member.active ? getAvatarColor(member.name) : '#9CA3AF' }}
              >
                {getInitials(member.name)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-brand-text font-display">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleBadge role={member.role} />
                      {!member.active && <span className="text-xs font-medium text-gray-500">Inactive ○</span>}
                    </div>
                  </div>
                  {member.active && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span> Active
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-brand-text-sec">
                  {member.speciality && <p><strong>Speciality:</strong> {member.speciality}</p>}
                  <p><strong>Phone:</strong> {member.phone}</p>
                  <p><strong>Last login:</strong> {member.lastLogin}</p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button className="flex-1 py-2 border border-brand-border rounded-lg text-brand-text hover:bg-brand-muted font-medium transition-colors flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  {member.active ? (
                    <button 
                      onClick={() => setIsDeactivateOpen(member)}
                      className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" /> Deactivate
                    </button>
                  ) : (
                    <button 
                      onClick={() => toggleStatus(member.id, true)}
                      className="flex-1 py-2 border border-brand-green/30 text-brand-green rounded-lg hover:bg-brand-green/5 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Slide-over */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-brand-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-brand-border/50 bg-brand-bg">
                <h2 className="text-xl font-bold text-brand-text font-display">नया Staff Member Add करें</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-brand-muted rounded-full">
                  <X className="w-5 h-5 text-brand-text-sec" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <form id="add-staff-form" onSubmit={handleSubmit(onAddSubmit)} className="space-y-6">
                  <FormField label="Full Name *" error={errors.name?.message}>
                    <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="Enter full name" />
                  </FormField>
                  
                  <FormField label="Phone Number *" error={errors.phone?.message}>
                    <input {...register('phone', { required: 'Phone is required' })} className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="10 digit number" />
                  </FormField>

                  <FormField label="Role *" error={errors.role?.message}>
                    <select {...register('role', { required: 'Role is required' })} className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green outline-none bg-white">
                      <option value="">Select Role</option>
                      <option value="doctor">🟢 Doctor</option>
                      <option value="receptionist">🔵 Receptionist</option>
                      <option value="pharmacist">🟡 Pharmacist</option>
                      <option value="nurse">🟣 Nurse</option>
                    </select>
                  </FormField>

                  {selectedRole === 'doctor' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                      <FormField label="Speciality" error={errors.speciality?.message}>
                        <input {...register('speciality')} className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g. General Physician" />
                      </FormField>
                      <FormField label="MCI/NMC Reg No." hint="Optional" error={errors.mci?.message}>
                        <input {...register('mci')} className="w-full px-4 py-2 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="Registration number" />
                      </FormField>
                    </motion.div>
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
                    <span className="text-xl">ℹ️</span>
                    <p>Temporary password WhatsApp पर भेजा जाएगा। वे login के बाद इसे बदल सकते हैं।</p>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-brand-border/50 bg-brand-bg flex justify-end gap-3">
                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 border border-brand-border rounded-lg font-medium text-brand-text-sec hover:bg-brand-muted">
                  Cancel
                </button>
                <button type="submit" form="add-staff-form" className="px-6 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-mid shadow-md">
                  Add Member
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deactivate Dialog */}
      <AnimatePresence>
        {isDeactivateOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
              <h3 className="text-xl font-bold text-brand-text mb-2 font-display">{isDeactivateOpen.name} को Deactivate करें?</h3>
              <p className="text-brand-text-sec text-sm leading-relaxed mb-6">
                यह user login नहीं कर पाएगा। इनका data delete नहीं होगा। कभी भी फिर activate किया जा सकता है।
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeactivateOpen(null)} className="flex-1 py-2 border border-brand-border rounded-lg font-medium text-brand-text-sec hover:bg-brand-muted">
                  Cancel
                </button>
                <button onClick={() => toggleStatus(isDeactivateOpen.id, false)} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md">
                  हाँ, Deactivate करें
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
