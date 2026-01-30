import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, FileText, Share2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
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
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_participants (
            users (name)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
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
      expense.expense_participants?.map(p => p.users.name).join(', ') || 'None',
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
      // Generate unique share token
      const shareToken = crypto.randomUUID();

      // Update all user's expenses with share token
      const { error } = await supabase
        .from('expenses')
        .update({
          share_token: shareToken,
          share_created_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

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

        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Export & Share</h1>
            <p className="text-white/80">Download your expense data or share with others</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
                <FileText className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Export to CSV</h2>
              <p className="text-white/70 mb-6">
                Download all your expenses in CSV format for easy analysis in spreadsheet applications.
              </p>
              <Button
                onClick={exportToCSV}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CSV
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
                <FileText className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Export to PDF</h2>
              <p className="text-white/70 mb-6">
                Generate a formatted PDF report of all your expenses with detailed summaries.
              </p>
              <Button
                onClick={exportToPDF}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:shadow-2xl transition-all md:col-span-2"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-6 mx-auto">
                <Share2 className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 text-center">Generate Share Link</h2>
              <p className="text-white/70 mb-6 text-center">
                Create a shareable link to view your expenses. Anyone with the link can see your expense data.
              </p>
              <Button
                onClick={generateShareLink}
                className="w-full max-w-md mx-auto block bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                Generate & Copy Link
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ExportFeature;