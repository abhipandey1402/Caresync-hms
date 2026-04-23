import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@shared';
import { FormField } from '@/components/ui/FormField';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, Lock, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { addToast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  
  // Simulated backend states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  // Pre-fill tenantSlug from registration redirect
  const prefillSlug = location.state?.tenantSlug || '';
  const registrationMessage = location.state?.message;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: prefillSlug }
  });

  // Lockout Timer Effect
  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer(t => t - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0); // Reset after lockout expires
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const onSubmitPassword = async (data) => {
    if (failedAttempts >= 5) return;
    
    try {
      const response = await api.post('/auth/login', data);
      const { tenantId, slug, trialEndsAt, accessToken } = response.data.data;

      // Decode JWT payload (base64) to extract user identity — no library needed
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      
      const user = { _id: payload.sub, role: payload.role, tenantId: payload.tid };
      const tenant = { _id: tenantId, slug, trialEndsAt };

      setAuth(user, tenant, accessToken);
      
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
      addToast(`Login successful! स्वागत है 🎉`, "success");
    } catch (err) {
      console.error('Login error:', err);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setLockoutTimer(30 * 60);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        addToast(err.response?.data?.message || `❌ गलत credentials — ${5 - newAttempts} और कोशिश बाकी हैं`, "error");
      }
    }
  };

  const onSendOtp = async () => {
    // Currently OTP is not implemented in backend, so we keep simulation for now 
    // or just show a message.
    setOtpSent(true);
    addToast("OTP sent successfully (Simulated)", "success");
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async () => {
    if (otp.join('').length === 6) {
      // Simulation for OTP until backend supports it
      addToast("OTP login successful (Simulated)", "success");
      setAuth({ _id: '123', role: 'doctor', name: 'Dr. Sharma' }, { slug: 'demo' }, 'fake-token');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex relative font-body">
      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 lg:left-auto lg:right-6 z-50 flex items-center gap-2 px-4 py-2 bg-brand-green/10 hover:bg-brand-green/20 backdrop-blur-md border border-brand-green/20 text-brand-green rounded-full text-sm font-medium transition-all group"
      >
        <div className="bg-brand-green/20 p-1 rounded-full group-hover:-translate-x-1 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </div>
        Home
      </Link>

      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-[40%] bg-brand-green p-12 flex-col justify-between text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-brand-green font-bold text-xl">+</span>
            </div>
            <span className="text-2xl font-bold font-display">CareSync</span>
          </div>

          <h1 className="text-4xl font-display leading-tight mb-8">
            Digital Health के साथ<br/>अपने क्लीनिक को आगे बढ़ाएं
          </h1>

          <div className="space-y-8">
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
                <Sparkles className="text-brand-gold w-5 h-5" />
              </div>
              <div>
                <p className="font-bold mb-1">Superfast OPD</p>
                <p className="text-sm text-white/70">Patient registration और billing अब 20 seconds से भी कम में।</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
                <Check className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="font-bold mb-1">WhatsApp Integration</p>
                <p className="text-sm text-white/70">Prescriptions और bills सीधे patient के WhatsApp पर भेजें।</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <p className="italic text-lg mb-4 text-white/90">"CareSync ने हमारे क्लीनिक के सभी registers हटा दिए। अब सब कुछ phone पर है और हिसाब बिल्कुल साफ रहता है।"</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center font-bold">DS</div>
            <div>
              <p className="font-bold text-sm">Dr. Sandeep Gupta</p>
              <p className="text-xs text-white/60">Gupta Clinic, Varanasi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 bg-white"
      >
        <div className="w-full max-w-[420px] mx-auto">
          {failedAttempts >= 5 && lockoutTimer > 0 ? (
            <div className="p-8 text-center bg-brand-errorBg rounded-3xl border-2 border-brand-error/20 shadow-xl">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-brand-error shadow-md border border-brand-error/10">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-brand-error font-display mb-4">Account Locked</h2>
              <p className="text-brand-text-sec text-base mb-8 leading-relaxed">
                सुरक्षा कारणों से आपका account lock कर दिया गया है।<br/>कृपया इतने समय बाद दोबारा कोशिश करें:
              </p>
              <div className="bg-white border-2 border-brand-error/30 text-brand-error font-mono text-3xl font-bold py-4 rounded-2xl mb-8 shadow-inner">
                {formatTime(lockoutTimer)}
              </div>
              <a href="#" className="inline-flex items-center gap-2 text-brand-text font-bold hover:text-brand-green transition-colors">
                Support Team से बात करें <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <motion.div
              animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <div className="lg:hidden flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">+</span>
                  </div>
                  <span className="text-2xl font-bold font-display text-brand-green">CareSync</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-brand-text mb-2">वापस आए! स्वागत है</h2>
                <p className="text-brand-text-sec font-medium">अपने क्लीनिक account में login करें</p>
                {registrationMessage && (
                  <div className="mt-4 px-4 py-3 bg-brand-green/10 border border-brand-green/30 rounded-xl text-brand-green text-sm font-medium">
                    ✓ {registrationMessage}
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isOtpMode ? (
                  <motion.form 
                    key="pass-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSubmit(onSubmitPassword)} 
                    className="space-y-6"
                  >
                    <FormField label="Clinic Slug" hint="Registration के बाद मिला था, जैसे: sharma-nursing-patna" error={errors.tenantSlug?.message}>
                      <input
                        {...register('tenantSlug')}
                        className={`w-full px-4 py-3.5 rounded-2xl border-2 transition-all outline-none font-mono text-sm ${errors.tenantSlug ? 'border-brand-error bg-brand-errorBg' : 'border-brand-border focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                        placeholder="sharma-nursing-patna"
                      />
                    </FormField>

                    <FormField label="Phone Number" error={errors.phone?.message}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-sec font-bold border-r border-brand-border pr-3">+91</span>
                        <input
                          {...register('phone')}
                          className={`w-full pl-16 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none ${errors.phone ? 'border-brand-error bg-brand-errorBg' : 'border-brand-border focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                          placeholder="98765 43210"
                        />
                      </div>
                    </FormField>

                    <div className="space-y-1.5">
                      <FormField label="Password" error={errors.password?.message}>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            {...register('password')}
                            className={`w-full px-4 py-3.5 rounded-2xl border-2 transition-all outline-none ${errors.password ? 'border-brand-error bg-brand-errorBg' : 'border-brand-border focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-sec hover:text-brand-green transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormField>
                      <div className="flex justify-end pt-1">
                        <a href="#" className="text-sm font-bold text-brand-green hover:underline">पासवर्ड भूल गए? →</a>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold hover:bg-brand-green-mid transition-all active:scale-[0.98] shadow-lg shadow-brand-green/20 flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Login करें"}
                    </button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-border"></div></div>
                      <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest"><span className="bg-white px-4 text-brand-text-sec">या</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOtpMode(true)}
                      className="w-full bg-white text-brand-text border-2 border-brand-border py-3.5 rounded-2xl font-bold hover:bg-brand-muted transition-all active:scale-[0.98]"
                    >
                      Login with OTP
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {!otpSent ? (
                      <>
                        <FormField label="Phone Number">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-sec font-bold border-r border-brand-border pr-3">+91</span>
                            <input
                              type="tel"
                              placeholder="98765 43210"
                              className="w-full pl-16 pr-4 py-3.5 rounded-2xl border-2 border-brand-border focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none transition-all"
                            />
                          </div>
                        </FormField>
                        <button
                          onClick={onSendOtp}
                          className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold hover:bg-brand-green-mid transition-all shadow-lg"
                        >
                          OTP भेजें
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center space-y-2 mb-4">
                          <p className="text-brand-text-sec font-medium">6-digit OTP आपके नंबर पर भेजा गया है</p>
                        </div>
                        <div className="flex justify-between gap-2 sm:gap-3">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={el => otpRefs.current[i] = el}
                              type="text"
                              inputMode="numeric"
                              value={digit}
                              onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                              onKeyDown={e => handleOtpKeyDown(i, e)}
                              className="w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-brand-border focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 outline-none bg-white transition-all shadow-sm"
                            />
                          ))}
                        </div>
                        <button
                          onClick={submitOtp}
                          disabled={otp.join('').length < 6}
                          className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold hover:bg-brand-green-mid transition-all disabled:opacity-50 shadow-lg flex justify-center items-center gap-2"
                        >
                          Login करें <ChevronRight className="w-5 h-5" />
                        </button>
                        <button className="w-full text-sm font-bold text-brand-text-sec hover:text-brand-green">OTP दोबारा भेजें</button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setIsOtpMode(false)}
                      className="w-full text-sm font-bold text-brand-text-sec hover:text-brand-text py-2"
                    >
                      Use Password Instead
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 text-center">
                <p className="text-brand-text-sec font-medium">
                  नया क्लीनिक है? <Link to="/register" className="text-brand-green font-bold hover:underline">अभी Register करें →</Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
