import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowUpDown, Trash2, Calendar, Tag, Search } from 'lucide-react';
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  const totalByCategory = categories.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>All Expenses - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Expense History</h1>
          <p className="text-white/80">Review and manage all your past expenses</p>
        </motion.div>

        {/* Stats Cards */}
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

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
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
              <div className="min-w-[160px]">
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

              <div className="min-w-[160px]">
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 outline-none text-white appearance-none cursor-pointer [&>option]:text-gray-900"
                  >
                    <option value="date">Date (Newest)</option>
                    <option value="amount">Amount (High-Low)</option>
                    <option value="amountAlt">Amount (Low-High)</option>
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
              <p className="text-sm">Try adjusting your filters</p>
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
  );
}
