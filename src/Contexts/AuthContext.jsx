import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      } else {
        localStorage.removeItem('token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register with Supabase
  const signup = useCallback(async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Registration successful! Please check your email for a confirmation link.",
      });

      return { data, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
      throw error;
    }
  }, [toast]);

  // Login with Supabase
  const login = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      return { data, error: null };
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials",
      });
      throw error;
    }
  }, [toast]);

  // Generate OTP (Magic Link or OTP)
  const generateOTP = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Send a numeric OTP instead of a magic link if configured in Supabase
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });

      return { success: true, message: "OTP Sent" };
    } catch (error) {
      console.error("OTP generation error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: error.message || "Something went wrong",
      });
      throw error;
    }
  }, [toast]);

  // Verify OTP
  const loginWithOTP = useCallback(async (email, otp, name = null) => {
    try {
      // 1. Try 'signup' verification type
      let result = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      // 2. If it fails, try 'magiclink' (common for existing users)
      if (result.error) {
        result = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'magiclink'
        });
      }

      // 3. Last fallback for recovery/other
      if (result.error) {
        throw result.error;
      }

      const { data } = result;

      // Update metadata if name was provided
      if (name && data.user) {
        await supabase.auth.updateUser({
          data: { full_name: name }
        });
      }

      toast({
        title: "Success",
        description: "Login successful!",
      });

      return { data, error: null };
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
      });
      throw error;
    }
  }, [toast]);

  // Logout
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('token');
      setUser(null);
      setSession(null);

      toast({
        title: "Success",
        description: "Logged out successfully!",
      });

      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Something went wrong",
      });
      return { error };
    }
  }, [toast]);

  const value = useMemo(() => ({
    user: user ? { ...user, name: user.user_metadata?.full_name || user.email } : null,
    session,
    loading,
    signup,
    login,
    generateOTP,
    loginWithOTP,
    logout,
    signUp: signup,
    signIn: login,
    signOut: logout,
  }), [user, session, loading, signup, login, generateOTP, loginWithOTP, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
