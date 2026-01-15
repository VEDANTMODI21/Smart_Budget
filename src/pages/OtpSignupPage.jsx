import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

export default function OtpSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('info'); // 'info' or 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithOTP, generateOTP: generateOTPAPI } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await generateOTPAPI(email, name);

      if (response.otp) {
        alert(`Your OTP is: ${response.otp}\n\n(In production, this would be sent to your email)`);
      } else {
        alert('OTP sent! Check your email.');
      }
      
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      await loginWithOTP(email, otp, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign up with OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                sign up with password
              </Link>
            </p>
          </div>

          {step === 'info' ? (
            <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <Input
                label="Full Name"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
              <Input
                label="Email address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="text-sm text-gray-600 mb-4">
                OTP sent to: <strong>{email}</strong>
              </div>
              <Input
                label="Enter OTP"
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('info');
                    setOtp('');
                    setError('');
                  }}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Sign Up'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
