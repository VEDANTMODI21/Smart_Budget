import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

// Determine if we should use Supabase. Default to true if keys are present in production.
const useSupabase =
  import.meta.env.VITE_USE_SUPABASE === 'true' ||
  (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.MODE === 'production');

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // In production, don't assume port 5000 unless specified via VITE_API_URL
  return '';
};

const API_URL = getApiUrl();

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session and listen for changes
  useEffect(() => {
    if (useSupabase) {
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
    } else {
      // Check local storage for token
      const token = localStorage.getItem('token');
      if (token) {
        // Fetch user from local backend
        fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              setUser({ ...data, id: data.id || data._id });
            } else {
              localStorage.removeItem('token');
            }
          })
          .catch(() => {
            localStorage.removeItem('token');
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Register with Supabase or Local
  const signup = useCallback(async (name, email, password) => {
    try {
      if (useSupabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        toast({ title: "Success", description: "Registration successful! Please check your email." });
        return { data, error: null };
      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast({ title: "Success", description: "Registration successful!" });
        return { data, error: null };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({ variant: "destructive", title: "Sign up Failed", description: error.message });
      throw error;
    }
  }, [toast]);

  // Login with Supabase or Local
  const login = useCallback(async (email, password) => {
    try {
      if (useSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Success", description: "Logged in successfully!" });
        return { data, error: null };
      } else {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast({ title: "Success", description: "Logged in successfully!" });
        return { data, error: null };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      throw error;
    }
  }, [toast]);

  // Generate OTP
  const generateOTP = useCallback(async (email) => {
    try {
      if (useSupabase) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      } else {
        const res = await fetch(`${API_URL}/api/auth/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'OTP generation failed');

        // Log OTP in console for dev mode as current route does
        if (data.otp) {
          console.log(`[DEV] OTP for ${email}: ${data.otp}`);
        }
      }

      toast({ title: "OTP Sent", description: "Check your email for the verification code" });
      return { success: true };
    } catch (error) {
      console.error("OTP generation error:", error);
      toast({ variant: "destructive", title: "Failed to Send OTP", description: error.message });
      throw error;
    }
  }, [toast]);

  // Verify OTP
  const loginWithOTP = useCallback(async (email, otp, name = null) => {
    try {
      if (useSupabase) {
        let result = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
        if (result.error) result = await supabase.auth.verifyOtp({ email, token: otp, type: 'magiclink' });
        if (result.error) throw result.error;

        if (name && result.data.user) {
          await supabase.auth.updateUser({ data: { full_name: name } });
        }
        return { data: result.data, error: null };
      } else {
        const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast({ title: "Success", description: "Login successful!" });
        return { data, error: null };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
      throw error;
    }
  }, [toast]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (useSupabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('token');
      setUser(null);
      setSession(null);
      toast({ title: "Success", description: "Logged out successfully!" });
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
      return { error };
    }
  }, [toast]);

  const value = useMemo(() => ({
    user: user ? { ...user, name: user.name || user.user_metadata?.full_name || user.email } : null,
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

