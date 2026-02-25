import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Filter, AlertTriangle, X, Search, Tag, Calendar, Receipt, ChevronRight } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI } from '@/lib/api';
import Header from '@/components/Header';
import ExpenseForm from '@/components/ExpenseForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const ExpenseList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    expenseId: null
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, filters]);

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAll(filters);
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const initiateDelete = (expenseId) => {
    setDeleteConfirm({ isOpen: true, expenseId });
  };

  const performDelete = async () => {
    const { expenseId } = deleteConfirm;
    if (!expenseId) return;

    try {
      await expensesAPI.delete(expenseId);

      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense",
      });
    } finally {
      setDeleteConfirm({ isOpen: false, expenseId: null });
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      participants: expense.expense_participants?.map(p => p.user_id) || [],
    });
    setShowForm(true);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Expenses | Smart Budget</title>
        <meta name="description" content="Manage and track all your shared expenses" />
      </Helmet>

      <Header />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">
              <Receipt className="w-3 h-3" /> System Archives
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase italic">
              Expense <span className="text-gradient">Ledger</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-xl">
              Comprehensive chronological record of all audited financial movement.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-4 rounded-2xl glass-morphism border transition-all ${isFilterOpen ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5 border-white/10'}`}
            >
              <Filter className="w-6 h-6" />
            </button>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setShowForm(true);
              }}
              className="bg-white text-[#030711] hover:bg-blue-50 px-8 py-7 rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl shadow-white/10"
            >
              <Plus className="w-5 h-5 mr-3" />
              GENERATE ENTRY
            </Button>
          </motion.div>
        </div>

        {/* Action Bar / Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-[2.5rem] p-10 border-white/[0.05] grid grid-cols-1 md:grid-cols-4 gap-8 premium-glow glow-blue">
                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Search Query</Label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="AUDIT SEARCH..."
                      className="w-full pl-12 pr-4 py-4 glass-input rounded-xl text-white text-xs font-bold placeholder-white/5 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Sector</Label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-4 glass-input rounded-xl text-white text-xs font-bold outline-none cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-[#030711]">ALL SECTORS</option>
                    <option value="Food" className="bg-[#030711]">FOOD & DINING</option>
                    <option value="Transport" className="bg-[#030711]">TRANSPORTATION</option>
                    <option value="Entertainment" className="bg-[#030711]">ENTERTAINMENT</option>
                    <option value="Utilities" className="bg-[#030711]">BILLS & UTILITIES</option>
                    <option value="Other" className="bg-[#030711]">DIVERSE COSTS</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Epoch Start</Label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-4 glass-input rounded-xl text-white text-xs font-bold outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Epoch End</Label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-4 glass-input rounded-xl text-white text-xs font-bold outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expenses Feed */}
        <div className="space-y-6">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[2rem]" />
            ))
          ) : expenses.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="glass-card rounded-[3rem] p-24 text-center border-white/[0.05] relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float border border-white/5">
                  <Tag className="w-12 h-12 text-white/5" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Null Result</h3>
                <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-2">No archived nodes match your search parameters.</p>
              </div>
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse-slow blur-3xl rounded-full" />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="group relative glass-card !bg-white/[0.01] hover:!bg-white/[0.04] rounded-[2.5rem] p-8 transition-all border-transparent hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-2xl glass-morphism flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl border border-white/10 shrink-0">
                      {expense.category?.charAt(0) || '💰'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {expense.description}
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 border border-blue-500/10">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-white/30 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {expense.expense_participants?.length > 0 && (
                          <span className="flex items-center gap-2 text-blue-400/60 transition-colors group-hover:text-blue-400">
                            <Plus className="w-3.5 h-3.5" /> {expense.expense_participants.length} Split Nodes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-12 relative z-10">
                    <div className="text-right">
                      <p className="text-4xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </p>
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Audit Value</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(expense); }}
                        className="p-4 glass-morphism hover:bg-white/10 rounded-2xl transition-all text-white/20 hover:text-white border border-white/5 opacity-0 group-hover:opacity-100"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); initiateDelete(expense.id); }}
                        className="p-4 glass-morphism hover:bg-red-500/20 rounded-2xl transition-all text-white/20 hover:text-red-500 border border-white/5 shadow-2xl opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Decorative background element for list items */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modern Dialogs */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1f2e] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white text-center mb-2">Are you sure?</h3>
              <p className="text-white/40 text-center mb-8 leading-relaxed">
                This item will be permanently removed from your ledger. This action cannot be reversed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
                  className="py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                >
                  Keep it
                </button>
                <button
                  onClick={performDelete}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
};

export default ExpenseList;