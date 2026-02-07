import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Filter, AlertTriangle, X, Search, Tag, Calendar, Receipt, ChevronRight } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
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
      // Explicitly filter by user_id to respect RLS and ensure we only fetch user's own expenses
      let query = supabase
        .from('expenses')
        .select(`
          *,
          expense_participants (
            id,
            user_id,
            amount_owed,
            paid_status,
            users (name, email)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
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
      // Ensure we only delete expenses belonging to the authenticated user
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id); // Extra safety check matching RLS

      if (error) throw error;

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
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Expense <span className="text-blue-400">Ledger</span>
            </h1>
            <p className="text-white/40 font-medium mt-2">Track, analyze, and settle your costs.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-3 rounded-2xl border transition-all ${isFilterOpen ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
            >
              <Filter className="w-6 h-6" />
            </button>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setShowForm(true);
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-500/10"
            >
              <Plus className="w-6 h-6 mr-2" />
              New Expense
            </Button>
          </motion.div>
        </div>

        {/* Action Bar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-white/40 text-xs font-bold uppercase mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Find expense..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/40 text-xs font-bold uppercase mb-2 block">Category</Label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-colors [&>option]:text-gray-900"
                  >
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white/40 text-xs font-bold uppercase mb-2 block">From</Label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-white/40 text-xs font-bold uppercase mb-2 block">To</Label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expenses Feed */}
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
            ))
          ) : expenses.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-20 text-center border border-white/10"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-white font-bold text-xl">No entries found</h3>
              <p className="text-white/40 mt-2">Try adjusting your filters or add a new expense.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="group bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
                      {expense.category?.charAt(0) || '💰'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {expense.description}
                        </h3>
                        <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-black uppercase tracking-widest text-white/60">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-sm font-semibold">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(expense.date).toLocaleDateString()}</span>
                        {expense.expense_participants?.length > 0 && (
                          <span className="flex items-center gap-1.5 text-blue-400/60 transition-colors group-hover:text-blue-400">
                            <Plus className="w-4 h-4" /> {expense.expense_participants.length} Split
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-right">
                      <p className="text-3xl font-black text-white">${parseFloat(expense.amount).toFixed(2)}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gross Amount</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-3 bg-white/5 hover:bg-white/20 rounded-xl transition-all text-white/60 hover:text-white"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => initiateDelete(expense.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/30 rounded-xl transition-all text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
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