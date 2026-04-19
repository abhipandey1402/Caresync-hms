import { statsConfig } from '../../config/stats.config';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export function SocialProofBar() {
  return (
    <section className="bg-brand-muted py-16 border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl md:text-2xl text-brand-textSec font-medium mb-12">
          Clinics across UP & Bihar are switching from paper to CareSync
        </h2>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-brand-green font-bold text-sm md:text-base opacity-70 mb-16">
          <span>IMA Patna Partner</span>
          <span>ABDM Registered</span>
          <span>90-Day Free Trial</span>
          <span>24/7 Hindi Support</span>
          <span>₹999/month</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 text-center">
          {statsConfig.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-brand-green mb-2">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-brand-textSec">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
