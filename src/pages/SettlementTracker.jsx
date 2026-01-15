import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { settlementsAPI } from '@/lib/api';

export default function SettlementTracker() {
  const [settlements, setSettlements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleAddSettlement = async () => {
    if (!person || !amount) {
      setError('Person and amount are required');
      return;
    }

    try {
      setError('');
      const newSettlement = await settlementsAPI.create({
        person,
        amount: parseFloat(amount),
        description,
        date: new Date().toISOString().split('T')[0]
      });
      setSettlements([...settlements, newSettlement]);
      setPerson('');
      setAmount('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add settlement');
      console.error('Error adding settlement:', err);
    }
  };

  const handleMarkSettled = async (id) => {
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

  const handleDelete = async (id) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settlement Tracker</h1>
          <p className="text-gray-600">Track money owed to you</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Total Owed: <span className="text-green-600">${totalOwed.toFixed(2)}</span>
          </h2>
        </div>

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Settlement'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Settlement</h2>
            <div className="space-y-4">
              <Input
                label="Person Name"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Who owes you?"
              />
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this for?"
                />
              </div>
              <Button onClick={handleAddSettlement} className="w-full">Add Settlement</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Settlements</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Loading settlements...</p>
            </div>
          ) : settlements.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No settlements tracked yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <div
                  key={settlement._id}
                  className={`px-6 py-4 hover:bg-gray-50 flex justify-between items-center ${
                    settlement.settled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{settlement.person}</h3>
                      {settlement.settled && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Settled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{new Date(settlement.date).toLocaleDateString()}</p>
                    {settlement.description && (
                      <p className="text-sm text-gray-600 mt-1">{settlement.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-green-600">
                      ${parseFloat(settlement.amount).toFixed(2)}
                    </span>
                    {!settlement.settled && (
                      <Button
                        variant="secondary"
                        onClick={() => handleMarkSettled(settlement._id)}
                      >
                        Mark Settled
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => handleDelete(settlement._id)}>
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
