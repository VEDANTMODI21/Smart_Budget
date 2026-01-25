import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileJson, Table } from 'lucide-react';
import Header from '@/components/Header';
import { expensesAPI } from '@/lib/api';
import { Helmet } from 'react-helmet';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Export Data - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Export Data</h1>
          <p className="text-white/80">Download your financial data for offline analysis</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6">Data Summary</h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Expenses Value</p>
                <p className="text-4xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Total Records</p>
                <p className="text-2xl font-bold text-white">{expenses.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6">Export Options</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${exportFormat === 'csv'
                        ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                  >
                    <Table className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">CSV</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${exportFormat === 'json'
                        ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                  >
                    <FileJson className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">JSON</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${exportFormat === 'pdf'
                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">PDF</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={expenses.length === 0 || loading}
                className={`w-full font-bold py-3 px-4 rounded-xl transition duration-200 border flex items-center justify-center gap-2
                  ${expenses.length === 0 || loading
                    ? 'bg-gray-500/50 text-white/50 border-gray-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400/50 shadow-lg hover:shadow-emerald-500/30'
                  }`}
              >
                {loading ? 'Loading...' : (
                  <>
                    <Download className="w-5 h-5" />
                    Export as {exportFormat.toUpperCase()}
                  </>
                )}
              </button>

              {expenses.length === 0 && !loading && (
                <p className="text-sm text-white/50 text-center">No expenses recorded to export.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
