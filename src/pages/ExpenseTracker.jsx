import { useState, useEffect } from 'react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI } from '@/lib/api';

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
    console.log(`Input changed: ${name} = ${value}`);
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
      const newExpense = await expensesAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      });

      console.log('Expense added successfully:', newExpense);

      // Add to state
      setExpenses([...expenses, newExpense]);

      // Clear form
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });

      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + error.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  console.log('Current expenses state:', expenses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Expense Tracker</h1>

        {/* Form Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter expense title"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter expense description"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl"
                >
                  <option value="Food" className="bg-gray-800">Food</option>
                  <option value="Transport" className="bg-gray-800">Transport</option>
                  <option value="Entertainment" className="bg-gray-800">Entertainment</option>
                  <option value="Utilities" className="bg-gray-800">Utilities</option>
                  <option value="Other" className="bg-gray-800">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white backdrop-blur-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition duration-200 border border-white/30"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Summary Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
          <div className="text-3xl font-bold text-green-400">
            Total: ${totalExpense.toFixed(2)}
          </div>
          <p className="text-white/80 mt-2">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {/* Expenses List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Expenses List</h2>
          {loading ? (
            <p className="text-center text-white/80 py-8">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-white/80 text-center py-8">No expenses added yet. Add one to get started!</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{expense.title}</p>
                    <p className="text-sm text-white/70">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-white/60">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-green-400">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="bg-red-500/30 hover:bg-red-500/50 text-white px-3 py-1 rounded transition border border-red-400/50"
                    >
                      Delete
                    </button>
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
