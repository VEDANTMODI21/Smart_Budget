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
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Settlements | Smart Budget</title>
        <meta name="description" content="Track and manage expense settlements" />
      </Helmet>

      {/* Decorative background effects */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">
              <RefreshCw className="w-3 h-3" /> P2P Reconciliation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase italic">
              Settlement <span className="text-gradient">Protocol</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-xl">
              Consolidated debt resolution and financial clearing between network participants.
            </p>
          </div>

          <div className="glass-card !bg-white/[0.03] border-white/[0.05] rounded-3xl p-6 px-8 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Active Claims</p>
              <p className="text-2xl font-black text-white tracking-tighter leading-none">{settlements.length}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/20">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="space-y-8"
        >
          {settlements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[3.5rem] p-24 text-center relative overflow-hidden premium-glow glow-blue border-white/[0.05]"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 animate-float border border-emerald-500/20 shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Network Balanced</h2>
                <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                  No outstanding liabilities detected within your financial subgraph.
                </p>
              </div>

              {/* Decorative side accents */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
            </motion.div>
          ) : (
            settlements.map((settlement, index) => (
              <motion.div
                key={`${settlement.debtor.id}-${settlement.creditor.id}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                whileHover={{ y: -5 }}
                className="group glass-card !bg-white/[0.02] hover:!bg-white/[0.04] rounded-[3rem] p-10 md:p-12 border-white/[0.03] hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-12 premium-glow glow-purple relative overflow-hidden"
              >
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-8 mb-10">
                    <div className="flex -space-x-6">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white text-2xl font-black border-[6px] border-[#010409] shadow-2xl group-hover:rotate-[-8deg] transition-transform duration-500">
                        {settlement.debtor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="w-20 h-20 rounded-[1.5rem] bg-purple-600 flex items-center justify-center text-white text-2xl font-black border-[6px] border-[#010409] shadow-2xl group-hover:rotate-[8deg] transition-transform duration-500 relative z-10">
                        {settlement.creditor.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Claim ID: {settlement.debtor.id.slice(0, 8)}</p>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        {settlement.debtor.name}
                        <span className="text-purple-500/40 animate-pulse-slow">→</span>
                        {settlement.creditor.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-6 mb-10">
                    <span className="text-7xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors duration-700">
                      ${settlement.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] sm:mb-2">
                      Aggregate Value Required
                    </span>
                  </div>

                  <div className="flex items-center gap-6 pt-8 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.25em]">
                        Consolidated Activity: {settlement.participants.length} Nodes
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markAsPaid(settlement)}
                  className="flex items-center justify-center gap-4 px-12 py-8 bg-white text-[#010409] rounded-[2rem] font-black tracking-[0.3em] text-[11px] transition-all shadow-2xl shadow-white/5 hover:shadow-white/20 group/btn relative z-10 shrink-0"
                >
                  <CheckCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-500" />
                  <span>AUTHORIZE CLEARANCE</span>
                </motion.button>

                {/* Decorative background number */}
                <div className="absolute right-10 bottom-10 text-[12rem] font-black text-white/[0.02] -z-0 pointer-events-none select-none tracking-tighter">
                  {index + 1}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettlementTracker;