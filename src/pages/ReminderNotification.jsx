import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Send, Bell } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { settlementsAPI, remindersAPI } from '@/lib/api';
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
      const data = await settlementsAPI.getAll();
      // Filter for debts owed to the current user (in Supabase mode)
      // or just all unpaid settlements (in local mode)
      const filteredData = data.filter(debt => {
        if (debt.expenses) {
          return debt.expenses.user_id === user.id;
        }
        // Local backend settlements are already filtered by user in the API
        return !debt.settled;
      });
      setUnsettledDebts(filteredData || []);
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
    setSendingReminder(debt.id || debt._id);

    try {
      await remindersAPI.sendReminder(debt);

      toast({
        title: "Success",
        description: "Reminder sent successfully!",
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reminder. Please try again.",
      });
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
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
        <title>Reminders | Smart Budget</title>
        <meta name="description" content="Send payment reminders for unsettled expenses" />
      </Helmet>

      <div className="min-h-screen relative">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
              Payment <span className="text-gradient">Reminders</span>
            </h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">
              Automated Settlement Protocol • Debt Enforcement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unsettledDebts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full glass-card rounded-[2.5rem] p-24 text-center overflow-hidden premium-glow glow-blue"
              >
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
                    <Bell className="w-12 h-12 text-white/10" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">All Clear</h3>
                  <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No outstanding debts detected in system.</p>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              </motion.div>
            ) : (
              unsettledDebts.map((debt, index) => (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card rounded-[2rem] p-8 overflow-hidden premium-glow glow-purple group cursor-pointer"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 glass-morphism rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Send className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Outstanding</p>
                        <p className="text-3xl font-black text-white tracking-tighter">
                          ${parseFloat(debt.amount_owed || debt.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-purple-400 transition-colors">
                          {debt.expenses?.description || debt.description || "Expense"}
                        </h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          Subject: <span className="text-white/60">{debt.users?.name || debt.person}</span>
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2">Network Endpoint</p>
                        <p className="text-white/50 text-[10px] font-bold truncate">
                          {debt.users?.email || "ANONYMOUS_ENTITY"}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => sendReminder(debt)}
                      disabled={sendingReminder === (debt.id || debt._id)}
                      className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl py-7 font-black text-[10px] tracking-[0.2em] shadow-2xl shadow-purple-900/20 active:scale-[0.98] transition-all"
                    >
                      {sendingReminder === (debt.id || debt._id) ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          TRANSMITTING...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          DEPLOY REMINDER <Send className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Decorative side blob */}
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-700 pointer-events-none" />
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