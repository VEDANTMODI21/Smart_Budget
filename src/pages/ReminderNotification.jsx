import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { remindersAPI } from '@/lib/api';

export default function ReminderNotification() {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReminders();

    // Check for due reminders every minute
    const checkReminders = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
        if (reminderDateTime <= now && !reminder.notified) {
          alert(`Reminder: ${reminder.title}`);
          handleMarkNotified(reminder._id);
        }
      });
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [reminders]);

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

  const handleMarkNotified = async (id) => {
    try {
      const reminder = reminders.find(r => r._id === id);
      await remindersAPI.update(id, { ...reminder, notified: true });
      setReminders(reminders.map(r =>
        r._id === id ? { ...r, notified: true } : r
      ));
    } catch (err) {
      console.error('Error updating reminder:', err);
    }
  };

  const handleAddReminder = async () => {
    if (!title || !date || !time) {
      setError('Title, date, and time are required');
      return;
    }

    try {
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
    }
  };

  const handleDelete = async (id) => {
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
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reminders</h1>
          <p className="text-white/80">Set reminders for important dates and tasks</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-300/50 text-white px-4 py-3 rounded-lg mb-4 backdrop-blur-xl">
            {error}
          </div>
        )}

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Reminder'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Add Reminder</h2>
            <div className="space-y-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to remember?"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 backdrop-blur-xl"
                  placeholder="Additional details..."
                />
              </div>
              <Button onClick={handleAddReminder} className="w-full">Add Reminder</Button>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">
              Upcoming Reminders ({upcomingReminders.length})
            </h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/80">Loading reminders...</p>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/80">No reminders set.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {upcomingReminders.map((reminder) => (
                <div key={reminder._id} className="px-6 py-4 hover:bg-white/5 flex justify-between items-center transition-all">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{reminder.title}</h3>
                    <p className="text-sm text-white/70 mt-1">
                      {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                    </p>
                    {reminder.description && (
                      <p className="text-sm text-white/60 mt-1">{reminder.description}</p>
                    )}
                  </div>
                  <Button variant="danger" onClick={() => handleDelete(reminder._id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
