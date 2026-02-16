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
        const debtorId = participant.user_id;
        const creditorId = participant.expenses?.user_id;
        if (!creditorId) return; // Skip if no expense context

        const key = `${debtorId}-${creditorId}`;

        if (!settlementMap[key]) {
          settlementMap[key] = {
            debtor: participant.users,
            creditor: participant.expenses.users,
            totalAmount: 0,
            participants: [],
          };
        }

        settlementMap[key].totalAmount += parseFloat(participant.amount_owed || 0);
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
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Settlement Tracker
          </motion.h1>

          <div className="space-y-4">
            {settlements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center border border-white/20"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-white text-lg">All settled up! No pending payments.</p>
              </motion.div>
            ) : (
              settlements.map((settlement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xl text-white mb-2">
                        <span className="font-semibold">{settlement.debtor.name}</span>
                        {' owes '}
                        <span className="font-semibold">{settlement.creditor.name}</span>
                      </p>
                      <p className="text-3xl font-bold text-white mb-2">
                        ${settlement.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-white/70 text-sm">
                        {settlement.participants.length} expense{settlement.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsPaid(settlement)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Paid</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettlementTracker;