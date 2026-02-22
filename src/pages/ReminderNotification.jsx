import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bell, Plus, Trash2, Edit2, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { settlementsAPI, remindersAPI } from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ReminderForm from '@/components/ReminderForm';

const ReminderNotification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unsettledDebts, setUnsettledDebts] = useState([]);
  const [generalReminders, setGeneralReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  useEffect(() => {
    fetchAllReminders();
  }, [user]);

  const fetchAllReminders = async () => {
    setLoading(true);
    await Promise.all([
      fetchUnsettledDebts(),
      fetchGeneralReminders()
    ]);
    setLoading(false);
  };

  const fetchUnsettledDebts = async () => {
    try {
      const data = await settlementsAPI.getAll();
      const filteredData = data.filter(debt => {
        if (debt.expenses) {
          return debt.expenses.user_id === user.id;
        }
        return !debt.settled;
      });
      setUnsettledDebts(filteredData || []);
    } catch (error) {
      console.error('Error fetching unsettled debts:', error);
    }
  };

  const fetchGeneralReminders = async () => {
    try {
      const data = await remindersAPI.getAll();
      setGeneralReminders(data || []);
    } catch (error) {
      console.error('Error fetching general reminders:', error);
    }
  };

  const sendReminder = async (debt) => {
    setSendingReminder(debt.id || debt._id);
    try {
      await remindersAPI.sendReminder(debt);
      toast({ title: "Success", description: "Reminder sent successfully!" });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send reminder" });
    } finally {
      setSendingReminder(null);
    }
  };

  const handleToggleNotified = async (reminder) => {
    try {
      const updatedReminder = await remindersAPI.update(reminder.id, {
        ...reminder,
        notified: !reminder.notified
      });
      setGeneralReminders(prev => prev.map(r => r.id === reminder.id ? updatedReminder : r));
      toast({
        title: updatedReminder.notified ? "Marked as Done" : "Marked as Pending",
        description: `"${reminder.title}" status updated.`
      });
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await remindersAPI.delete(id);
      setGeneralReminders(prev => prev.filter(r => r.id !== id));
      toast({ title: "Deleted", description: "Reminder removed successfully" });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete reminder" });
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
                System <span className="text-gradient">Alerts</span>
              </h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">
                Automated Notification Hub • Resource Allocation
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingReminder(null);
                setShowReminderForm(true);
              }}
              className="glass-card !bg-amber-500/10 hover:!bg-amber-500/20 border-amber-500/20 px-8 py-4 rounded-2xl flex items-center gap-3 text-amber-400 font-black text-[10px] tracking-[0.2em] transition-all"
            >
              <Plus className="w-4 h-4" /> SCHEDULE REMINDER
            </motion.button>
          </div>

          <div className="space-y-20">
            {/* General Reminders Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Upcoming Alerts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalReminders.length === 0 ? (
                  <div className="col-span-full glass-card rounded-[2rem] p-12 text-center text-white/20 border-dashed border-white/5">
                    <p className="uppercase tracking-[0.3em] font-black text-xs">No scheduled alerts detected</p>
                  </div>
                ) : (
                  generalReminders.map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-[2rem] p-8 premium-glow glow-amber group relative overflow-hidden"
                    >
                      <div className={`relative z-10 ${reminder.notified ? 'opacity-40' : ''}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-3 rounded-xl border ${reminder.notified ? 'bg-emerald-500/10 border-emerald-500/10' : 'bg-amber-500/10 border-amber-500/10'}`}>
                            {reminder.notified ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Calendar className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleNotified(reminder)}
                              className={`p-2 rounded-lg transition-all ${reminder.notified ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-white/20 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                              title={reminder.notified ? "Mark as Pending" : "Mark as Done"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingReminder(reminder);
                                setShowReminderForm(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className={`text-lg font-black uppercase tracking-tight mb-2 transition-colors ${reminder.notified ? 'text-white/40 line-through' : 'text-white group-hover:text-amber-400'}`}>
                          {reminder.title}
                        </h3>
                        {reminder.description && (
                          <p className="text-white/40 text-xs mb-6 line-clamp-2">{reminder.description}</p>
                        )}

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">
                              {new Date(reminder.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">
                            {reminder.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Payment Reminders Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                  <Send className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Payment Requests</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unsettledDebts.length === 0 ? (
                  <div className="col-span-full glass-card rounded-[2rem] p-12 text-center text-white/20 border-dashed border-white/5">
                    <p className="uppercase tracking-[0.3em] font-black text-xs">No pending debts for enforcement</p>
                  </div>
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
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReminderForm && (
          <ReminderForm
            reminder={editingReminder}
            onClose={() => setShowReminderForm(false)}
            onSuccess={fetchGeneralReminders}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ReminderNotification;