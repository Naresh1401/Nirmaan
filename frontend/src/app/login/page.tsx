'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Login successful! (Demo)');
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏗️ Nirmaan</h1>
          <p className="text-gray-500 mt-2">Construction Materials Marketplace</p>
        </div>

        {step === 'phone' ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome back!</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your phone number to continue</p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length !== 10 || loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                New to Nirmaan?{' '}
                <Link href="/register" className="text-orange-600 font-medium hover:underline">
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-8 border-t pt-6">
              <p className="text-center text-sm text-gray-400 mb-4">Or continue as</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/suppliers/register"
                  className="text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Supplier
                </Link>
                <Link
                  href="/delivery/register"
                  className="text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Delivery Partner
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Verify OTP</h2>
            <p className="text-gray-500 text-sm mb-6">
              Sent to +91 {phone.slice(0, 3)}****{phone.slice(7)}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-center text-2xl tracking-[0.5em]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-sm">
              <button onClick={() => setStep('phone')} className="text-gray-500 hover:text-gray-700">
                ← Change Number
              </button>
              <button className="text-orange-600 font-medium hover:underline">Resend OTP</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
