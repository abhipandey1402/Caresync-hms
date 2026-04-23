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

import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/router/ProtectedRoute';
import { PatientSearch } from './features/patients/components/PatientSearch';
import { PatientRegistration } from './features/patients/components/PatientRegistration';
import { PatientProfile } from './features/patients/components/PatientProfile';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { LoginPage } from './features/auth/components/LoginPage';
import { AccessDeniedPage } from './features/auth/components/AccessDeniedPage';
import { StaffManagement } from './features/settings/components/StaffManagement';
import { AuditLogs } from './features/settings/components/AuditLogs';

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
  const hideShell = isAuthPage || isDashboard;

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen flex flex-col">
      {!hideShell && <Header />}
      <main className={`flex-grow ${!hideShell ? 'pt-24 pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute resource="dashboard" action="read"><div>Dashboard Home Placeholder</div></ProtectedRoute>} />
          
          <Route path="/dashboard/patients" element={<ProtectedRoute resource="patients" action="read"><PatientSearch /></ProtectedRoute>} />
          <Route path="/dashboard/patients/new" element={<ProtectedRoute resource="patients" action="write"><PatientRegistration /></ProtectedRoute>} />
          <Route path="/dashboard/patients/:id" element={<ProtectedRoute resource="patients" action="read"><PatientProfile /></ProtectedRoute>} />
          
          <Route path="/dashboard/settings/staff" element={<ProtectedRoute resource="settings" action="*"><StaffManagement /></ProtectedRoute>} />
          <Route path="/dashboard/settings/audit-logs" element={<ProtectedRoute resource="settings" action="*"><AuditLogs /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
