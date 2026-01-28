import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, AlertCircle, TrendingUp, RefreshCw, Bell, Calendar, Receipt } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI, settlementsAPI, remindersAPI } from '@/lib/api';
import Header from '@/components/Header';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalPeople: 0,
    unsettledDebts: 0,
    totalOwed: 0,
    expenseCount: 0,
  });
  const [reminders, setReminders] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);
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

      // Calculate stats from expenses
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const expenseCount = expenses.length;

      // Get unique people from expenses
      const uniquePeople = new Set();
      expenses.forEach(exp => {
        if (exp.person) uniquePeople.add(exp.person);
        if (exp.participants) {
          exp.participants.forEach(p => uniquePeople.add(p));
        }
      });
      // Also from settlements
      settlements.forEach(s => uniquePeople.add(s.person));

      // Calculate unsettled debts
      const unsettledDebts = settlements.filter(s => !s.settled).length;
      const totalOwed = settlements
        .filter(s => !s.settled)
        .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

      setStats({
        totalExpenses: totalExpenses.toFixed(2),
        totalPeople: uniquePeople.size,
        unsettledDebts: unsettledDebts,
        totalOwed: totalOwed.toFixed(2),
        expenseCount: expenseCount,
      });

      // Set recent expenses (last 5)
      setRecentExpenses(expenses.slice(-5).reverse());

      // Filter and sort upcoming reminders
      // Filter and sort active reminders
      const activeReminders = allReminders
        .filter(reminder => !reminder.notified)
        .sort((a, b) => {
          const dateA = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
          const dateB = typeof b.date === 'string' ? b.date.split('T')[0] : new Date(b.date).toISOString().split('T')[0];
          return new Date(`${dateA}T${a.time}`) - new Date(`${dateB}T${b.time}`);
        });

      setReminders(activeReminders);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setLoadingReminders(false);
      if (showRefreshIndicator) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Manual refresh
  const handleRefresh = () => {
    fetchAllData(true);
  };


  const statsCards = [
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses}`,
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      subtitle: `${stats.expenseCount} expenses`,
    },
    {
      title: 'People Involved',
      value: stats.totalPeople,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      subtitle: 'Unique people',
    },
    {
      title: 'Unsettled Debts',
      value: stats.unsettledDebts,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20',
      subtitle: 'Pending settlements',
    },
    {
      title: 'Total Owed',
      value: `$${stats.totalOwed}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      subtitle: 'Money to collect',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Smart Budget</title>
        <meta name="description" content="View your expense dashboard and track settlements" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with Refresh */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-white/80">Overview</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-4 py-2 rounded-lg border border-white/30 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatePresence mode="wait">
              {statsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl p-6 shadow-xl border border-white/20`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
                  <p className="text-xs text-white/50">{card.subtitle}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Expenses Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Receipt className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
              </div>
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60">No expenses yet. Start tracking your spending!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense, index) => (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-all flex justify-between items-center group"
                    >
                      <div>
                        <h3 className="text-white font-semibold truncate max-w-[200px]">{expense.title || expense.description}</h3>
                        <p className="text-white/60 text-xs mt-1">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Reminders Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Bell className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Active Reminders</h2>
              </div>
              {loadingReminders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60">No upcoming reminders.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.slice(0, 4).map((reminder, index) => (
                    <motion.div
                      key={reminder._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{reminder.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">
                              {new Date(reminder.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">
                              {reminder.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {reminders.length > 4 && (
                    <p className="text-white/50 text-xs text-center mt-4">
                      + {reminders.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
