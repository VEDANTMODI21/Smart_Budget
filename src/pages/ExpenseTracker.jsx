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

    const tempId = Date.now().toString();
    const optimisticExpense = {
      id: tempId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      optimistic: true
    };

    // Update UI immediately
    setExpenses(prev => [optimisticExpense, ...prev]);
    const savedFormData = { ...formData };
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });

    try {
      setSubmitting(true);
      const newExpense = await expensesAPI.create({
        title: optimisticExpense.title,
        description: optimisticExpense.description,
        amount: optimisticExpense.amount,
        category: optimisticExpense.category,
        date: optimisticExpense.date
      });

      // Replace optimistic item with actual item from server
      setExpenses(prev => prev.map(exp => exp.id === tempId ? newExpense : exp));
    } catch (error) {
      console.error('Error adding expense:', error);
      // Rollback on error
      setExpenses(prev => prev.filter(exp => exp.id !== tempId));
      setFormData(savedFormData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const originalExpenses = [...expenses];
    // Update UI immediately
    setExpenses(prev => prev.filter(expense => expense.id !== id));

    try {
      await expensesAPI.delete(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Rollback on error
      setExpenses(originalExpenses);
    }
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
              <Receipt className="w-3 h-3" /> Financial Ledger
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
              Expense <span className="text-gradient">Tracker</span>
            </h1>
            <p className="text-white/40 text-lg font-medium">Capture your capital movement in real-time.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card premium-glow glow-emerald !bg-emerald-500/5 border-emerald-500/20 rounded-[2.5rem] px-8 py-6 flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/40 mb-1.5">Network Volume</p>
              <p className="text-3xl font-black text-white tracking-tighter">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1.5">Nodes Found</p>
              <p className="text-2xl font-black text-white tracking-tighter">{expenses.length}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="glass-card rounded-[2.5rem] p-10 border-white/[0.05] sticky top-24 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

              <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                  <Plus className="w-6 h-6 text-emerald-400" />
                </div>
                GENERATE ENTRY
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Label Identity</Label>
                  <div className="relative group">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. CORE SERVER COST"
                      className="w-full pl-16 pr-6 py-6 glass-input rounded-2xl text-white font-bold placeholder-white/5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Value</Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full pl-16 pr-6 py-6 glass-input rounded-2xl text-white font-black placeholder-white/5 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Sector</Label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-6 py-6 glass-input rounded-2xl text-white font-black focus:outline-none appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value} className="bg-[#030711] text-white py-4 font-bold">
                          {cat.label.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Timestamp</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-6 py-6 glass-input rounded-2xl text-white font-bold focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 rounded-[1.5rem] transition-all shadow-2xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-3 text-[11px] tracking-[0.2em]"
                >
                  {submitting ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      EXECUTE TRANSACTION <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* List Section */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
            <div className="glass-card rounded-[2.5rem] border-white/[0.05] overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-10 border-b border-white/[0.05] flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Archives</h2>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Historical Data Sync</p>
                </div>
                <LayoutGrid className="w-7 h-7 text-white/10" />
              </div>

              {loading ? (
                <div className="p-10 space-y-6 flex-1">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-[2rem]" />)}
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-float border border-white/5">
                    <Receipt className="w-16 h-16 text-white/5" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2 uppercase tracking-tight">System Status: Null</h3>
                  <p className="text-white/30 text-sm font-medium">No financial nodes detected in local storage.</p>
                </div>
              ) : (
                <div className="flex-1 p-6 space-y-4">
                  <AnimatePresence mode="popLayout text-xs uppercase tracking-widest font-black">
                    {expenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group glass-morphism !bg-white/[0.01] hover:!bg-white/[0.04] rounded-[2rem] p-6 flex items-center justify-between gap-8 transition-all border-transparent hover:border-white/10 cursor-default"
                      >
                        <div className="flex items-center gap-7 min-w-0">
                          <div className="w-16 h-16 rounded-[1.5rem] glass-morphism flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500 shadow-2xl border border-white/10">
                            {categories.find(c => c.value === expense.category)?.icon || '💰'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-black text-white truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">
                              {expense.title || expense.description}
                            </h3>
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] flex items-center gap-3 mt-2">
                              <span className="text-emerald-400/60">{expense.category}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span>{new Date(expense.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 shrink-0">
                          <div className="text-right">
                            <p className="text-3xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">
                              ${parseFloat(expense.amount).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-4 bg-red-500/5 text-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500 scale-90 hover:scale-100 active:scale-90"
                          >
                            <Trash2 className="w-6 h-6" />
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
