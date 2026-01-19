import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/Header';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalPeople: 0,
    unsettledDebts: 0,
    totalOwed: 0,
  });
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // 1. Fetch all expenses created by the user, including their participants
        // This ensures we only get data relevant to the authenticated user's created expenses
        const { data: myExpenses, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            id,
            amount,
            expense_participants (
              user_id,
              amount_owed,
              paid_status
            )
          `)
          .eq('user_id', user.id);

        if (expensesError) throw expensesError;

        // Calculate Total Expenses (sum of amounts of expenses created by user)
        const totalExpenses = myExpenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0;

        // Calculate Total People (unique participants in my expenses, excluding myself if I'm somehow listed)
        const allParticipants = myExpenses?.flatMap(exp => exp.expense_participants) || [];
        const uniqueParticipantIds = new Set(allParticipants.map(p => p.user_id));
        // Remove self from count if present (though usually creator isn't a participant in this model, but good to be safe)
        uniqueParticipantIds.delete(user.id);
        const totalPeople = uniqueParticipantIds.size;

        // Calculate Total Owed to Me (sum of unpaid amounts from participants in my expenses)
        const totalOwed = allParticipants
          .filter(p => !p.paid_status && p.user_id !== user.id)
          .reduce((sum, p) => sum + parseFloat(p.amount_owed), 0);

        // 2. Fetch Unsettled Debts (Settlements)
        // Explicitly check for settlements where the user is either debtor or creditor
        const { data: settlements, error: settlementsError } = await supabase
          .from('settlements')
          .select('id')
          .eq('status', 'unpaid')
          .or(`debtor_id.eq.${user.id},creditor_id.eq.${user.id}`);

        if (settlementsError) throw settlementsError;

        const unsettledDebts = settlements?.length || 0;

        setStats({
          totalExpenses: totalExpenses.toFixed(2),
          totalPeople: totalPeople,
          unsettledDebts: unsettledDebts,
          totalOwed: totalOwed.toFixed(2),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) return;

      try {
        setLoadingReminders(true);
        const { data: userReminders, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;

        // Filter out past reminders and sort by upcoming
        const now = new Date();
        const upcomingReminders = userReminders?.filter(reminder => {
          const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
          return reminderDateTime >= now;
        }) || [];

        setReminders(upcomingReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminders();
  }, [user]);

  const statsCards = [
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses}`,
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'People Involved',
      value: stats.totalPeople,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Unsettled Debts',
      value: stats.unsettledDebts,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20',
    },
    {
      title: 'Total Owed',
      value: `$${stats.totalOwed}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
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
        <title>Dashboard - SplitWise</title>
        <meta name="description" content="View your expense dashboard and track settlements" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-xl text-white/80">Track your expenses and settlements at a glance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-white/20`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-2">{card.title}</h3>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Reminders Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Reminders</h2>
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
                    key={reminder.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <h3 className="text-white font-semibold">{reminder.title}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                    </p>
                    {reminder.description && (
                      <p className="text-white/60 text-sm mt-2">{reminder.description}</p>
                    )}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
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