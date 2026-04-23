import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { AdminDashboard } from './AdminDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { PharmacistDashboard } from './PharmacistDashboard';
import { NurseDashboard } from './NurseDashboard';
import { Navigate } from 'react-router-dom';

export const DashboardHome = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  switch (role) {
    case 'owner':
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    default:
      // Fallback or handle unknown roles
      return <Navigate to="/login" replace />;
  }
};
