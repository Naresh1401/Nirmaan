'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, ShieldCheck, CheckCircle, Mail } from 'lucide-react';
import NirmaanLogo from '@/components/NirmaanLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Step = 'identifier' | 'otp' | 'newPassword' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [actualPhone, setActualPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Start resend countdown
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
      if (data._dev_otp) setDevOtp(data._dev_otp);
      if (data.recovery_phone) setRecoveryPhone(data.recovery_phone);
      if (data.phone) setActualPhone(data.phone);
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
      if (data._dev_otp) setDevOtp(data._dev_otp);
      setOtp(['', '', '', '', '', '']);
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  // Step 2: Confirm OTP → go to new password
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setStep('newPassword');
  };

  // Step 3: Reset password (sends OTP + new password together)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          phone: actualPhone,
          otp: otp.join(''),
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password reset failed');
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <NirmaanLogo className="h-11 w-auto" white />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Reset Your<br />Password
          </h1>
          <p className="text-orange-100 text-lg max-w-md">
            Don&apos;t worry! It happens to the best of us. We&apos;ll send a verification code to your registered phone number.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: Mail, text: 'Enter your phone number or email' },
            { icon: KeyRound, text: 'Verify with 6-digit OTP' },
            { icon: ShieldCheck, text: 'Set your new password securely' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90">
              <div className="bg-white/20 rounded-lg p-2"><f.icon className="w-5 h-5" /></div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <NirmaanLogo className="h-9 w-auto" />
          </div>

          {/* Step indicators */}
          {step !== 'success' && (
            <div className="flex items-center gap-2 mb-8">
              {['identifier', 'otp', 'newPassword'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s ? 'bg-orange-500 text-white scale-110' :
                    ['identifier', 'otp', 'newPassword'].indexOf(step) > i ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {['identifier', 'otp', 'newPassword'].indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`w-12 h-0.5 ${['identifier', 'otp', 'newPassword'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
          )}

          {/* Dev OTP notice */}
          {devOtp && step === 'otp' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="font-semibold">Dev Mode OTP:</span> {devOtp}
            </div>
          )}

          {/* ── Step 1: Phone or Email ── */}
          {step === 'identifier' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-500 mb-8">Enter your registered phone number or email to receive a verification code</p>
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number or Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="Enter phone number or email address"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-500 mb-2">We sent a 6-digit code to</p>
              <p className="text-gray-900 font-semibold mb-8">{recoveryPhone || identifier}</p>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  Verify & Continue <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Didn&apos;t receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={handleResendOTP} className="text-orange-600 font-semibold hover:text-orange-700">
                      Resend OTP
                    </button>
                  )}
                </p>
                <button onClick={() => { setStep('identifier'); setError(''); }} className="mt-3 text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Change Details
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'newPassword' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
              <p className="text-gray-500 mb-8">Create a strong password for your account</p>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Toggle password visibility">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                  <ul className="mt-2 space-y-1">
                    {[
                      { test: newPassword.length >= 8, label: 'At least 8 characters' },
                      { test: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
                      { test: /[a-z]/.test(newPassword), label: 'One lowercase letter' },
                      { test: /\d/.test(newPassword), label: 'One digit' },
                    ].map((rule, i) => (
                      <li key={i} className={`text-xs flex items-center gap-1.5 ${rule.test ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className={`w-3 h-3 ${rule.test ? 'text-green-500' : 'text-gray-300'}`} />
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 ${
                        confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                      required
                      minLength={8}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || strength < 3 || newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Reset Password <ShieldCheck className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Success ── */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Reset!</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25"
              >
                Go to Sign In <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
