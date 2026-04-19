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
