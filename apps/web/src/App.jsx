import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { SocialProofBar } from './components/sections/SocialProofBar';
import { ProblemSolution } from './components/sections/ProblemSolution';
import { Features } from './components/sections/Features';
import { AbdmCompliance } from './components/sections/AbdmCompliance';
import { Pricing } from './components/sections/Pricing';
import { Testimonials } from './components/sections/Testimonials';
import { HowItWorks } from './components/sections/HowItWorks';
import { ComparisonTable } from './components/sections/ComparisonTable';
import { FinalCTA } from './components/sections/FinalCTA';
import { WhatsAppFAB } from './components/ui/WhatsAppFAB';

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/router/ProtectedRoute';
import { PatientSearch } from './features/patients/components/PatientSearch';
import { PatientRegistration } from './features/patients/components/PatientRegistration';
import { PatientProfile } from './features/patients/components/PatientProfile';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { LoginPage } from './features/auth/components/LoginPage';
import { AccessDeniedPage } from './features/auth/components/AccessDeniedPage';
import { StaffManagement } from './features/settings/components/StaffManagement';
import { AuditLogs } from './features/settings/components/AuditLogs';

import { DashboardShell } from './components/layout/DashboardShell';
import { DashboardHome } from './features/dashboard/components/DashboardHome';
import { NotificationCenter } from './features/dashboard/components/NotificationCenter';
import { OpdPage } from './features/opd/components/OpdPage';
import { BillingPage } from './features/billing/components/BillingPage';
import { PrescriptionPage } from './features/prescriptions/components/PrescriptionPage';
import { PharmacyPage } from './features/pharmacy/components/PharmacyPage';

function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProofBar />
      <ProblemSolution />
      <Features />
      <AbdmCompliance />
      <Pricing />
      <Testimonials />
      <HowItWorks />
      <ComparisonTable />
      <FinalCTA />
      <WhatsAppFAB />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/access-denied'].includes(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardShell /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="notifications" element={<NotificationCenter />} />
          
          <Route path="patients" element={<ProtectedRoute resource="patients" action="read"><PatientSearch /></ProtectedRoute>} />
          <Route path="patients/new" element={<ProtectedRoute resource="patients" action="write"><PatientRegistration /></ProtectedRoute>} />
          <Route path="patients/:id" element={<ProtectedRoute resource="patients" action="read"><PatientProfile /></ProtectedRoute>} />
          
          <Route path="settings" element={<Navigate to="staff" replace />} />
          <Route path="settings/staff" element={<ProtectedRoute resource="settings" action="*"><StaffManagement /></ProtectedRoute>} />
          <Route path="settings/audit-logs" element={<ProtectedRoute resource="settings" action="*"><AuditLogs /></ProtectedRoute>} />
          <Route path="settings/billing" element={<div className="p-4">Billing & Subscription Placeholder</div>} />

          {/* Placeholders for upcoming epics */}
          <Route path="opd" element={<ProtectedRoute resource="opd" action="read"><OpdPage /></ProtectedRoute>} />
          <Route path="opd/new" element={<ProtectedRoute resource="opd" action="write"><OpdPage /></ProtectedRoute>} />
          <Route path="billing" element={<ProtectedRoute resource="billing" action="read"><BillingPage /></ProtectedRoute>} />
          <Route path="billing/new" element={<ProtectedRoute resource="billing" action="write"><BillingPage /></ProtectedRoute>} />
          
          <Route path="pharmacy/*" element={<ProtectedRoute resource="pharmacy" action="read"><PharmacyPage /></ProtectedRoute>} />
          
          <Route path="ipd" element={<div className="p-4">IPD Module Placeholder</div>} />
          <Route path="ipd/admit" element={<div className="p-4">Admit Patient Placeholder</div>} />
          <Route path="ipd/vitals" element={<div className="p-4">Vitals Placeholder</div>} />
          <Route path="reports" element={<div className="p-4">Reports Module Placeholder</div>} />
          <Route path="prescriptions" element={<ProtectedRoute resource="emr" action="read"><PrescriptionPage /></ProtectedRoute>} />
          <Route path="prescriptions/new" element={<ProtectedRoute resource="emr" action="write"><PrescriptionPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <main className={`flex-grow ${!isAuthPage ? 'pt-24 pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
