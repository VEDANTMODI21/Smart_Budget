import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect legacy login page to new OTP login
const LoginPage = () => {
  return <Navigate to="/otp-login" replace />;
};

export default LoginPage;