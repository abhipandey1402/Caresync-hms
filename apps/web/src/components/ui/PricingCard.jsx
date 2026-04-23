import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export function PricingCard({ plan, isAnnual }) {
  const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
  const isPro = plan.featured;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`flex flex-col p-8 rounded-3xl bg-white border ${isPro ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-brand-border'} shadow-soft relative`}
    >
      {plan.badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          {plan.badge}
        </span>
      )}
      <h3 className="text-2xl font-bold font-display">{plan.name}</h3>
      <p className="text-brand-textSec mt-2 h-12">{plan.target}</p>
      
      <div className="mt-6 mb-8">
        <span className="text-4xl font-bold">₹{price.toLocaleString('en-IN')}</span>
        <span className="text-brand-textSec">/{isAnnual ? 'yr' : 'mo'}</span>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-3">
            {f.active ? (
              <Check className="w-5 h-5 text-brand-greenMid shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-brand-border shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${f.active ? (f.strong ? 'font-bold' : 'text-brand-text') : 'text-brand-textSec/60 line-through'}`}>
              {f.name}
            </span>
          </li>
        ))}
      </ul>
      
      <Link to="/register">
        <Button variant={plan.ctaVariant} className="w-full">{plan.cta}</Button>
      </Link>
    </motion.div>
  );
}
