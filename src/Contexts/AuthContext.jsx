import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and validate on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Validate token by fetching user data
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Register with password
  const signup = useCallback(async (name, email, password) => {
    try {
      const response = await api.register(name, email, password);

      // Store token
      localStorage.setItem('token', response.token);

      // Set user
      setUser(response.user);

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      return { data: response, error: null };
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

  // Login with password
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.login(email, password);

      // Store token
      localStorage.setItem('token', response.token);

      // Set user
      setUser(response.user);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      return { data: response, error: null };
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

  // Generate OTP
  const generateOTP = useCallback(async (email) => {
    try {
      const response = await api.generateOTP(email);

      toast({
        title: "OTP Sent",
        description: response.message || "Check your email for the OTP",
      });

      return response;
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

  // Login/Signup with OTP
  const loginWithOTP = useCallback(async (email, otp, name = null) => {
    try {
      const response = await api.verifyOTP(email, otp, name);

      // Store token
      localStorage.setItem('token', response.token);

      // Set user
      setUser(response.user);

      toast({
        title: "Success",
        description: response.message || "Logged in successfully!",
      });

      return { data: response, error: null };
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
      // Clear token
      localStorage.removeItem('token');

      // Clear user
      setUser(null);

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
    user,
    loading,
    signup,
    login,
    generateOTP,
    loginWithOTP,
    logout,
    // Legacy aliases for compatibility
    signUp: signup,
    signIn: login,
    signOut: logout,
  }), [user, loading, signup, login, generateOTP, loginWithOTP, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
