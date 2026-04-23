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

import { Routes, Route } from 'react-router-dom';
import { PatientSearch } from './features/patients/components/PatientSearch';
import { PatientRegistration } from './features/patients/components/PatientRegistration';
import { PatientProfile } from './features/patients/components/PatientProfile';

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
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patients" element={<PatientSearch />} />
          <Route path="/patients/new" element={<PatientRegistration />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
