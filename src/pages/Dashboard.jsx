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

      // Get unique people from expenses (assuming expenses have participants or person field)
      const uniquePeople = new Set();
      expenses.forEach(exp => {
        if (exp.person) uniquePeople.add(exp.person);
        if (exp.participants) {
          exp.participants.forEach(p => uniquePeople.add(p));
        }
      });

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
      const now = new Date();
      const upcomingReminders = allReminders
        .filter(reminder => {
          const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
          return reminderDateTime >= now && !reminder.notified;
        })
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

      setReminders(upcomingReminders);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
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

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Header with Refresh */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-xl text-white/80">Track your expenses and settlements at a glance</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-6 py-3 rounded-lg border border-white/30 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
            <p className="text-sm text-white/60">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30s
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <AnimatePresence mode="wait">
              {statsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-white/20 cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
                  <p className="text-xs text-white/60">{card.subtitle}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Recent Expenses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <Receipt className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Recent Expenses</h2>
            </div>
            {recentExpenses.length === 0 ? (
              <p className="text-white/80">No expenses yet. Start tracking your spending!</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense, index) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{expense.title || expense.description}</h3>
                        <p className="text-white/70 text-sm mt-1">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Reminders Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Upcoming Reminders</h2>
            </div>
            {loadingReminders ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : reminders.length === 0 ? (
              <p className="text-white/80">No reminders set. Use the navigation menu to add reminders.</p>
            ) : (
              <div className="space-y-4">
                {reminders.slice(0, 3).map((reminder, index) => (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-white/70 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{reminder.title}</h3>
                        <p className="text-white/70 text-sm mt-1">
                          {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                        </p>
                        {reminder.description && (
                          <p className="text-white/60 text-sm mt-2">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {reminders.length > 3 && (
                  <p className="text-white/60 text-sm text-center">
                    And {reminders.length - 3} more... View all in Reminders section.
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <p className="text-white/80">
              Use the navigation menu to add expenses, view settlements, send reminders, or export your data.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
