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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0f1d]">
      <Helmet>
        <title>Login | Smart Budget</title>
        <meta name="description" content="Secure login with OTP" />
      </Helmet>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] shadow-2xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <LogIn className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                {step === 1 ? "Welcome Back" : "Verify Code"}
              </h1>
              <p className="text-white/40 text-sm font-medium leading-relaxed">
                {step === 1
                  ? "Enter your email to receive a secure access code."
                  : `We've sent a 6-digit code to your email. Check your inbox.`}
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] group"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Access Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">6-Digit Code</Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all tracking-[0.5em] font-bold text-center text-xl"
                      placeholder="••••••"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1">
                    {timeLeft > 0 ? (
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Expires in {formatTime(timeLeft)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        Code expired
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mb-2">
                  <p className="text-[10px] text-amber-200/40 text-center leading-relaxed font-medium">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">Note:</span> Real emails aren't enabled. Find your code in the <strong className="text-amber-300">Browser Console (F12)</strong>.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={authLoading || otpLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98]"
                >
                  {authLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Verify & Login <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="flex justify-between items-center px-1 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white/30 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider"
                  >
                    Edit Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={otpLoading}
                    className="flex items-center gap-2 text-blue-400/60 hover:text-blue-400 transition-colors text-[10px] font-bold uppercase tracking-wider"
                  >
                    <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                    Resend Code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center pt-8 border-t border-white/5">
            <p className="text-white/20 text-xs font-medium">
              New to Smart Budget?{' '}
              <Link to="/otp-signup" className="text-white hover:text-blue-400 transition-all ml-1 font-bold underline underline-offset-4 decoration-white/10 hover:decoration-blue-400/40">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpLoginPage;
