import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Share2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const SharedExpenseView = () => {
  const { token } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedExpenses();
  }, [token]);

  const fetchSharedExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_participants (
            amount_owed,
            paid_status,
            users (name)
          )
        `)
        .eq('share_token', token)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('No expenses found with this share link.');
      } else {
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching shared expenses:', error);
      setError('Failed to load shared expenses. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Shared Expenses - SplitWise</title>
          <meta name="description" content="View shared expense details" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20 max-w-md"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            <p className="text-white/80">{error}</p>
          </motion.div>
        </div>
      </>
    );
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <>
      <Helmet>
        <title>Shared Expenses - SplitWise</title>
        <meta name="description" content="View shared expense details" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Share2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Shared Expenses</h1>
            <p className="text-white/80">View-only access to expense details</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-white">{expenses.length}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-white">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{expense.description}</h3>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </p>
                    <p className="text-white/70 text-sm">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {expense.expense_participants && expense.expense_participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/80 text-sm font-medium mb-2">Participants:</p>
                    <div className="flex flex-wrap gap-2">
                      {expense.expense_participants.map((participant, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/20 rounded-full text-xs text-white"
                        >
                          {participant.users?.name} - ${parseFloat(participant.amount_owed).toFixed(2)}
                          {participant.paid_status && ' ✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedExpenseView;