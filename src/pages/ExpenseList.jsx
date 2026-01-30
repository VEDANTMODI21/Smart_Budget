import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Filter, AlertTriangle, X } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
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
    <>
      <Helmet>
        <title>Expenses - SplitWise</title>
        <meta name="description" content="Manage and track all your shared expenses" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold text-white"
            >
              My Expenses
            </motion.h1>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setShowForm(true);
              }}
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-8 border border-white/20"
          >
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-white mr-2" />
              <h2 className="text-xl font-semibold text-white">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-white mb-2 block">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="" className="text-gray-900">All Categories</option>
                  <option value="Food" className="text-gray-900">Food</option>
                  <option value="Transport" className="text-gray-900">Transport</option>
                  <option value="Entertainment" className="text-gray-900">Entertainment</option>
                  <option value="Utilities" className="text-gray-900">Utilities</option>
                  <option value="Other" className="text-gray-900">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="startDate" className="text-white mb-2 block">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-white mb-2 block">End Date</Label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </motion.div>

          {/* Expenses List */}
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center border border-white/20"
              >
                <p className="text-white text-lg">No expenses found. Add your first expense!</p>
              </motion.div>
            ) : (
              expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{expense.description}</h3>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white mb-2">${parseFloat(expense.amount).toFixed(2)}</p>
                      <p className="text-white/70 text-sm mb-3">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {expense.expense_participants && expense.expense_participants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-white/80 text-sm font-medium mb-2">Participants:</p>
                          <div className="flex flex-wrap gap-2">
                            {expense.expense_participants.map((participant) => (
                              <span
                                key={participant.id}
                                className="px-3 py-1 bg-white/20 rounded-full text-xs text-white"
                              >
                                {participant.users?.name} - ${parseFloat(participant.amount_owed).toFixed(2)}
                                {participant.paid_status && ' ✓'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => initiateDelete(expense.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Confirm Deletion</h3>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={performDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Expense
                  </Button>
                </div>
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
    </>
  );
};

export default ExpenseList;