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
