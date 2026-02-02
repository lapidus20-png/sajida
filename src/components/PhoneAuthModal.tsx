import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Phone, X } from 'lucide-react';

interface PhoneAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PhoneAuthModal({ onClose, onSuccess }: PhoneAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (!phone.startsWith('+')) {
      if (cleaned.startsWith('237')) {
        return '+' + cleaned;
      }
      return '+237' + cleaned;
    }

    return phone;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      alert('OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Phone className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">
              {step === 'phone' ? 'Phone Sign In' : 'Verify OTP'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+237 XXX XXX XXX"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: +237XXXXXXXXX or 237XXXXXXXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                Sent to {phoneNumber}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 mb-3"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-orange-500 hover:underline"
              >
                Change Number
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-orange-500 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>SMS charges may apply</p>
        </div>
      </div>
    </div>
  );
}
