import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, User, ArrowRight, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOtp } from '@/contexts/OtpContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const OtpSignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { generateAndSendOtp, verifyOtp, resendOtp, loading: otpLoading } = useOtp();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    otp: ''
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Demo Mode State
  const [demoCode, setDemoCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && demoCode) {
      setDemoCode(null); // Expire the visual code
    }
    return () => clearInterval(timer);
  }, [timeLeft, demoCode]);

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
      setDemoCode(result.code);
      setTimeLeft(600); // 10 minutes
      setStep(2);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!formData.otp) return;
    setAuthLoading(true);

    const verifyResult = await verifyOtp(formData.email, formData.otp);

    if (verifyResult.success) {
      // 2. Create user account
      // We use the OTP as the password so that the login flow (which sets pass to OTP) stays consistent
      const { error } = await signUp(formData.email, formData.otp, formData.name);
      
      if (!error) {
        navigate('/dashboard');
      }
    }
    setAuthLoading(false);
  };

  const handleResend = async () => {
    const result = await resendOtp(formData.email, 'signup');
    if (result.success) {
      setDemoCode(result.code);
      setTimeLeft(600);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - SplitWise</title>
        <meta name="description" content="Create an account using OTP verification" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Demo/Test Box */}
          <AnimatePresence>
            {demoCode && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                  DEMO MODE
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-800 mb-1">Testing Credentials</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      Enter the code below to verify your account.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="bg-white px-4 py-2 rounded border-2 border-dashed border-yellow-300">
                        <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest">
                          {demoCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-200/50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Expires in {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block p-4 bg-white/20 rounded-full mb-4"
              >
                <UserPlus className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-white/80">
                {step === 1 ? "Join us to track expenses easily" : "Verify your email address"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                   <div>
                    <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-white text-purple-600 hover:bg-white/90 py-3 rounded-lg font-semibold transition-all group"
                  >
                    {otpLoading ? 'Generating Code...' : (
                      <span className="flex items-center justify-center gap-2">
                        Get Verification Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="otp" className="text-white mb-2 block">Verification Code</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        id="otp"
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all tracking-[0.5em] font-mono text-lg"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={authLoading || otpLoading}
                    className="w-full bg-white text-purple-600 hover:bg-white/90 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    {authLoading ? 'Creating Account...' : 'Verify & Create Account'}
                  </Button>

                  <div className="flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      Change Details
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={otpLoading}
                      className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                Already have an account?{' '}
                <Link to="/otp-login" className="text-white font-semibold hover:underline transition-all">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OtpSignupPage;