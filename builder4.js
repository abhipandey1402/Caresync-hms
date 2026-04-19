import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseSrc = path.join(__dirname, 'apps/web/src/components/sections');

const files = {};

files['ProblemSolution.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { ArrowDown } from 'lucide-react';

export function ProblemSolution() {
  return (
    <SectionWrapper id="problem-solution" bgClass="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Running a clinic shouldn't feel like this</h2>
        <p className="text-xl text-brand-textSec">Every day without CareSync looks the same</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">🗒️</div>
          <h3 className="font-bold text-lg mb-2">Lost prescription? Rewrite from scratch — again.</h3>
          <p className="text-brand-textSec text-sm">Doctor rewrites the same Rx for the same patient every visit because records are on paper.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">💸</div>
          <h3 className="font-bold text-lg mb-2">GST notice coming because your bills aren't compliant.</h3>
          <p className="text-brand-textSec text-sm">Handwritten bills with no GSTIN, no serial numbers, no tax breakdown.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">💊</div>
          <h3 className="font-bold text-lg mb-2">Expired medicines discovered — ₹40,000 loss.</h3>
          <p className="text-brand-textSec text-sm">No expiry tracking, no alerts, no FIFO stock management.</p>
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center text-brand-green">
          <ArrowDown size={24} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">Patient history in 3 seconds, forever.</h3>
          <p className="text-brand-textSec text-sm">UHID-tagged records, ABHA-linked, searchable by name or phone.</p>
        </div>
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">GST-compliant invoice sent to WhatsApp instantly.</h3>
          <p className="text-brand-textSec text-sm">Auto-calculated CGST/SGST, sequential invoice numbers, PDF on WhatsApp.</p>
        </div>
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">Expiry alerts 90 days before — never lose money.</h3>
          <p className="text-brand-textSec text-sm">Batch tracking, FIFO deduction, daily alerts on WhatsApp.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
`;

files['Features.jsx'] = `
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Badge } from '../ui/Badge';
import { featuresConfig } from '../../config/features.config';

export function Features() {
  return (
    <SectionWrapper id="features" bgClass="bg-brand-bg">
      <div className="space-y-32">
        {featuresConfig.map((feat, idx) => {
          const Icon = Icons[feat.iconName];
          const isLeft = feat.imageAlign === 'left';
          
          return (
            <div key={feat.id} className={\`grid lg:grid-cols-2 gap-16 items-center \${isLeft ? '' : 'lg:-scale-x-100'}\`}>
              
              {/* Image / Mockup side */}
              <div className={\`relative \${isLeft ? '' : 'lg:-scale-x-100'}\`}>
                <div className="aspect-square md:aspect-video lg:aspect-square bg-brand-muted rounded-[2rem] p-8 border border-brand-border flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green bg-opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Abstract placeholder for the mockup */}
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-border z-10">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-muted">
                        <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                          {Icon && <Icon size={24} />}
                        </div>
                        <div>
                          <p className="font-bold">{feat.badge} Dashboard</p>
                          <p className="text-xs text-brand-textSec">CareSync HMS • Live</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-brand-muted rounded-full w-3/4"></div>
                      <div className="h-4 bg-brand-muted rounded-full w-full"></div>
                      <div className="h-4 bg-brand-muted rounded-full w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className={\`\${isLeft ? '' : 'lg:-scale-x-100'}\`}>
                <div className="inline-flex items-center gap-2 mb-6">
                  <Badge color="green">{feat.badge}</Badge>
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">{feat.heading}</h3>
                <p className="text-lg text-brand-textSec mb-8 leading-relaxed">{feat.body}</p>
                
                <ul className="space-y-4">
                  {feat.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-brand-text">
                      <Icons.CheckCircle2 className="w-6 h-6 text-brand-greenMid shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
`;

files['AbdmCompliance.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { Badge } from '../ui/Badge';
import { FileDigit, Banknote, Building2 } from 'lucide-react';

export function AbdmCompliance() {
  return (
    <SectionWrapper id="abdm" bgClass="bg-gradient-to-b from-[#E8F5EE] to-[#FAFDF9] border-y border-brand-border">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-8">🏛️ ABDM Compliant • National Health Mission Partner</Badge>
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">ABHA-linked records. Ayushman Bharat ready.</h2>
        <p className="text-lg text-brand-textSec leading-relaxed">
          CareSync is registered on the Ayushman Bharat Digital Mission (ABDM) Health Facility Registry. Every patient can get an ABHA ID created right from the registration screen. This means your clinic is future-ready for cashless insurance, government health programs, and digital health incentives.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12 text-center mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <FileDigit size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">ABHA ID Creation</h3>
          <p className="text-sm text-brand-textSec">Create Ayushman Bharat Health Account IDs for patients during registration. One-tap OTP flow.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <Banknote size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">₹100/Year Incentive</h3>
          <p className="text-sm text-brand-textSec">Clinics earn ₹100 per new ABHA ID linked to their facility under NHA's incentive scheme.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">HFR Registration</h3>
          <p className="text-sm text-brand-textSec">Your clinic gets registered on the Health Facility Registry — mandatory for Ayushman Bharat empanelment.</p>
        </div>
      </div>
      
      <p className="text-center text-sm font-bold text-brand-textSec">
        Note: ABDM registration typically takes 2–4 weeks. CareSync helps you through the entire process.
      </p>
    </SectionWrapper>
  );
}
`;

files['Pricing.jsx'] = `
import { useState } from 'react';
import { SectionWrapper } from '../ui/SectionWrapper';
import { PricingCard } from '../ui/PricingCard';
import { Accordion } from '../ui/Accordion';
import { pricingConfig } from '../../config/pricing.config';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <SectionWrapper id="pricing" bgClass="bg-white">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Simple pricing. No hidden fees. Start free.</h2>
        <p className="text-lg text-brand-textSec">3-month free trial on all plans. No card required. Full onboarding included.</p>
        
        <div className="mt-10 flex items-center justify-center gap-4 text-sm font-bold">
          <span className={!isAnnual ? 'text-brand-text' : 'text-brand-textSec'}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)} 
            className="relative w-16 h-8 rounded-full bg-brand-green p-1 transition-colors"
          >
            <div className={\`w-6 h-6 rounded-full bg-white transition-transform \${isAnnual ? 'translate-x-8' : 'translate-x-0'}\`} />
          </button>
          <span className={isAnnual ? 'text-brand-text' : 'text-brand-textSec'}>Annually <span className="ml-2 text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full text-xs">Save 2 months</span></span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16 items-start lg:items-center">
        {pricingConfig.plans.map(plan => (
          <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} />
        ))}
      </div>

      <div className="text-center mb-24">
        <p className="font-bold text-sm text-brand-textSec uppercase tracking-wider mb-4">Add-ons Available</p>
        <div className="flex flex-wrap justify-center gap-3">
          {pricingConfig.addons.map((addon, i) => (
            <span key={i} className="px-4 py-2 bg-brand-muted text-brand-green rounded-full text-sm font-bold border border-brand-border">
              {addon}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        <Accordion faq={pricingConfig.faq} />
      </div>
    </SectionWrapper>
  );
}
`;

files['Testimonials.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { TestimonialCard } from '../ui/TestimonialCard';
import { testimonialsConfig } from '../../config/testimonials.config';
import { ArrowRight } from 'lucide-react';

export function Testimonials() {
  return (
    <SectionWrapper id="testimonials" bgClass="bg-brand-muted diagonal-cut-reverse pb-32">
      <div className="text-center mb-16 pt-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold">What clinic owners in UP & Bihar are saying</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {testimonialsConfig.map(t => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>

      <div className="text-center">
        <a href="#demo" className="inline-flex items-center gap-2 font-bold text-brand-green hover:text-brand-greenMid transition-colors">
          Join 200+ clinics already using CareSync <ArrowRight size={20} />
        </a>
      </div>
    </SectionWrapper>
  );
}
`;

files['HowItWorks.jsx'] = `
import { SectionWrapper } from '../ui/SectionWrapper';
import { StepCard } from '../ui/StepCard';
import { stepsConfig } from '../../config/steps.config';
import { Button } from '../ui/Button';

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" bgClass="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold">Get started in 4 steps. We do the setup.</h2>
      </div>

      <div className="relative mb-16 max-w-5xl mx-auto">
        <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-brand-border border-b-2 border-dashed border-brand-border"></div>
        <div className="grid grid-cols-1 justify-center md:grid-cols-4 gap-12 md:gap-6">
          {stepsConfig.map((step, i) => (
             <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button size="lg">Book Your Free Setup Call →</Button>
      </div>
    </SectionWrapper>
  );
}
`;

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseSrc, file), content.trim() + '\\n');
});

console.log('Sections P1 generated successfully!');
