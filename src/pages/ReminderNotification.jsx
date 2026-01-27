import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Clock, FileText, Bell, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { remindersAPI } from '@/lib/api';
import { Helmet } from 'react-helmet';

export default function ReminderNotification() {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    loadReminders();

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Check intervals
  // Check intervals - REMOVED since GlobalReminderHandler handles this
  // But we might want to refresh the list periodically
  useEffect(() => {
    const refreshList = setInterval(() => {
      loadReminders();
    }, 30000);

    return () => clearInterval(refreshList);
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await remindersAPI.getAll();
      setReminders(data);
    } catch (err) {
      setError(err.message || 'Failed to load reminders');
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!title || !date || !time) {
      setError('Title, date, and time are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const newReminder = await remindersAPI.create({
        title,
        date,
        time,
        description
      });
      setReminders([...reminders, newReminder]);
      setTitle('');
      setDate('');
      setTime('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add reminder');
      console.error('Error adding reminder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this reminder?")) return;

    try {
      await remindersAPI.delete(id);
      setReminders(reminders.filter(r => r._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete reminder');
      console.error('Error deleting reminder:', err);
    }
  };

  const upcomingReminders = reminders
    .filter(r => !r.notified)
    .sort((a, b) => {
      const dateA = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
      const dateB = typeof b.date === 'string' ? b.date.split('T')[0] : new Date(b.date).toISOString().split('T')[0];
      return new Date(`${dateA}T${a.time}`) - new Date(`${dateB}T${b.time}`);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Reminders - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Reminders</h1>
          <p className="text-white/80">Never miss a bill or payment again</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-xl mb-6 backdrop-blur-xl flex items-center gap-2"
            >
              <span className="font-bold">Error:</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-medium text-white/80 mb-2">Upcoming</h2>
              <div className="text-4xl font-bold text-blue-300">
                {upcomingReminders.length}
              </div>
              <p className="text-white/60 text-sm mt-2">
                active reminders
              </p>

              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition duration-200 border border-white/30 flex items-center justify-center gap-2"
              >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
                {showForm ? 'Close Form' : 'Set New Reminder'}
              </button>
            </motion.div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                    <form onSubmit={handleAddReminder} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Title</label>
                        <div className="relative">
                          <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What to remember?"
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-1">Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full pl-10 pr-2 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-1">Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full pl-10 pr-2 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Description</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Additional details..."
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200 border border-blue-400/50 shadow-lg"
                      >
                        {submitting ? 'Scheduling...' : 'Set Reminder'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden min-h-[400px]">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Active Reminders</h2>
                <span className="text-sm text-white/60">{upcomingReminders.length} total</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : upcomingReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-white/60">
                  <div className="bg-white/5 p-4 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg">No active reminders</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {upcomingReminders.map((reminder) => (
                      <motion.div
                        key={reminder._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="px-6 py-4 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{reminder.title}</h3>
                            <div className="text-sm text-white/60 mt-1 flex flex-wrap gap-2">
                              <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">
                                {new Date(reminder.date).toLocaleDateString()}
                              </span>
                              <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">
                                {reminder.time}
                              </span>
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-white/50 mt-2 line-clamp-1">{reminder.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pl-14 sm:pl-0 self-end sm:self-center">
                          <button
                            onClick={(e) => handleDelete(reminder._id, e)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
