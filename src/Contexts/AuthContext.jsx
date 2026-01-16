import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch {
      // Token invalid, clear it
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for stored token and verify user
    const token = localStorage.getItem('token');
    if (token) {
      void verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const loginWithOTP = async (email, otp, name) => {
    try {
      const response = await authAPI.verifyOTP(email, otp, name);
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      if (!response.user) {
        throw new Error('No user data received from server');
      }
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('OTP login error:', error);
      throw error;
    }
  };

  const generateOTP = async (email, name) => {
    return await authAPI.generateOTP(email, name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      loginWithOTP,
      generateOTP,
      logout,
      loading,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
