import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, KeyRound, ArrowRight, RefreshCw, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { useOtp } from '@/Contexts/OtpContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const OtpLoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loginWithOTP } = useAuth();
  const { generateAndSendOtp, resendOtp, loading: otpLoading } = useOtp();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    const result = await generateAndSendOtp(email, 'login');
    if (result.success) {
      if (result.previewUrl) {
        window.open(result.previewUrl, '_blank');
      }
      setTimeLeft(600); // 10 minutes
      setStep(2);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setAuthLoading(true);

    try {
      const result = await loginWithOTP(email, otp);
      if (result.data) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login verification failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResend = async () => {
    const result = await resendOtp(email, 'login');
    if (result.success) {
      setTimeLeft(600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Helmet>
        <title>Login | Smart Budget</title>
        <meta name="description" content="Secure login with OTP" />
      </Helmet>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 md:p-16 border border-white/10 relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-12 justify-center">
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
          </div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
                {step === 1 ? "Sign In" : "Verify Code"}
              </h1>
              <p className="text-white/40 font-medium">
                {step === 1
                  ? "Enter your email to access your dashboard"
                  : `We've sent a 6-digit code to ${email}`}
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
                className="space-y-8"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.25rem] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-lg"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 py-8 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-500/10 transition-all transform active:scale-95 group"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Continue <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Verification Code</Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.25rem] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all tracking-[0.5em] font-black text-2xl"
                      placeholder="••••••"
                    />
                  </div>
                  {timeLeft > 0 && (
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-2 ml-1">
                      <Clock className="w-3 h-3" /> Code expires in {formatTime(timeLeft)}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={authLoading || otpLoading}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 py-8 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-95"
                >
                  {authLoading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Complete Secure Login <CheckCircle2 className="w-6 h-6" />
                    </span>
                  )}
                </Button>

                <div className="flex justify-between items-center px-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    Edit Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={otpLoading}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                    Resend Code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center pt-8 border-t border-white/5">
            <p className="text-white/30 font-medium">
              New to SplitWise?{' '}
              <Link to="/otp-signup" className="text-white font-black hover:text-blue-400 transition-all ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpLoginPage;
