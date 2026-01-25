import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, CreditCard, PieChart, Bell, Download, Wallet } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Settlements', path: '/settlements', icon: Wallet },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Export', path: '/export', icon: Download },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Smart Budget
            </span>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`
                          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex items-center pl-4 border-l border-white/20 space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-white/90">
                    <div className="bg-blue-500/20 p-1.5 rounded-full border border-blue-400/30">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center p-2 rounded-lg text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white font-medium text-sm transition-colors"
                >
                  Login
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold border border-white/20 shadow-lg backdrop-blur-sm transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

