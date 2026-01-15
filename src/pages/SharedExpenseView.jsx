import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';

export default function SharedExpenseView() {
  const { token } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shared Expense View</h1>
          <p className="text-gray-600 mb-2">Token: <code className="bg-gray-100 px-2 py-1 rounded">{token}</code></p>
          <p className="text-gray-500">This feature allows you to share expenses with others via a unique link.</p>
          <p className="text-gray-500 mt-4">In a full implementation, this would display the shared expense details.</p>
        </div>
      </div>
    </div>
  );
}
