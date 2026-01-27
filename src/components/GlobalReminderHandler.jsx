import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/Contexts/AuthContext';
import { remindersAPI } from '@/lib/api';

const GlobalReminderHandler = () => {
    const { user } = useAuth();
    const remindersRef = useRef([]);

    useEffect(() => {
        if (!user) return;

        const markNotified = async (id) => {
            try {
                const reminder = remindersRef.current.find(r => r._id === id);
                if (reminder) {
                    await remindersAPI.update(id, { ...reminder, notified: true });
                    // Update local ref to avoid double notify in same interval loop if needed
                    remindersRef.current = remindersRef.current.map(r => r._id === id ? { ...r, notified: true } : r);
                }
            } catch (err) {
                console.error('Error marking reminder as notified:', err);
            }
        };

        const checkReminders = (reminders) => {
            const now = new Date();
            reminders.forEach(reminder => {
                if (reminder.notified) return;

                // Ensure date parsing matches Dashboard/ReminderNotification logic
                const dateStr = typeof reminder.date === 'string' ? reminder.date.split('T')[0] : new Date(reminder.date).toISOString().split('T')[0];
                const reminderDateTime = new Date(`${dateStr}T${reminder.time}`);

                if (reminderDateTime <= now) {
                    // Trigger notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification(`Reminder: ${reminder.title}`, {
                            body: reminder.description || "It's time!",
                            icon: '/vite.svg'
                        });
                    } else if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                        Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                                new Notification(`Reminder: ${reminder.title}`, {
                                    body: reminder.description || "It's time!",
                                    icon: '/vite.svg'
                                });
                            }
                        });
                    }

                    markNotified(reminder._id);
                }
            });
        };

        const fetchAndCheckReminders = async () => {
            try {
                const data = await remindersAPI.getAll();
                remindersRef.current = data;
                checkReminders(data);
            } catch (error) {
                // Silent catch to prevent console spam
            }
        };

        // Initial check
        fetchAndCheckReminders();

        // Poll every 30 seconds
        const interval = setInterval(fetchAndCheckReminders, 30000);

        // Request permission on mount
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [user]);

    return null; // Render nothing
};

export default GlobalReminderHandler;
