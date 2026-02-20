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
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.data) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Password login failed:', error);
    } finally {
      setAuthLoading(false);
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
        <meta name="description" content="Secure login with OTP or Password" />
      </Helmet>

      {/* Decorative background effects */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#010409]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden premium-glow glow-blue border-white/[0.05]">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 glass-morphism rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
                <LogIn className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter mb-3 uppercase italic">
                {loginMethod === 'otp'
                  ? (step === 1 ? "System Login" : "Authorization")
                  : "Legacy Login"}
              </h1>
              <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">
                {loginMethod === 'otp'
                  ? (step === 1 ? "Initialize secure session tunnel." : "Decrypting access token Sent To Inbox.")
                  : "Authenticate via secure password."}
              </p>
            </motion.div>
          </div>

          <div className="flex p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-[1.2rem] mb-8 relative">
            <button
              onClick={() => { setLoginMethod('otp'); setStep(1); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${loginMethod === 'otp' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
            >
              OTP Protocol
            </button>
            <button
              onClick={() => { setLoginMethod('password'); setStep(1); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${loginMethod === 'password' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
            >
              Standard ID
            </button>
            <motion.div
              layoutId="login-method"
              className="absolute inset-1.5 w-[calc(50%-6px)] bg-blue-600/20 border border-blue-500/30 rounded-xl"
              animate={{ x: loginMethod === 'otp' ? 0 : '100%' }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === 'otp' ? (
              step === 1 ? (
                <motion.form
                  key="otp-step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <Label htmlFor="email-otp" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Secure Identifier</Label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        id="email-otp"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-16 pr-6 py-6 glass-input rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none"
                        placeholder="USER@DOMAIN.COM"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all transform active:scale-[0.98] group"
                  >
                    {otpLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        GENERATE KEY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerify}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Dynamic Passcode</Label>
                    <div className="relative group">
                      <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                        className="w-full pl-16 pr-6 py-6 glass-input rounded-2xl text-white placeholder-white/5 focus:outline-none tracking-[0.8em] font-black text-center text-2xl"
                        placeholder="••••••"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3 px-2">
                      {timeLeft > 0 ? (
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3 text-blue-500/40" /> Token Valid: {formatTime(timeLeft)}
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
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all transform active:scale-[0.98]"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
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
                      className="flex items-center gap-2 text-blue-400/40 hover:text-blue-400 transition-colors text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                      <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                      RE-REQUEST
                    </button>
                  </div>
                </motion.form>
              )
            ) : (
              <motion.form
                key="password-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handlePasswordLogin}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="pm-email" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Network ID</Label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="pm-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-16 pr-6 py-5 glass-input rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none"
                      placeholder="USER@DOMAIN.COM"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pm-password" className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Secret Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="pm-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-16 pr-6 py-5 glass-input rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all transform active:scale-[0.98] mt-4"
                >
                  {authLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      INITIATE SESSION <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center pt-8 border-t border-white/[0.05]">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-loose">
              No Profile Found?{' '}
              <Link to="/otp-signup" className="text-white hover:text-blue-400 transition-all ml-2 underline underline-offset-[12px] decoration-white/10 hover:decoration-blue-400/50 block mt-2">
                Register New Identity
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpLoginPage;
