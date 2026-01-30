import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Send, Bell } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ReminderNotification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unsettledDebts, setUnsettledDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);

  useEffect(() => {
    fetchUnsettledDebts();
  }, [user]);

  const fetchUnsettledDebts = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_participants')
        .select(`
          *,
          users!expense_participants_user_id_fkey (name, email),
          expenses (
            user_id,
            description,
            amount,
            users!expenses_user_id_fkey (name, email)
          )
        `)
        .eq('paid_status', false)
        .eq('expenses.user_id', user.id);

      if (error) throw error;
      setUnsettledDebts(data || []);
    } catch (error) {
      console.error('Error fetching unsettled debts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch unsettled debts",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (debt) => {
    setSendingReminder(debt.id);

    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: JSON.stringify({
          debtor_email: debt.users.email,
          debtor_name: debt.users.name,
          creditor_email: debt.expenses.users.email,
          creditor_name: debt.expenses.users.name,
          amount: debt.amount_owed,
          expense_description: debt.expenses.description,
        }),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder sent successfully!",
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reminder. Please try again.",
      });
    } finally {
      setSendingReminder(null);
    }
  };

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
        <title>Reminders - SplitWise</title>
        <meta name="description" content="Send payment reminders for unsettled expenses" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Payment Reminders</h1>
            <p className="text-white/80">Send reminders for unsettled debts</p>
          </motion.div>

          <div className="space-y-4">
            {unsettledDebts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center border border-white/20"
              >
                <Bell className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-white text-lg">No unsettled debts to remind about.</p>
              </motion.div>
            ) : (
              unsettledDebts.map((debt, index) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {debt.expenses.description}
                      </h3>
                      <p className="text-white/80 mb-2">
                        <span className="font-semibold">{debt.users.name}</span> owes{' '}
                        <span className="text-2xl font-bold text-white">
                          ${parseFloat(debt.amount_owed).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-white/60 text-sm">{debt.users.email}</p>
                    </div>
                    <Button
                      onClick={() => sendReminder(debt)}
                      disabled={sendingReminder === debt.id}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {sendingReminder === debt.id ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReminderNotification;