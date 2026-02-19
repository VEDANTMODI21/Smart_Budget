import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, FileText, Share2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { expensesAPI } from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ExportFeature = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAll();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No expenses to export",
      });
      return;
    }

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Participants'];
    const rows = expenses.map(expense => [
      expense.date,
      expense.description,
      expense.amount,
      expense.category,
      expense.expense_participants?.map(p => p.users?.name || 'Unknown').join(', ') || 'None',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "CSV file downloaded successfully!",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "🚧 PDF export feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const generateShareLink = async () => {
    try {
      const { shareToken } = await expensesAPI.generateShareLink();

      const shareUrl = `${window.location.origin}/share/${shareToken}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Success",
        description: "Share link copied to clipboard!",
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate share link",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Export - SplitWise</title>
        <meta name="description" content="Export and share your expense data" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
              Export & <span className="text-gradient">Share</span>
            </h1>
            <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em]">
              Data Portability • Universal Access • Cloud Sync
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card rounded-[2.5rem] p-10 overflow-hidden premium-glow glow-blue group cursor-pointer"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl border border-emerald-500/20">
                  <FileText className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Excel Protocol</h2>
                <p className="text-white/30 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest">
                  Standardized comma-separated values for spreadsheet integration and deep analysis.
                </p>
                <Button
                  onClick={exportToCSV}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-7 font-black text-xs tracking-[0.2em] shadow-2xl shadow-emerald-900/20 transition-all transform active:scale-[0.98]"
                >
                  <Download className="w-5 h-5 mr-3" />
                  INITIALIZE CSV
                </Button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card rounded-[2.5rem] p-10 overflow-hidden premium-glow glow-purple group cursor-pointer"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl border border-red-500/20">
                  <FileText className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Visual Dossier</h2>
                <p className="text-white/30 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest">
                  High-fidelity PDF generation with stylistic formatting for formal documentation.
                </p>
                <Button
                  onClick={exportToPDF}
                  className="w-full bg-red-600 hover:bg-red-500 text-white rounded-2xl py-7 font-black text-xs tracking-[0.2em] shadow-2xl shadow-red-900/20 transition-all transform active:scale-[0.98]"
                >
                  <Download className="w-5 h-5 mr-3" />
                  GENERATE PDF
                </Button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card rounded-[3rem] p-12 overflow-hidden premium-glow glow-purple md:col-span-2 group cursor-pointer"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-24 h-24 bg-blue-500/10 rounded-full mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl border border-blue-500/20">
                  <Share2 className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Network Sharing</h2>
                <p className="text-white/30 text-xs font-bold leading-relaxed mb-10 max-w-lg uppercase tracking-widest">
                  Create a localized access tunnel for authorized third-party viewing of your financial datasets. Use with caution.
                </p>
                <Button
                  onClick={generateShareLink}
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] py-8 font-black text-xs tracking-[0.2em] shadow-2xl shadow-blue-900/20 transition-all transform active:scale-[0.98] group/btn"
                >
                  <LinkIcon className="w-6 h-6 mr-3 group-hover/btn:rotate-45 transition-transform" />
                  ACTIVATE SHARE LINK
                </Button>
              </div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] group-hover:bg-blue-500/10 transition-all duration-1000" />
              <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <Share2 size={200} className="text-blue-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ExportFeature;