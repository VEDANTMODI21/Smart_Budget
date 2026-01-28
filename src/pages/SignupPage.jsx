import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect legacy signup page to new OTP signup
const SignupPage = () => {
  return <Navigate to="/otp-signup" replace />;
};

export default SignupPage;