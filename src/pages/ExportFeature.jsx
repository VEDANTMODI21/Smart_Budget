import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { expensesAPI } from '@/lib/api';

export default function ExportFeature() {
  const [expenses, setExpenses] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const headers = ['Title', 'Amount', 'Category', 'Date', 'Description'];
    const rows = expenses.map(exp => [
      exp.title || '',
      exp.amount || '0',
      exp.category || '',
      new Date(exp.date).toLocaleDateString() || '',
      exp.description || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const jsonContent = JSON.stringify(expenses, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF-like export using window.print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4F46E5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            h1 { color: #1F2937; }
          </style>
        </head>
        <body>
          <h1>Expenses Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(exp => `
                <tr>
                  <td>${exp.title || ''}</td>
                  <td>$${parseFloat(exp.amount || 0).toFixed(2)}</td>
                  <td>${exp.category || ''}</td>
                  <td>${new Date(exp.date).toLocaleDateString()}</td>
                  <td>${exp.description || ''}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="font-weight: bold;">$${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else if (exportFormat === 'json') {
      exportToJSON();
    } else if (exportFormat === 'pdf') {
      exportToPDF();
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Export Data</h1>
          <p className="text-gray-600">Export your expenses data in various formats</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Expenses</p>
              <p className="text-2xl font-bold text-blue-600">{expenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV (Excel compatible)</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF (Print)</option>
              </select>
            </div>
            <Button onClick={handleExport} className="w-full" disabled={expenses.length === 0 || loading}>
              {loading ? 'Loading...' : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
            {expenses.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center">No expenses to export</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
