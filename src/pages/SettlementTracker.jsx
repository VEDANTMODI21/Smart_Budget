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

      <div className="min-h-screen bg-transparent">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                Settlement <span className="text-gradient">Tracker</span>
              </h1>
              <p className="text-white/40 text-lg font-medium">Clear your debts and manage shared balances.</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-4"
          >
            {settlements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-[2.5rem] p-20 text-center relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">You're All Clear!</h2>
                  <p className="text-white/40 text-lg font-medium">No pending payments found. Great job!</p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
              </motion.div>
            ) : (
              settlements.map((settlement, index) => (
                <motion.div
                  key={`${settlement.debtor.id}-${settlement.creditor.id}`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ x: 10 }}
                  className="group glass-card !bg-white/[0.03] hover:!bg-white/[0.08] rounded-3xl p-8 border-transparent hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex -space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black border-4 border-[#030711] shadow-xl">
                          {settlement.debtor.name.charAt(0)}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white font-black border-4 border-[#030711] shadow-xl">
                          {settlement.creditor.name.charAt(0)}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-white/60">
                        <span className="text-white">{settlement.debtor.name}</span>
                        {' → '}
                        <span className="text-white">{settlement.creditor.name}</span>
                      </p>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-white tracking-tighter">${settlement.totalAmount.toFixed(2)}</span>
                      <span className="text-white/20 font-black uppercase tracking-widest text-xs">Total Balance</span>
                    </div>

                    <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Based on {settlement.participants.length} transactions
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAsPaid(settlement)}
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-[#030711] rounded-2xl font-black transition-all shadow-2xl shadow-white/10 hover:bg-blue-50"
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>MARK AS SETTLED</span>
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