import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, AlertCircle, TrendingUp, RefreshCw, Bell, Calendar, Receipt, ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI, settlementsAPI, remindersAPI } from '@/lib/api';
import Header from '@/components/Header';
import Skeleton from '@/components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    expenses: [],
    settlements: [],
    reminders: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all data
  const fetchAllData = useCallback(async (showRefreshIndicator = false) => {
    if (!user) return;

    if (showRefreshIndicator) setRefreshing(true);

    try {
      // Fetch expenses, settlements, and reminders in parallel
      const [expenses, settlements, allReminders] = await Promise.all([
        expensesAPI.getAll(),
        settlementsAPI.getAll(),
        remindersAPI.getAll(),
      ]);

      setData({
        expenses,
        settlements,
        reminders: allReminders
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, [user]);

  // Use useMemo for stats calculation to avoid re-calculating on every render
  const stats = useMemo(() => {
    const { expenses, settlements, reminders } = data;

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const expenseCount = expenses.length;

    const uniquePeople = new Set();
    expenses.forEach(exp => {
      if (exp.person) uniquePeople.add(exp.person);
      if (exp.participants) {
        exp.participants.forEach(p => uniquePeople.add(p));
      }
    });
    settlements.forEach(s => uniquePeople.add(s.person));

    const unsettledDebts = settlements.filter(s => !s.settled).length;
    const totalOwed = settlements
      .filter(s => !s.settled)
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

    const activeReminders = reminders
      .filter(reminder => !reminder.notified)
      .sort((a, b) => {
        const dateA = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
        const dateB = typeof b.date === 'string' ? b.date.split('T')[0] : new Date(b.date).toISOString().split('T')[0];
        return new Date(`${dateA}T${a.time}`) - new Date(`${dateB}T${b.time}`);
      });

    const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return {
      totalExpenses: totalExpenses.toFixed(2),
      totalPeople: uniquePeople.size,
      unsettledDebts,
      totalOwed: totalOwed.toFixed(2),
      expenseCount,
      activeReminders,
      recentExpenses
    };
  }, [data]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 60 seconds (increased from 30 to reduce load)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleRefresh = () => {
    fetchAllData(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const statsCards = [
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses}`,
      icon: DollarSign,
      color: 'bg-blue-500',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      subtitle: `${stats.expenseCount} entries`,
      trend: { value: 'Steady', up: true }
    },
    {
      title: 'Active Partners',
      value: stats.totalPeople,
      icon: Users,
      color: 'bg-purple-500',
      gradient: 'from-purple-500/20 to-pink-500/20',
      subtitle: 'Sharing costs',
      trend: { value: stats.totalPeople > 0 ? 'Active' : 'Empty', up: stats.totalPeople > 0 }
    },
    {
      title: 'Pending Issues',
      value: stats.unsettledDebts,
      icon: AlertCircle,
      color: 'bg-orange-500',
      gradient: 'from-orange-500/20 to-red-500/20',
      subtitle: 'Awaiting settlement',
      trend: { value: stats.unsettledDebts > 0 ? 'Urgent' : 'Clear', up: stats.unsettledDebts === 0 }
    },
    {
      title: 'Outstanding',
      value: `$${stats.totalOwed}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      gradient: 'from-green-500/20 to-emerald-500/20',
      subtitle: 'Accounts receivable',
      trend: { value: 'Live', up: true }
    },
  ];

  const getRelativeTime = (date) => {
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Dashboard | Smart Budget</title>
        <meta name="description" content="Manage your expenses with style" />
      </Helmet>

      <Header />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              Welcome back, <br />
              <span className="text-gradient">
                {user?.name?.split(' ')[0]}!
              </span>
            </h1>
            <p className="text-white/40 text-lg font-medium">Your financial overview is looking sharp today.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">Live Sync Status</p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-white/60 font-bold">{getRelativeTime(lastUpdated)}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="glass-morphism px-6 py-3 rounded-2xl flex items-center gap-3 text-white font-bold transition-all hover:bg-white/20 active:bg-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing' : 'Refresh'}</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-3xl" />
            ))
          ) : (
            statsCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative glass-card p-6 rounded-[2rem] overflow-hidden premium-glow ${index % 2 === 0 ? 'glow-blue' : 'glow-purple'}`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <div className={`p-4 rounded-2xl ${card.color} bg-opacity-20 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    {card.trend && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 ${card.trend.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {card.trend.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {card.trend.value.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tighter">{card.value}</span>
                    </div>
                    <p className="text-xs text-white/20 font-bold mt-1">{card.subtitle}</p>
                  </div>
                </div>

                {/* Animated Background Decorative Element */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700 group-hover:scale-150" />
              </motion.div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Section */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/20 shadow-inner">
                    <Receipt className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-0.5">Transaction Timeline</p>
                  </div>
                </div>
                <button className="hover:bg-white/5 p-2 rounded-xl transition-colors">
                  <MoreHorizontal className="w-7 h-7 text-white/30" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
              ) : stats.recentExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 animate-float">
                    <Receipt className="w-12 h-12 text-white/10" />
                  </div>
                  <p className="text-white/40 text-lg font-bold mb-8">Your expense log is currently empty.</p>
                  <button
                    onClick={() => window.location.href = '/expenses-tracker'}
                    className="group flex items-center gap-3 bg-white text-[#030711] px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
                  >
                    <Plus className="w-6 h-6" />
                    Record First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {stats.recentExpenses.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 10 }}
                      className="group glass-morphism !bg-white/[0.02] hover:!bg-white/[0.06] rounded-2xl p-5 transition-all flex justify-between items-center cursor-pointer border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 glass-morphism rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xl">
                          {expense.category?.charAt(0) || '💰'}
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-black tracking-tight group-hover:text-blue-400 transition-colors uppercase">{expense.title || expense.description}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-blue-400/60 text-[10px] font-black uppercase tracking-wider">{expense.category}</span>
                            <span className="text-white/20 text-[10px] font-black">•</span>
                            <span className="text-white/30 text-[10px] font-black uppercase tracking-wider">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform">${parseFloat(expense.amount).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Decorative side blob */}
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
          </motion.div>

          {/* Side Panels */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
            {/* Reminders Panel */}
            <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/10">
                    <Bell className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">System Alerts</h2>
                </div>
                {stats.activeReminders.length > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-amber-500 text-[#030711] text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/20"
                  >
                    {stats.activeReminders.length}
                  </motion.div>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
              ) : stats.activeReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/20 relative z-10">
                  <div className="p-4 rounded-full bg-white/5 mb-4 blur-sm">
                    <Calendar className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">No Alerts Pending</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {stats.activeReminders.slice(0, 3).map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-morphism !bg-white/[0.02] hover:!bg-white/[0.05] rounded-2xl p-4 flex items-center gap-4 border-l-[6px] border-l-amber-500 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 glass-morphism rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black truncate text-sm uppercase tracking-tight">{reminder.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                              {new Date(reminder.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/20 font-black">|</span>
                          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                            {reminder.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Callout */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl shadow-blue-500/20 cursor-pointer"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  Featured Tool
                </div>
                <h3 className="text-3xl font-black mb-4 leading-tight tracking-tighter">
                  Settle Balances <br />
                  <span className="text-blue-200">Instantly.</span>
                </h3>
                <p className="text-blue-100/60 text-sm font-medium leading-relaxed mb-8 max-w-[200px]">
                  Take control of your shared finances with automated settlements.
                </p>
                <button
                  onClick={() => window.location.href = '/settlements'}
                  className="bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-black text-sm transition-all hover:bg-blue-50 hover:shadow-xl active:scale-95"
                >
                  Manage Now
                </button>
              </div>

              {/* Abstract decorative elements */}
              <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute top-10 right-10 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                <Users size={80} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Dashboard;

