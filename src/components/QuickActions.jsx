import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, Bell, X, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        {
            name: 'New Expense',
            icon: Receipt,
            color: 'bg-emerald-500',
            path: '/expenses-tracker',
            delay: 0.1
        },
        {
            name: 'Set Reminder',
            icon: Bell,
            color: 'bg-amber-500',
            path: '/reminders',
            delay: 0.2
        },
        {
            name: 'New Settlement',
            icon: DollarSign,
            color: 'bg-blue-500',
            path: '/settlements',
            delay: 0.3
        }
    ];

    return (
        <div className="fixed bottom-10 right-10 z-[200]">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-4 mb-6">
                        {actions.map((action) => (
                            <motion.button
                                key={action.name}
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                transition={{ duration: 0.3, delay: action.delay }}
                                onClick={() => {
                                    navigate(action.path);
                                    setIsOpen(false);
                                }}
                                className="group flex items-center gap-4 focus:outline-none"
                            >
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#030711]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                                    {action.name}
                                </span>
                                <div className={`${action.color} p-4 rounded-2xl text-white shadow-2xl shadow-${action.color.split('-')[1]}-500/20 hover:scale-110 active:scale-95 transition-all`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 overflow-hidden relative group ${isOpen ? 'bg-red-500 rotate-45' : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                    }`}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </motion.button>

            {/* Background overlay when open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-[#030711]/40 backdrop-blur-sm -z-10 h-screen w-screen"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuickActions;
