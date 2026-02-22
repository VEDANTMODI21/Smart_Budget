import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, Clock, FileText, Save, Loader2 } from 'lucide-react';
import { remindersAPI } from '@/lib/api';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';

export default function ReminderForm({ reminder, onClose, onSuccess }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
    });

    useEffect(() => {
        if (reminder) {
            setFormData({
                title: reminder.title || '',
                description: reminder.description || '',
                date: reminder.date ? new Date(reminder.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                time: reminder.time || '12:00',
            });
        }
    }, [reminder]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const reminderData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
            };

            if (reminder) {
                await remindersAPI.update(reminder.id, reminderData);
            } else {
                await remindersAPI.create(reminderData);
            }

            toast({
                title: reminder ? "Reminder Updated" : "Reminder Created",
                description: `Successfully ${reminder ? 'updated' : 'created'} "${formData.title}"`,
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving reminder:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save reminder",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#1a1f2e] border border-white/10 rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tighter">
                            {reminder ? 'Edit' : 'New'} <span className="text-amber-400">Reminder</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Reminder Title</Label>
                            <div className="relative group">
                                <Bell className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="What should we remind you of?"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Date</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        required
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-all font-bold [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Time</Label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        required
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-all font-bold [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Additional Details</Label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-4 w-4 h-4 text-white/20 group-focus-within:text-amber-400 transition-colors" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Optional notes..."
                                    rows={3}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 py-6 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        {reminder ? 'Update' : 'Schedule'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
