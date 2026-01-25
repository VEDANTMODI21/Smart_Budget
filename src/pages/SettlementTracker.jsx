import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, User, DollarSign, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { settlementsAPI } from '@/lib/api';
import { Helmet } from 'react-helmet';

export default function SettlementTracker() {
  const [settlements, setSettlements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const data = await settlementsAPI.getAll();
      setSettlements(data);
    } catch (err) {
      setError(err.message || 'Failed to load settlements');
      console.error('Error loading settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSettlement = async (e) => {
    e.preventDefault();
    if (!person || !amount) {
      setError('Person and amount are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const newSettlement = await settlementsAPI.create({
        person,
        amount: parseFloat(amount),
        description,
        date: new Date().toISOString().split('T')[0]
      });
      setSettlements([newSettlement, ...settlements]);
      setPerson('');
      setAmount('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add settlement');
      console.error('Error adding settlement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSettled = async (id, e) => {
    e.stopPropagation();
    try {
      const settlement = settlements.find(s => s._id === id);
      await settlementsAPI.update(id, { ...settlement, settled: true });
      setSettlements(settlements.map(s =>
        s._id === id ? { ...s, settled: true } : s
      ));
    } catch (err) {
      setError(err.message || 'Failed to update settlement');
      console.error('Error updating settlement:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this settlement record?')) return;

    try {
      await settlementsAPI.delete(id);
      setSettlements(settlements.filter(s => s._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete settlement');
      console.error('Error deleting settlement:', err);
    }
  };

  const totalOwed = settlements
    .filter(s => !s.settled)
    .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Settlements - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Settlement Tracker</h1>
          <p className="text-white/80">Keep track of who owes you money</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-xl mb-6 backdrop-blur-xl flex items-center gap-2"
            >
              <span className="font-bold">Error:</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary & Form Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-medium text-white/80 mb-2">Total Outstanding</h2>
              <div className="text-4xl font-bold text-emerald-400">
                ${totalOwed.toFixed(2)}
              </div>
              <p className="text-white/60 text-sm mt-2">
                Pending from {settlements.filter(s => !s.settled).length} records
              </p>

              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition duration-200 border border-white/30 flex items-center justify-center gap-2"
              >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
                {showForm ? 'Close Form' : 'Add New Record'}
              </button>
            </motion.div>

            {/* Add Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                    <form onSubmit={handleAddSettlement} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Person Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                          <input
                            type="text"
                            value={person}
                            onChange={(e) => setPerson(e.target.value)}
                            placeholder="Who owes you?"
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Amount</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Description</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What is this for?"
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder-white/50 backdrop-blur-xl resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200 border border-emerald-400/50 shadow-lg"
                      >
                        {submitting ? 'Adding...' : 'Save Record'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden min-h-[400px]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Records</h2>
                <span className="text-sm text-white/60">{settlements.length} total</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : settlements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/60">
                  <p className="text-lg">No records found</p>
                  <p className="text-sm">Add a new settlement to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {settlements.map((settlement) => (
                      <motion.div
                        key={settlement._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 transition-all hover:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${settlement.settled ? 'opacity-50 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${settlement.settled ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {settlement.settled ? <Check className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{settlement.person}</h3>
                            <div className="text-sm text-white/60">
                              {new Date(settlement.date).toLocaleDateString()}
                              {settlement.description && ` • ${settlement.description}`}
                            </div>
                            {settlement.settled && (
                              <span className="inline-block mt-1 text-xs text-green-400 font-medium border border-green-500/30 px-2 py-0.5 rounded-full">
                                Settled
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pl-14 sm:pl-0">
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">${parseFloat(settlement.amount).toFixed(2)}</div>
                          </div>

                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {!settlement.settled && (
                              <button
                                onClick={(e) => handleMarkSettled(settlement._id, e)}
                                className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg transition-colors"
                                title="Mark as Settled"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(settlement._id, e)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
