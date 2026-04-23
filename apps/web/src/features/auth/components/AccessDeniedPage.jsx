import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const role = useAuthStore(s => s.user?.role || 'Guest');

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-green/20">
          <Lock className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-brand-text font-display">
          यह page आपके लिए नहीं है
        </h1>
        
        <p className="text-brand-text-sec leading-relaxed text-lg px-4">
          आपका role <span className="font-bold text-brand-text bg-white px-2 py-0.5 rounded border border-brand-border">'{role}'</span> इस section को<br/>access करने की permission नहीं देता।
        </p>
        
        <div className="pt-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-brand-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-green-mid transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            Back to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-brand-text-sec pt-6">
          गलती लग रही है? Admin से बात करें
        </p>
      </div>
    </div>
  );
};
