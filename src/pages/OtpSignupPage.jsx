import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, User, ArrowRight, RefreshCw, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { useOtp } from '@/Contexts/OtpContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const OtpSignupPage = () => {
  const navigate = useNavigate();
  const { signUp, loginWithOTP } = useAuth();
  const { generateAndSendOtp, resendOtp, loading: otpLoading } = useOtp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    otp: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    const result = await generateAndSendOtp(formData.email, 'signup');
    if (result.success) {
      setTimeLeft(600); // 10 minutes
      setStep(2);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!formData.otp) return;
    setAuthLoading(true);

    try {
      const result = await loginWithOTP(formData.email, formData.otp, formData.name);
      if (result.data) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResend = async () => {
    const result = await resendOtp(formData.email, 'signup');
    if (result.success) {
      setTimeLeft(600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <Helmet>
        <title>Create Account | Smart Budget</title>
        <meta name="description" content="Create an account using OTP verification" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden premium-glow glow-purple">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
                <UserPlus className="w-10 h-10 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter mb-3 uppercase italic">
                {step === 1 ? "New Identity" : "Auth Protocol"}
              </h1>
              <p className="text-white/40 text-xs font-black tracking-widest uppercase">
                {step === 1
                  ? "Initialize your financial core."
                  : `Decrypting access token Sent To Inbox.`}
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Display Name</Label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-5 glass-morphism !bg-white/[0.02] rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none focus:!bg-white/[0.05] focus:border-purple-500/30 transition-all border-transparent"
                        placeholder="ENTITY NAME"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Network Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-5 glass-morphism !bg-white/[0.02] rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none focus:!bg-white/[0.05] focus:border-purple-500/30 transition-all border-transparent"
                        placeholder="ENTITY@DOMAIN.COM"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-8 rounded-[1.5rem] font-black text-xs tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all transform active:scale-[0.98] group mt-4"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      GENERATE KEY <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Dynamic Passcode</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      id="otp"
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="w-full pl-14 pr-6 py-5 glass-morphism !bg-white/[0.02] rounded-2xl text-white placeholder-white/5 focus:outline-none focus:!bg-white/[0.05] transition-all tracking-[0.8em] font-black text-center text-2xl border-transparent"
                      placeholder="••••••"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-2">
                    {timeLeft > 0 ? (
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3 text-purple-500/40" /> Token Valid: {formatTime(timeLeft)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-red-500/60 font-black uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Token Expired
                      </p>
                    )}
                  </div>
                </div>

                <div className="glass-morphism !bg-amber-500/5 !border-amber-500/10 rounded-2xl p-4">
                  <p className="text-[9px] text-amber-200/40 text-center leading-relaxed font-black tracking-wider uppercase">
                    Protocol Note: Check Browser Console for Debug OTP
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={authLoading || otpLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-8 rounded-[1.5rem] font-black text-xs tracking-[0.2em] shadow-2xl shadow-purple-600/20 transition-all transform active:scale-[0.98]"
                >
                  {authLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      AUTHORIZE ACCESS <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="flex justify-between items-center px-2 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white/20 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.2em]"
                  >
                    RETURN TO ID
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={otpLoading}
                    className="flex items-center gap-2 text-purple-400/40 hover:text-purple-400 transition-colors text-[9px] font-black uppercase tracking-[0.2em]"
                  >
                    <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                    RE-REQUEST
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center pt-8 border-t border-white/5">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              Already Registered?{' '}
              <Link to="/otp-login" className="text-white hover:text-purple-400 transition-all ml-2 underline underline-offset-8 decoration-white/10 hover:decoration-purple-400">
                Log In Tunnel
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpSignupPage;
