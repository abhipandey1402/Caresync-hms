import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-brand-green" />,
  error: <AlertCircle className="w-5 h-5 text-brand-error" />,
  warning: <AlertTriangle className="w-5 h-5 text-brand-gold" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const BG_COLORS = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-brand-errorBg border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200'
};

const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg w-80 pointer-events-auto ${BG_COLORS[type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[type]}</div>
      <div className="flex-1 text-sm font-medium text-brand-text">
        {message}
      </div>
      <button 
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-brand-text-sec hover:text-brand-text transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-black/10 rounded-b-xl"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
      />
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    setToasts(prev => {
      const newToasts = [...prev, { id: Date.now(), message, type }];
      if (newToasts.length > 3) return newToasts.slice(newToasts.length - 3);
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
