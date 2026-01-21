import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OtpLoginPage from '@/pages/OtpLoginPage';
import OtpSignupPage from '@/pages/OtpSignupPage';
import Dashboard from '@/pages/Dashboard';
import ExpenseList from '@/pages/ExpenseList';
import SettlementTracker from '@/pages/SettlementTracker';
import ReminderNotification from '@/pages/ReminderNotification';
import ExportFeature from '@/pages/ExportFeature';
import SharedExpenseView from '@/pages/SharedExpenseView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
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
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
