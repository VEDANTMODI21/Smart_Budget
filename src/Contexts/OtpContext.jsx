import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

const OtpContext = createContext(undefined);

export const OtpProvider = ({ children }) => {
  const { toast } = useToast();
  const { generateOTP, loginWithOTP } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateAndSendOtp = useCallback(async (email, type = 'signup') => {
    setLoading(true);
    try {
      // Use Supabase through AuthContext
      await generateOTP(email);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error in generateAndSendOtp:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [generateOTP]);

  const verifyOtp = useCallback(async (email, code, name = null) => {
    setLoading(true);
    try {
      // Use Supabase through AuthContext
      const result = await loginWithOTP(email, code, name);

      return { success: true, user: result.data.user, token: result.data.session?.access_token };
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loginWithOTP]);

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
