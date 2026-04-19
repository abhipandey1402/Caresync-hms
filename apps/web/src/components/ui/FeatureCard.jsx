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
