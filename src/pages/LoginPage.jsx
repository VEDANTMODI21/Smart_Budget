import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Background floating particles animation configuration
  const particles = [...Array(6)].map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    scale: Math.random() * 0.5 + 0.5,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
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
              x: [`${p.x}%`, `${(p.x + 20) % 100}%`, `${p.x}%`],
              y: [`${p.y}%`, `${(p.y + 20) % 100}%`, `${p.y}%`],
              rotate: [0, 180, 0]
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
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden group hover:border-white/30 transition-all duration-300">

            {/* Glossy sheen effect on card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-center text-4xl font-black text-white tracking-tight drop-shadow-lg">
                Welcome Back
              </h2>
              <p className="mt-3 text-center text-lg text-blue-100/80 font-medium">
                Sign in to manage your empire
              </p>
            </motion.div>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl backdrop-blur-md flex items-center gap-3 shadow-lg"
                >
                  <span className="text-xl">⚠️</span> {error}
                </motion.div>
              )}

              <div className="space-y-5">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    label="Email address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="bg-black/20 border-white/10 focus:bg-black/30 text-lg py-6 transition-all duration-300 hover:bg-black/25"
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-black/20 border-white/10 focus:bg-black/30 text-lg py-6 transition-all duration-300 hover:bg-black/25"
                  />
                </motion.div>
              </div>

              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/otp-login"
                  className="text-sm font-semibold text-blue-200 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="p-1 rounded bg-blue-500/20 group-hover:bg-blue-500/40 transition-all">✨</span>
                  Login with OTP
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-purple-200 hover:text-white transition-colors duration-300"
                >
                  Create Account →
                </Link>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-none group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </span>
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </Button>
              </motion.div>
            </form>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-blue-200/40 text-xs"
          >
            Protected by Smart Budget Security
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
