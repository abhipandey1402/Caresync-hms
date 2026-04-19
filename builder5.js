import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseSrc = path.join(__dirname, 'apps/web/src');

const files = {};

files['components/sections/ComparisonTable.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { comparisonConfig } from '../../config/comparison.config';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function ComparisonTable() {
  const getIcon = (pass) => {
    if (pass === true) return <CheckCircle2 className="w-5 h-5 text-brand-greenMid mx-auto md:mx-0" />;
    if (pass === false) return <XCircle className="w-5 h-5 text-[#FF4B4B] mx-auto md:mx-0" />;
    if (pass === 'warn') return <AlertCircle className="w-5 h-5 text-brand-gold mx-auto md:mx-0" />;
    return <span className="text-brand-textSec text-sm">-</span>;
  };

  return (
    <SectionWrapper id="compare" bgClass="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold">CareSync vs other HMS software</h2>
      </div>

      <div className="overflow-x-auto pb-8">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-border">
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[0]}</th>
              <th className="text-left p-4 font-bold text-brand-green bg-brand-muted rounded-t-xl w-1/4">{comparisonConfig.headers[1]}</th>
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[2]}</th>
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[3]}</th>
            </tr>
          </thead>
          <tbody>
            {comparisonConfig.rows.map((row, i) => (
              <tr key={i} className="border-b border-brand-border/50 hover:bg-brand-muted/20 transition-colors">
                <td className="p-4 font-bold text-brand-text">{row.feature}</td>
                <td className="p-4 font-bold text-brand-text bg-brand-muted/40">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.caresync.pass)}
                    <span className="hidden md:inline">{row.caresync.val}</span>
                  </div>
                </td>
                <td className="p-4 text-brand-textSec text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.comp.pass)}
                    <span className="hidden md:inline">{row.comp.val}</span>
                  </div>
                </td>
                <td className="p-4 text-brand-textSec text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.paper.pass)}
                    <span className="hidden md:inline">{row.paper.val}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
`;

files['components/sections/FinalCTA.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { Button } from '../ui/Button';
import { ShieldCheck, MapPin, Star, Banknote, HeadphonesIcon } from 'lucide-react';

export function FinalCTA() {
  return (
    <SectionWrapper id="cta" bgClass="bg-brand-green relative overflow-hidden" className="py-24 md:py-32">
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAFDF9 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-green to-transparent opacity-80 pointer-events-none"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
          Your clinic deserves better than paper registers
        </h2>
        <p className="text-xl md:text-2xl text-brand-muted/90 mb-12">
          3 months free. Full setup done by us. Works in Hindi. Works offline.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Button size="lg" className="bg-white text-brand-green hover:bg-brand-muted border-none relative overflow-hidden group">
            <span className="relative z-10">Start 90-Day Free Trial</span>
          </Button>
          <Button size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white/10">
            Talk to Us on WhatsApp
          </Button>
        </div>
        
        <p className="text-white/60 mb-16 text-sm">
          No credit card • No contract • Cancel anytime • Setup done by our team
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/80 font-bold text-sm">
          <span className="flex items-center gap-2"><ShieldCheck size={18} /> DPDP Act Compliant</span>
          <span className="flex items-center gap-2"><MapPin size={18} /> Data in India</span>
          <span className="flex items-center gap-2 text-brand-gold"><Star size={18} fill="currentColor" /> 4.9/5 Rating</span>
          <span className="flex items-center gap-2"><Banknote size={18} /> ABDM Registered</span>
          <span className="flex items-center gap-2"><HeadphonesIcon size={18} /> Hindi Support</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
`;

files['App.jsx'] = `
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
`;

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseSrc, file), content.trim() + '\\n');
});

console.log('App components generated completely!');
