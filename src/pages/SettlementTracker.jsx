import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/Contexts/AuthContext';
import { settlementsAPI } from '@/lib/api';
import Header from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';

const SettlementTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, [user]);

  const fetchSettlements = async () => {
    try {
      // Fetch all unpaid expense participants via API wrapper
      const participants = await settlementsAPI.getAll();

      // Group by debtor and creditor
      const settlementMap = {};

      participants?.forEach((participant) => {
        // Handle both Supabase (participant.user_id) and MongoDB (participant.userId)
        const debtorId = participant.user_id || participant.userId || 'current';
        const creditorId = participant.expenses?.user_id || participant.person || 'other';

        const key = `${debtorId}-${creditorId}`;

        if (!settlementMap[key]) {
          settlementMap[key] = {
            debtor: participant.users || { name: user?.name || 'You', id: debtorId },
            creditor: participant.expenses?.users || { name: participant.person || 'Other', id: creditorId },
            totalAmount: 0,
            participants: [],
          };
        }

        settlementMap[key].totalAmount += parseFloat(participant.amount_owed || participant.amount || 0);
        settlementMap[key].participants.push(participant);
      });

      setSettlements(Object.values(settlementMap));
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch settlements",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (settlement) => {
    const originalSettlements = [...settlements];
    // Update UI immediately (Optimistic)
    setSettlements(prev => prev.filter(s => s !== settlement));

    try {
      // Update all participants for this settlement via API wrapper
      const participantIds = settlement.participants.map(p => p.id || p._id);
      await settlementsAPI.markAsPaid(participantIds);

      toast({
        title: "Success",
        description: "Settlement marked as paid!",
      });

    } catch (error) {
      console.error('Error updating settlement:', error);
      // Rollback on error
      setSettlements(originalSettlements);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settlement",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
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
        <title>Settlements | Smart Budget</title>
        <meta name="description" content="Track and manage expense settlements" />
      </Helmet>

      <div className="min-h-screen relative">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4 uppercase italic">
                Settlement <span className="text-gradient">Protocol</span>
              </h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">
                Clearing Financial Obligations • Peer-to-Peer Reconciliation
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-6"
          >
            {settlements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-[3rem] p-24 text-center relative overflow-hidden premium-glow glow-blue"
              >
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 animate-float border border-emerald-500/20">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">Accounts Balanced</h2>
                  <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">Zero outstanding liabilities detected.</p>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              </motion.div>
            ) : (
              settlements.map((settlement, index) => (
                <motion.div
                  key={`${settlement.debtor.id}-${settlement.creditor.id}`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ x: 15 }}
                  className="group glass-card !bg-white/[0.02] hover:!bg-white/[0.06] rounded-[2.5rem] p-10 border-transparent hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-10 premium-glow glow-purple"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="flex -space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black border-4 border-[#030711] shadow-2xl group-hover:rotate-[-10deg] transition-transform">
                          {settlement.debtor.name.charAt(0)}
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black border-4 border-[#030711] shadow-2xl group-hover:rotate-[10deg] transition-transform">
                          {settlement.creditor.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Active Channel</p>
                        <p className="text-xl font-black text-white uppercase tracking-tight">
                          {settlement.debtor.name} <span className="text-purple-500">→</span> {settlement.creditor.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-4">
                      <span className="text-6xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors animate-pulse-slow">
                        ${settlement.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] mb-2 sm:mb-0">
                        Total Settlement Required
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">
                          Consolidated from {settlement.participants.length} transactions
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markAsPaid(settlement)}
                    className="flex items-center justify-center gap-4 px-10 py-7 bg-white text-[#030711] rounded-[1.5rem] font-black tracking-[0.2em] text-xs transition-all shadow-2xl shadow-white/5 hover:bg-blue-50 group/btn"
                  >
                    <CheckCircle className="w-6 h-6 group-btn-hover:scale-110 transition-transform" />
                    <span>AUTHORIZE SETTLEMENT</span>
                  </motion.button>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SettlementTracker;