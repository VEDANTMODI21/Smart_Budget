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
import QuickActions from '@/components/QuickActions';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
  </div>
);

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/otp-login" element={<PageTransition><OtpLoginPage /></PageTransition>} />
        <Route path="/otp-signup" element={<PageTransition><OtpSignupPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <PageTransition><ExpenseList /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses-tracker"
          element={
            <ProtectedRoute>
              <PageTransition><ExpenseTracker /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <PageTransition><SettlementTracker /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <PageTransition><ReminderNotification /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <PageTransition><ExportFeature /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Public Share Route */}
        <Route path="/share/:token" element={<PageTransition><SharedExpenseView /></PageTransition>} />

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
            <QuickActions />
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
