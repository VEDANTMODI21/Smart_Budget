import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/Contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OtpLoginPage from '@/pages/OtpLoginPage';
import OtpSignupPage from '@/pages/OtpSignupPage';
import Dashboard from '@/pages/Dashboard';
import ExpenseList from '@/pages/ExpenseList';
import ExpenseTracker from '@/pages/ExpenseTracker';
import SettlementTracker from '@/pages/SettlementTracker';
import ReminderNotification from '@/pages/ReminderNotification';
import ExportFeature from '@/pages/ExportFeature';
import SharedExpenseView from '@/pages/SharedExpenseView';
import GlobalReminderHandler from '@/components/GlobalReminderHandler';
import AnimatedBackground from '@/components/AnimatedBackground';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Redirects for legacy routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* New OTP Routes */}
        <Route path="/otp-login" element={<OtpLoginPage />} />
        <Route path="/otp-signup" element={<OtpSignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpenseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses-tracker"
          element={
            <ProtectedRoute>
              <ExpenseTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <SettlementTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <ReminderNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <ExportFeature />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:token" element={<SharedExpenseView />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedBackground />
        <GlobalReminderHandler />
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
