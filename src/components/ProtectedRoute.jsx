import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

