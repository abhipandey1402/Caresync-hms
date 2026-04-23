import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerTenantSchema } from '@shared';
import { FormField } from '@/components/ui/FormField';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: '', color: 'bg-transparent' };
  let score = 0;
  if (password.length >= 8) score += 33;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 33;
  if (/\d/.test(password)) score += 34;
  
  if (score < 50) return { score: 33, text: 'कमज़ोर password', color: 'bg-brand-error' };
  if (score < 100) return { score: 66, text: 'ठीक है, और मज़बूत करें', color: 'bg-brand-gold' };
  return { score: 100, text: '✓ मज़बूत password', color: 'bg-brand-green' };
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [clinicSlug, setClinicSlug] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerTenantSchema)
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    try {
      // Strip empty optional fields — backend regex fails on empty strings
      const { confirmPassword, ...rest } = data;
      const payload = {
        ...rest,
        gstin: rest.gstin?.trim() || undefined,
        email: rest.email?.trim() || undefined,
      };

      const response = await api.post('/tenants/register', payload);
      const { trialEndsAt: serverTrialEndsAt, slug } = response.data.data;

      const trialDate = serverTrialEndsAt ? new Date(serverTrialEndsAt) : (() => {
        const d = new Date(); d.setDate(d.getDate() + 90); return d;
      })();
      setTrialEndsAt(trialDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
      setClinicSlug(slug);

      setShowSuccess(true);
      setTimeout(() => {
        // Pass the clinic slug so login can pre-fill it
        navigate('/login', { state: { tenantSlug: slug, message: 'Account created! Please login.' } });
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        addToast("यह phone number या clinic पहले से registered है", "error");
      } else {
        addToast(err.response?.data?.message || "Registration failed — please try again", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex relative">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 lg:left-auto lg:right-6 z-50 flex items-center gap-2 px-4 py-2 bg-brand-green/10 hover:bg-brand-green/20 backdrop-blur-md border border-brand-green/20 text-brand-green rounded-full text-sm font-medium transition-all group"
      >
        <div className="bg-brand-green/20 p-1 rounded-full group-hover:-translate-x-1 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </div>
        Home
      </Link>

      {/* Left Panel - Hidden on mobile */}
      <motion.div 
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-[40%] bg-brand-green p-12 flex-col justify-between text-white relative overflow-hidden"
      >
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-brand-green font-bold text-xl">+</span>
            </div>
            <span className="text-2xl font-bold font-display">CareSync</span>
          </div>

          <h1 className="text-4xl font-display leading-tight mb-12">
            भारत के क्लीनिक्स के लिए<br/>बनाया गया HMS
          </h1>

          <ul className="space-y-6 text-lg">
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-brand-gold" />
              <span>90 दिन बिल्कुल मुफ्त</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-brand-gold" />
              <span>हिंदी में पूरा सपोर्ट</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-brand-gold" />
              <span>Internet नहीं तो भी काम करेगा</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-6 h-6 text-brand-gold" />
              <span>हमारी टीम आकर Setup करेगी</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 mt-12 pt-12 border-t border-white/20">
          <div className="flex -space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-blue-500 flex items-center justify-center text-xs font-bold">SC</div>
            <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-purple-500 flex items-center justify-center text-xs font-bold">AK</div>
            <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-orange-500 flex items-center justify-center text-xs font-bold">RN</div>
          </div>
          <p className="font-medium">200+ clinics already using CareSync</p>
          <div className="flex items-center gap-1 mt-1 text-brand-gold">
            {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
            <span className="text-white/80 ml-2 text-sm">4.9/5 rating</span>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 overflow-y-auto"
      >
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile header only */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">+</span>
            </div>
            <span className="text-2xl font-bold font-display text-brand-text">CareSync</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-brand-text mb-2">अपना Clinic Register करें</h2>
            <p className="text-brand-gold font-medium">3 महीने free — कोई credit card नहीं</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Clinic Name" labelHi="Clinic / Hospital का नाम" hint="जैसे: Sharma Nursing Home" error={errors.clinicName?.message}>
                <input
                  {...register('clinicName')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.clinicName ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>

              <FormField label="City" labelHi="शहर" hint="जैसे: Patna, Lucknow" error={errors.city?.message}>
                <input
                  {...register('city')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.city ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>

              <FormField label="Owner Name" labelHi="आपका नाम" hint="Doctor का पूरा नाम" error={errors.ownerName?.message}>
                <input
                  {...register('ownerName')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.ownerName ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>

              <FormField label="Phone Number" labelHi="Mobile Number" hint="OTP इसी पर आएगा" error={errors.phone?.message}>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-brand-text-sec font-medium">+91</span>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.phone ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                  />
                </div>
              </FormField>

              <FormField label="Email" labelHi="वैकल्पिक" hint="Bill receipt के लिए" error={errors.email?.message}>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.email ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>

              <FormField label="GSTIN" labelHi="वैकल्पिक" hint="GST invoice के लिए" error={errors.gstin?.message}>
                <input
                  placeholder="10AABCS1429B1Z5"
                  {...register('gstin')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.gstin ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>

              <div className="space-y-1.5">
                <FormField label="Password" labelHi="पासवर्ड" error={errors.password?.message}>
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.password ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                  />
                </FormField>
                {password && !errors.password && (
                  <div className="pt-1">
                    <div className="h-1.5 w-full bg-brand-muted rounded-full overflow-hidden flex">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strength.score === 100 ? 'text-brand-green' : strength.score === 66 ? 'text-brand-gold' : 'text-brand-error'}`}>
                      {strength.text}
                    </p>
                  </div>
                )}
              </div>

              <FormField label="Confirm Password" labelHi="पासवर्ड दोबारा" error={errors.confirmPassword?.message}>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 rounded-xl border-1.5 focus:outline-none transition-all ${errors.confirmPassword ? 'border-brand-error bg-brand-errorBg focus:ring-4 focus:ring-brand-error/10' : 'border-brand-border bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                />
              </FormField>
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting || showSuccess}
                className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-md flex justify-center items-center gap-2
                  ${showSuccess ? 'bg-brand-green text-white cursor-default' : 
                    isSubmitting ? 'bg-brand-green/80 text-white cursor-not-allowed' : 
                    'bg-brand-green text-white hover:bg-brand-green-mid hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {showSuccess ? (
                  <>✓ Successfully Registered!</>
                ) : isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Register हो रहा है...</>
                ) : (
                  <>Clinic Register करें — 90 दिन Free <ChevronRight className="w-5 h-5" /></>
                )}
              </button>

              <p className="text-center text-brand-text-sec font-medium">
                Already registered? <Link to="/login" className="text-brand-green hover:underline">Login →</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-brand-bg flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-brand-border text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              
              <h2 className="text-2xl font-bold font-display text-brand-text mb-4">
                {watch('clinicName')} register हो गया! 🎉
              </h2>
              
              <p className="text-brand-text-sec mb-6">
                आपका 90-day free trial शुरू हो गया।<br/>
                हमारी team आपको 2 घंटे में call करेगी setup के लिए।
              </p>
              
              {clinicSlug && (
                <div className="w-full bg-brand-muted border border-brand-border rounded-xl px-4 py-3 mb-4 text-left">
                  <p className="text-xs text-brand-text-sec font-medium mb-1">आपका Clinic Slug (login में ज़रूरी होगा):</p>
                  <p className="font-mono font-bold text-brand-green text-sm select-all">{clinicSlug}</p>
                </div>
              )}

              <div className="bg-brand-gold/10 text-brand-gold font-medium px-4 py-2 rounded-lg mb-6 border border-brand-gold/20 w-full text-center">
                Trial ends: {trialEndsAt}
              </div>
              
              <button 
                onClick={() => navigate('/login', { state: { tenantSlug: clinicSlug, message: 'Account created! Please login.' } })}
                className="w-full bg-brand-green text-white py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-brand-green-mid transition-colors"
              >
                Dashboard पर जाएं <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
