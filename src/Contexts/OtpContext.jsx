import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const OtpContext = createContext(undefined);

export const OtpProvider = ({ children }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateAndSendOtp = useCallback(async (email, type = 'login') => {
    setLoading(true);
    try {
      // 1. Generate random 6-digit code locally for Demo Mode
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Set expiration (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // 3. Store in Supabase 'otps' table
      const { error } = await supabase
        .from('otps')
        .insert({
          email,
          code,
          expires_at: expiresAt.toISOString(),
          verified: false
        });

      if (error) throw error;

      // For Demo/Test mode: We return the code so it can be displayed in the UI
      // In production, this would be sent via email and NOT returned to the client
      toast({
        title: "OTP Generated",
        description: "See the demo box for your verification code.",
      });

      return { success: true, code };
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate verification code.",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyOtp = useCallback(async (email, code) => {
    setLoading(true);
    try {
      // 1. Check if OTP exists, is valid, matches email, and is not expired
      const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false) // Check it hasn't been used
        .gt('expires_at', new Date().toISOString()) // Check expiration
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        throw new Error("Invalid or expired code");
      }

      // 2. Mark as verified
      await supabase
        .from('otps')
        .update({ verified: true })
        .eq('id', data.id);

      toast({
        title: "Verified",
        description: "Code verified successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid code",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resendOtp = useCallback(async (email, type) => {
    return generateAndSendOtp(email, type);
  }, [generateAndSendOtp]);

  return (
    <OtpContext.Provider value={{ generateAndSendOtp, verifyOtp, resendOtp, loading }}>
      {children}
    </OtpContext.Provider>
  );
};

export const useOtp = () => {
  const context = useContext(OtpContext);
  if (context === undefined) {
    throw new Error('useOtp must be used within an OtpProvider');
  }
  return context;
};