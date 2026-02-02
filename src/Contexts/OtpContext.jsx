import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/services/api'; // Use MongoDB API instead of Supabase
import { useToast } from '@/components/ui/use-toast';

const OtpContext = createContext(undefined);

export const OtpProvider = ({ children }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateAndSendOtp = useCallback(async (email, name = '') => {
    setLoading(true);
    try {
      // Use MongoDB backend to generate and send OTP
      const result = await api.generateOTP(email);

      toast({
        title: "OTP Sent",
        description: result.message || "Please check your email for the verification code.",
      });

      // OTP is no longer returned in the response for security
      return {
        success: true,
        previewUrl: result.previewUrl
      };
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate verification code.",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyOtp = useCallback(async (email, code, name = null) => {
    setLoading(true);
    try {
      // Use MongoDB backend to verify OTP
      const result = await api.verifyOTP(email, code, name);

      toast({
        title: "Verified",
        description: result.message || "Code verified successfully",
      });

      return { success: true, user: result.user, token: result.token };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid or expired code",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resendOtp = useCallback(async (email, name) => {
    return generateAndSendOtp(email, name);
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
