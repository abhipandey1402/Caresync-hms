import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseSrc = path.join(__dirname, 'apps/web/src/components/ui');

const files = {};

files['SectionWrapper.jsx'] = `
import { motion } from 'framer-motion';

export function SectionWrapper({ children, id, className = '', bgClass = '' }) {
  return (
    <section id={id} className={\`py-20 md:py-32 overflow-hidden \${bgClass} \${className}\`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}
`;

files['Button.jsx'] = `
import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200";
  const variants = {
    primary: "bg-brand-green text-white hover:bg-brand-greenMid shadow-soft hover:-translate-y-0.5",
    ghost: "bg-transparent text-brand-green hover:bg-brand-muted",
    outline: "border-2 border-brand-border text-brand-green hover:bg-brand-muted hover:-translate-y-0.5"
  };
  const sizes = {
    default: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    sm: "h-10 px-4 text-sm"
  };

  return (
    <button ref={ref} className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';
`;

files['Badge.jsx'] = `
export function Badge({ children, color = 'saffron', className = '' }) {
  const colors = {
    saffron: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
    green: "bg-brand-green/10 text-brand-green border-brand-green/20"
  };

  return (
    <span className={\`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider \${colors[color]} \${className}\`}>
      {children}
    </span>
  );
}
`;

files['AnimatedCounter.jsx'] = `
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration, isInView]);

  // Format with integer vs float depending on the value
  const displayVal = value % 1 !== 0 
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString('en-IN');

  return <span ref={ref}>{displayVal}</span>;
}
`;

files['FeatureCard.jsx'] = `
import { motion } from 'framer-motion';

export function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-6 rounded-2xl bg-white border border-brand-border shadow-soft"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-muted flex items-center justify-center text-brand-green mb-4">
        {Icon && <Icon size={24} />}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-brand-textSec">{desc}</p>
    </motion.div>
  );
}
`;

files['PricingCard.jsx'] = `
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from './Button';

export function PricingCard({ plan, isAnnual }) {
  const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
  const isPro = plan.featured;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={\`flex flex-col p-8 rounded-3xl bg-white border \${isPro ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-brand-border'} shadow-soft relative\`}
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
            <span className={\`text-sm \${f.active ? (f.strong ? 'font-bold' : 'text-brand-text') : 'text-brand-textSec/60 line-through'}\`}>
              {f.name}
            </span>
          </li>
        ))}
      </ul>
      
      <Button variant={plan.ctaVariant} className="w-full">{plan.cta}</Button>
    </motion.div>
  );
}
`;

files['TestimonialCard.jsx'] = `
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function TestimonialCard({ quote, author, clinic, stars, meta }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-8 pb-10 rounded-3xl bg-white border border-brand-border shadow-soft flex flex-col h-full"
    >
      <div className="flex gap-1 mb-6">
        {Array.from({length: stars}).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
        ))}
      </div>
      
      <p className="text-xl md:text-2xl font-display font-medium leading-relaxed flex-1 mb-8 text-brand-text">
        "{quote}"
      </p>
      
      <div>
        <strong className="block font-bold">{author}</strong>
        <span className="block text-brand-textSec text-sm mt-1">{clinic}</span>
        <span className="block text-brand-textSec text-xs mt-1 uppercase tracking-wider">{meta}</span>
      </div>
    </motion.div>
  );
}
`;

files['StepCard.jsx'] = `
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
`;

files['WhatsAppFAB.jsx'] = `
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WhatsAppFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <a 
      href="https://wa.me/911234567890" 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-transform animate-bounce"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} fill="currentColor" />
    </a>
  );
}
`;

files['Accordion.jsx'] = `
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Accordion({ faq }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div className="space-y-4">
      {faq.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border border-brand-border rounded-xl bg-white overflow-hidden">
            <button 
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between p-6 text-left font-bold"
            >
              <span className="pr-4">{item.q}</span>
              <ChevronDown className={\`w-5 h-5 text-brand-green transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="px-6 pb-6 text-brand-textSec">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
`;

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseSrc, file), content.trim() + '\\n');
});

console.log('UI Components generated successfully!');
