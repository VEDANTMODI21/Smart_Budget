import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Calendar, DollarSign, FileText, LayoutGrid, Receipt, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI } from '@/lib/api';
import Header from '@/components/Header';
import { Helmet } from 'react-helmet';
import Skeleton from '@/components/ui/Skeleton';
import { Label } from '@/components/ui/label';

export default function ExpenseTracker() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'Food', label: 'Food & Dining', icon: '🍔' },
    { value: 'Transport', label: 'Transportation', icon: '🚗' },
    { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'Bills', label: 'Bills & Utilities', icon: '📄' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'Health', label: 'Health & Wellness', icon: '💊' },
    { value: 'Other', label: 'Other', icon: '✨' }
  ];

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount.trim()) return;

    try {
      setSubmitting(true);
      const newExpense = await expensesAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      });
      setExpenses([newExpense, ...expenses]);
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Tracker | Smart Budget</title>
      </Helmet>

      <Header />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Expense <span className="text-emerald-400">Tracker</span>
            </h1>
            <p className="text-white/40 text-sm font-medium mt-1">Personal spending log and statistics.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl rounded-[1.5rem] px-6 py-4 flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mb-0.5">Cumulative Spend</p>
              <p className="text-2xl font-bold text-white tracking-tight">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-0.5">Records</p>
              <p className="text-xl font-bold text-white tracking-tight">{expenses.length}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 sticky top-24">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <Plus className="w-6 h-6 text-emerald-400" /> New Entry
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Title</Label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Coffee, Rent, etc."
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Amount</Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Category</Label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500/50 transition-all font-bold [&>option]:text-gray-900"
                    >
                      {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Date</Label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Add to Ledger'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* List Section */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">History</h2>
                <LayoutGrid className="w-6 h-6 text-white/20" />
              </div>

              {loading ? (
                <div className="p-10 space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)}
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Receipt className="w-10 h-10 text-white/10" />
                  </div>
                  <p className="text-white font-bold opacity-40">Your ledger is empty.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 px-4">
                  <AnimatePresence mode="popLayout">
                    {expenses.map((expense) => (
                      <motion.div
                        key={expense._id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-6 flex items-center justify-between gap-6 group hover:bg-white/[0.02] rounded-3xl transition-all my-2"
                      >
                        <div className="flex items-center gap-6 overflow-hidden">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:bg-emerald-500/20 transition-colors shadow-inner">
                            {categories.find(c => c.value === expense.category)?.icon || '💰'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-black text-white truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">
                              {expense.title}
                            </h3>
                            <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] flex items-center gap-2 mt-1">
                              <span>{expense.category}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-2xl font-black text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-3 bg-red-500/10 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
