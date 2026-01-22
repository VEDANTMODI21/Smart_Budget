import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function OtpSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('info'); // 'info' or 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithOTP, generateOTP: generateOTPAPI } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await generateOTPAPI(email);

      // Show appropriate message based on response
      if (response.previewUrl) {
        // Using Ethereal (testing) - show preview URL
        alert(`OTP sent! Check your email.\n\nPreview URL (for testing):\n${response.previewUrl}\n\nOTP: ${response.otp}`);
      } else if (response.otp) {
        // Email failed or dev mode - show OTP
        alert(`OTP: ${response.otp}\n\n${response.message || 'Check your email for the OTP.'}`);
      } else {
        // Email sent successfully
        alert('OTP sent! Please check your email inbox (and spam folder).');
      }

      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await loginWithOTP(email, otp, name);
      console.log('✅ OTP signup successful:', response);
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ OTP verification failed:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const particles = [...Array(8)].map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    scale: Math.random() * 0.6 + 0.4,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Header />

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 blur-3xl opacity-30"
            initial={{
              x: `${p.x}%`,
              y: `${p.y}%`,
              scale: p.scale
            }}
            animate={{
              x: [`${p.x}%`, `${(p.x - 20 + 100) % 100}%`, `${p.x}%`],
              y: [`${p.y}%`, `${(p.y + 25) % 100}%`, `${p.y}%`],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden group">

            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="text-center">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-white tracking-tight drop-shadow-md"
              >
                Sign up with OTP
              </motion.h2>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 text-purple-200/90 font-medium"
              >
                Fast & Secure Registration
              </motion.p>
            </div>

            {step === 'info' ? (
              <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl backdrop-blur-md"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Input
                    label="Full Name"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="bg-black/20 border-white/10 focus:bg-black/30 text-lg py-5 transition-all hover:bg-black/25"
                  />
                </motion.div>

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Input
                    label="Email address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="bg-black/20 border-white/10 focus:bg-black/30 text-lg py-5 transition-all hover:bg-black/25"
                  />
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </Button>
                </motion.div>

                <div className="text-center mt-4">
                  <Link to="/signup" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                    Wait, I want a password
                  </Link>
                </div>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl backdrop-blur-md">
                    {error}
                  </div>
                )}
                <div className="text-sm text-purple-100 bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  OTP sent to<br />
                  <strong className="text-white text-lg">{email}</strong>
                </div>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Input
                    label="Enter OTP"
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    required
                    className="bg-black/20 border-white/10 focus:bg-black/30 text-2xl text-center tracking-[1em] py-5 font-mono transition-all hover:bg-black/25"
                  />
                </motion.div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={() => {
                      setStep('info');
                      setOtp('');
                      setError('');
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold border-none shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign Up'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
