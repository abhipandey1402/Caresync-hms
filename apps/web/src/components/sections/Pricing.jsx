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
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`} />
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
