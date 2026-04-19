import * as Icons from 'lucide-react';

export function StepCard({ step, index }) {
  const Icon = Icons[step.icon];
  return (
    <div className="relative flex flex-col items-center text-center group">
      <div className="w-16 h-16 rounded-2xl bg-brand-muted border border-brand-border flex items-center justify-center text-brand-green mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110">
        {Icon && <Icon size={32} />}
        <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-gold text-white font-bold flex items-center justify-center text-sm border-2 border-white">
          {index + 1}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-3">{step.title}</h3>
      <p className="text-brand-textSec">{step.desc}</p>
    </div>
  );
}
