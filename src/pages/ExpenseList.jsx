import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { expensesAPI } from '@/lib/api';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  const filteredExpenses = expenses.filter(exp => {
    if (filter === 'all') return true;
    return exp.category === filter;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'amount') {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    return 0;
  });

  const handleDelete = async (id) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Expenses</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date (Newest)</option>
                <option value="amount">Amount (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {categories.map(cat => (
            <div key={cat} className="bg-white rounded-lg shadow-md p-4 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">{cat}</h3>
              <p className="text-xl font-bold text-blue-600">${totalByCategory[cat]?.toFixed(2) || '0.00'}</p>
            </div>
          ))}
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Expenses ({sortedExpenses.length})
            </h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Loading expenses...</p>
            </div>
          ) : sortedExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No expenses found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedExpenses.map((expense) => (
                <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {expense.category}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">{expense.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-red-600">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(expense._id)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
