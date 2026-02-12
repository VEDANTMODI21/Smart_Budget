import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, DollarSign } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Settlements', path: '/settlements' },
    { name: 'Reminders', path: '/reminders' },
    { name: 'Export', path: '/export' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-[100] w-full px-4 pt-4">
      <nav className="max-w-7xl mx-auto glass-morphism rounded-[2rem] px-6 h-20 flex items-center justify-between transition-all duration-500 overflow-hidden">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="group flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              className="p-2.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20"
            >
              <DollarSign className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">SMART</span>
              <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] leading-none mt-1">BUDGET</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-5 py-2 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${isActive(item.path)
                  ? 'text-white'
                  : 'text-white/40 hover:text-white'
                  }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Authenticated as</span>
            <span className="text-sm font-black text-white leading-none">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 p-3 rounded-2xl transition-all border border-white/5 hover:border-red-500/20 active:scale-95"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black">EXIT</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-3 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-90"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden absolute top-24 left-4 right-4 z-[101]"
          >
            <div className="glass-morphism rounded-[2.5rem] p-6 space-y-4 shadow-2xl">
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-6 py-4 rounded-2xl text-sm font-black transition-all ${isActive(item.path)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {item.name.toUpperCase()}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between px-2">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">User</p>
                  <p className="text-white font-black">{user?.name}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-500/10 text-red-400 p-4 rounded-2xl font-black text-xs active:scale-95"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
