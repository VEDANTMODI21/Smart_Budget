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
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className="text-white/60 mt-1">Here's what's happening with your budget today.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Last updated</p>
              <p className="text-sm text-white/70">{getRelativeTime(lastUpdated)}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl border border-white/10 transition-all font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          ) : (
            statsCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} backdrop-blur-md p-6 border border-white/10`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${card.color} shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    {card.trend && (
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trend.up ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {card.trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {card.trend.value}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{card.title}</h3>
                  <p className="text-3xl font-black text-white mb-1">{card.value}</p>
                  <p className="text-xs text-white/30 font-medium">{card.subtitle}</p>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
              </motion.div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main List Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : stats.recentExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium mb-6">No expenses logged yet.</p>
                  <button
                    onClick={() => window.location.href = '/expenses-tracker'}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentExpenses.map((expense, index) => (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 transition-all flex justify-between items-center cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl overflow-hidden">
                          {expense.category?.charAt(0) || '💰'}
                        </div>
                        <div>
                          <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{expense.title || expense.description}</h3>
                          <p className="text-white/40 text-xs font-semibold">
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Side Panels */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Reminders Panel */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2.5 rounded-xl">
                    <Bell className="w-6 h-6 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Alerts</h2>
                </div>
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                  {stats.activeReminders.length} Active
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : stats.activeReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-white/40">
                  <Calendar className="w-12 h-12 mb-2 opacity-20" />
                  <p>All caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.activeReminders.slice(0, 3).map((reminder, index) => (
                    <motion.div
                      key={reminder._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 border-l-4 border-l-amber-500"
                    >
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate text-sm">{reminder.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                            {new Date(reminder.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                            {reminder.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Tip Panel */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-purple-500/20">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  Pro Tip <span className="inline-block animate-bounce">⚡</span>
                </h3>
                <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
                  Check out the <strong>Settlements</strong> tab to see who owes you money and clear debts in one tap.
                </p>
                <button
                  onClick={() => window.location.href = '/settlements'}
                  className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  Go to Settlements
                </button>
              </div>
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Dashboard;

