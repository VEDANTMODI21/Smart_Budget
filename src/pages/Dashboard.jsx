import React, { useState, useEffect } from 'react';
import { useAuth } from '@/Contexts/AuthContext';
import Header from '@/components/Header';
import ExpenseForm from '@/components/ExpenseForm';
import { Button } from '@/components/ui/button';
import { expensesAPI } from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showForm, setShowForm] = useState(false);
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
      calculateTotal(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (expenseList) => {
    const total = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    setTotalExpenses(total);
  };

  const handleAddExpense = async (expense) => {
    try {
      const newExpense = await expensesAPI.create(expense);
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      calculateTotal(updatedExpenses);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      const updatedExpenses = expenses.filter(exp => exp._id !== id);
      setExpenses(updatedExpenses);
      calculateTotal(updatedExpenses);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.email || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your expenses and track your budget</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Number of Expenses</h3>
            <p className="text-3xl font-bold text-blue-600">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Expense</h3>
            <p className="text-3xl font-bold text-green-600">
              ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Add Expense Button */}
        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Expense'}
          </Button>
        </div>

        {/* Expense Form */}
        {showForm && (
          <div className="mb-8">
            <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No expenses yet. Add your first expense above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{expense.title}</h3>
                    <p className="text-sm text-gray-500">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-red-600">${parseFloat(expense.amount).toFixed(2)}</span>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteExpense(expense._id)}
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
