import { SectionWrapper } from '../ui/SectionWrapper';
import { Button } from '../ui/Button';
import { ShieldCheck, MapPin, Star, Banknote, Headphones } from 'lucide-react';

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
          <span className="flex items-center gap-2"><Headphones size={18} /> Hindi Support</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
