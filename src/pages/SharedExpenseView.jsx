import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function SharedExpenseView() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <Helmet>
        <title>Shared Expense - Smart Budget</title>
      </Helmet>

      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center border border-white/20"
        >
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Shared Expense View</h1>

          <div className="bg-white/5 rounded-lg p-4 mb-6 inline-block max-w-full overflow-hidden">
            <p className="text-white/60 text-sm mb-1">Access Token</p>
            <code className="text-emerald-300 font-mono text-lg break-all">{token}</code>
          </div>

          <p className="text-white/80 max-w-lg mx-auto">
            This feature allows you to view shared expense details securely via a unique link.
          </p>

          <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-blue-200 text-sm">
              In a full implementation, the detailed expense breakdown and participant information would appear here.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
