import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/Contexts/AuthContext';
import { OtpProvider } from '@/Contexts/OtpContext';
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
import CursorGlow from '@/components/CursorGlow';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/otp-login" element={<OtpLoginPage />} />
        <Route path="/otp-signup" element={<OtpSignupPage />} />

        {/* Protected Routes */}
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

        {/* Public Share Route */}
        <Route path="/share/:token" element={<SharedExpenseView />} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <OtpProvider>
        <Router>
          <div className="relative min-h-screen overflow-hidden selection:bg-blue-500/30">
            <AnimatedBackground />
            <CursorGlow />
            <GlobalReminderHandler />
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </OtpProvider>
    </AuthProvider>
  );
}

export default App;
