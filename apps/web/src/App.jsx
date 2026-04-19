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

export default function App() {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <Header />
      <main>
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
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
