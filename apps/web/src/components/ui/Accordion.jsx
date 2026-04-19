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
              <ChevronDown className={`w-5 h-5 text-brand-green transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
