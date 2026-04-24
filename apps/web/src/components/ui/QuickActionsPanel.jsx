import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Stethoscope, Receipt, BedDouble, Pill, Activity, FileText, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const ALL_ACTIONS = [
  {
    id: 'register',
    label: 'Register',
    labelHi: 'नया मरीज़',
    icon: <UserPlus size={28} />,
    href: '/dashboard/patients/new',
    roles: ['admin', 'receptionist']
  },
  {
    id: 'opd',
    label: 'OPD Visit',
    labelHi: 'नई OPD',
    icon: <Stethoscope size={28} />,
    href: '/dashboard/opd/new',
    roles: ['admin', 'receptionist', 'doctor']
  },
  {
    id: 'bill',
    label: 'Create Bill',
    labelHi: 'नया Bill',
    icon: <Receipt size={28} />,
    href: '/dashboard/billing/new',
    roles: ['admin', 'receptionist']
  },
  {
    id: 'admit',
    label: 'Admit',
    labelHi: 'IPD Admit',
    icon: <BedDouble size={28} />,
    href: '/dashboard/ipd/admit',
    roles: ['admin', 'receptionist', 'doctor']
  },
  {
    id: 'pos',
    label: 'POS Sale',
    labelHi: 'दवा बेचें',
    icon: <Pill size={28} />,
    href: '/dashboard/pharmacy/pos',
    roles: ['admin', 'pharmacist']
  },
  {
    id: 'vitals',
    label: 'Vitals',
    labelHi: 'Vitals लें',
    icon: <Activity size={28} />,
    href: '/dashboard/ipd/vitals',
    roles: ['admin', 'nurse', 'doctor']
  },
  {
    id: 'rx',
    label: 'Prescription',
    labelHi: 'पर्चा लिखें',
    icon: <FileText size={28} />,
    href: '/dashboard/prescriptions/new',
    roles: ['admin', 'doctor']
  },
  {
    id: 'reports',
    label: 'Report',
    labelHi: 'रिपोर्ट्स',
    icon: <BarChart3 size={28} />,
    href: '/dashboard/reports',
    roles: ['admin']
  }
];

export const QuickActionsPanel = ({ className }) => {
  const user = useAuthStore(state => state.user);
  const userRole = user?.role || 'receptionist'; // Fallback for dev

  const visibleActions = ALL_ACTIONS.filter(action => action.roles.includes(userRole));

  if (visibleActions.length === 0) return null;

  return (
    <div className={cn("bg-white border border-brand-border rounded-[14px] shadow-sm p-5", className)}>
      <h3 className="font-display font-bold text-[#0F1F17] text-lg leading-tight mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {visibleActions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className="group flex flex-col items-center justify-center bg-brand-bg border border-brand-border rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-brand-green/30 hover:bg-brand-green/5 focus:outline-none focus:ring-2 focus:ring-brand-green/50"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-green mb-3 shadow-sm group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="font-bold text-sm text-[#0F1F17] leading-tight mb-0.5">{action.labelHi}</span>
            <span className="text-[11px] font-medium text-brand-text-sec">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
