import { motion } from 'framer-motion';

export function SectionWrapper({ children, id, className = '', bgClass = '' }) {
  return (
    <section id={id} className={`py-20 md:py-32 overflow-hidden ${bgClass} ${className}`}>
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
