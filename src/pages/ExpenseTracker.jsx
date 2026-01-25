import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Calendar, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI } from '@/lib/api';
import Header from '@/components/Header';
import { Helmet } from 'react-helmet';

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

  // Categories matching backend enum + Extras mapped to 'Other' or 'Bills' conceptually if needed
  // Backend Enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
  const categories = [
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Transport', label: 'Transportation' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills & Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health & Wellness' },
    { value: 'Other', label: 'Other' }
  ];

  // Load expenses on mount
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
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.amount.trim()) {
      alert('Please fill in title and amount');
      return;
    }

    try {
      setSubmitting(true);
      const newExpense = await expensesAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      });

      // Add to state
      setExpenses([newExpense, ...expenses]);

      // Clear form
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Expenses - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Expense Tracker</h1>
          <p className="text-white/80">Manage your daily spending</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add New Expense
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Title</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Grocery Shopping"
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl transition-all [&>option]:text-gray-900"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add details..."
                    rows="3"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 border border-green-400/50 shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Adding...' : <><Plus className="w-5 h-5" /> Add Expense</>}
                </button>
              </form>
            </div>
          </motion.div>

          {/* List Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-white/80">Total Spending</h2>
                <div className="text-4xl font-bold text-white mt-1">
                  ${totalExpense.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60">{expenses.length} Records</div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
              </div>

              {loading ? (
                <div className="p-12 text-center text-white/70">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                  Loading expenses...
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-12 text-center text-white/70">
                  <p>No expenses added yet.</p>
                  <p className="text-sm mt-2 opacity-60">Add a new expense to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {expenses.map((expense) => (
                      <motion.div
                        key={expense._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0
                            ${expense.category === 'Food' ? 'bg-orange-500' :
                              expense.category === 'Transport' ? 'bg-blue-500' :
                                expense.category === 'Shopping' ? 'bg-pink-500' :
                                  expense.category === 'Bills' ? 'bg-red-500' :
                                    'bg-indigo-500'}
                          `}>
                            {expense.category[0]}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate">{expense.title}</h3>
                            <div className="text-sm text-white/60 flex items-center gap-2">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pl-4 shrink-0">
                          <span className="text-lg font-bold text-white whitespace-nowrap">
                            ${parseFloat(expense.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Expense"
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
      </div>
    </div>
  );
}
