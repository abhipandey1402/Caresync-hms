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
