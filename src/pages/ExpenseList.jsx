import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowUpDown, Trash2, Calendar, Tag, Search, Plus, DollarSign, FileText, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { expensesAPI } from '@/lib/api';
import { Helmet } from 'react-helmet';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Backend Enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      setError('Please fill in title and amount');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const newExpense = await expensesAPI.create({
        title,
        amount: parseFloat(amount),
        category,
        date,
        description
      });
      setExpenses([newExpense, ...expenses]);
      // Reset form
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesFilter = filter === 'all' || exp.category === filter;
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'amount') {
      return parseFloat(b.amount) - parseFloat(a.amount);
    } else if (sortBy === 'amountAlt') {
      return parseFloat(a.amount) - parseFloat(b.amount);
    }
    return 0;
  });

  const totalByCategory = categories.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Expenses - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Expense Tracker</h1>
          <p className="text-white/80">Manage your spending and view history</p>
        </motion.div>

        {/* Categories Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8 overflow-x-auto pb-4 lg:pb-0">
          {categories.map((cat, index) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[120px]"
            >
              <h3 className="text-xs font-medium text-white/60 mb-1">{cat}</h3>
              <p className="text-lg font-bold text-white">${totalByCategory[cat]?.toFixed(2) || '0.00'}</p>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 border border-green-400/50 shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
          {showForm ? 'Close Form' : 'Add New Expense'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form Side (Conditional on mobile, sticky on desktop) */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="lg:col-span-1"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 sticky top-24">
                  <h2 className="text-xl font-bold text-white mb-6">New Expense</h2>

                  <form onSubmit={handleAddExpense} className="space-y-4">
                    {error && <p className="text-red-300 text-sm bg-red-500/10 p-2 rounded">{error}</p>}

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Grocery"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white [&>option]:text-gray-900"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Date</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Details..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white placeholder-white/50 backdrop-blur-xl resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 border border-blue-400/50 shadow-lg"
                    >
                      {submitting ? 'Adding...' : 'Add Expense'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List Side */}
          <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 transition-all"
                  />
                </div>

                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="min-w-[140px]">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white appearance-none cursor-pointer [&>option]:text-gray-900"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="min-w-[140px]">
                    <div className="relative">
                      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white appearance-none cursor-pointer [&>option]:text-gray-900"
                      >
                        <option value="date">Date (New)</option>
                        <option value="amount">Amount (High)</option>
                        <option value="amountAlt">Amount (Low)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden min-h-[400px]">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  Transactions ({sortedExpenses.length})
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : sortedExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-white/60">
                  <div className="bg-white/5 p-4 rounded-full mb-4">
                    <Tag className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg">No expenses found</p>
                  <p className="text-sm">Add a new expense to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {sortedExpenses.map((expense) => (
                      <motion.div
                        key={expense._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-6 py-4 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 mt-1 sm:mt-0
                            ${expense.category === 'Food' ? 'bg-orange-500' :
                              expense.category === 'Transport' ? 'bg-blue-500' :
                                expense.category === 'Shopping' ? 'bg-pink-500' :
                                  expense.category === 'Bills' ? 'bg-red-500' :
                                    'bg-indigo-500'}
                          `}>
                            {expense.category[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white text-lg truncate">{expense.title}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                                {expense.category}
                              </span>
                            </div>
                            <div className="text-sm text-white/60 flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                            {expense.description && (
                              <p className="text-sm text-white/50 mt-1 line-clamp-1">{expense.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pl-14 sm:pl-0">
                          <span className="text-xl font-bold text-white whitespace-nowrap">
                            ${parseFloat(expense.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
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
          </div>
        </div>
      </div>
    </div>
  );
}
