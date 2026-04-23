import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FormField = ({ label, labelHi, error, hint, children }) => {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-brand-text">
          {label} {labelHi && <span className="text-brand-text-sec text-xs ml-1 font-normal">({labelHi})</span>}
        </label>
      </div>
      
      <div className="relative">
        {children}
      </div>
      
      <div className="min-h-[20px]">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -5, x: 0 }}
              animate={{ opacity: 1, y: 0, x: [-2, 2, -2, 2, 0] }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-1.5 text-brand-error text-xs font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : hint ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-brand-text-sec text-xs"
            >
              {hint}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
