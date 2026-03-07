'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Shield, Star, Truck, KeyRound, Smartphone, UserCircle } from 'lucide-react';
import NirmaanLogo from '@/components/NirmaanLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type AuthTab = 'password' | 'otp';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authTab, setAuthTab] = useState<AuthTab>('password');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  if (isAuthenticated) { router.push('/'); return null; }

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
      if (data._dev_otp) setDevOtp(data._dev_otp);
      setOtpSent(true);
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP login
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'OTP verification failed');
      
      // Store tokens and user data same as password login
      localStorage.setItem('nirmaan_token', data.access_token);
      localStorage.setItem('nirmaan_user', JSON.stringify(data.user));
      window.location.href = '/';
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
      const res = await fetch(`${API_URL}/api/v1/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
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

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) setOtp(pasted.split(''));
  };

  // Reset state when switching tabs
  const switchTab = (tab: AuthTab) => {
    setAuthTab(tab);
    setError('');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setDevOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <NirmaanLogo className="h-11 w-auto" white />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back,<br />Builder!
          </h1>
          <p className="text-orange-100 text-lg max-w-md">
            Access your orders, track deliveries, compare prices, and manage your construction materials all in one place.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: Star, text: '50+ Verified Suppliers' },
            { icon: Truck, text: 'Same-Day Delivery Available' },
            { icon: Shield, text: 'Quality Guaranteed Materials' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90">
              <div className="bg-white/20 rounded-lg p-2"><f.icon className="w-5 h-5" /></div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <NirmaanLogo className="h-9 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-6">Choose your preferred login method</p>

          {/* Login method tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchTab('password')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                authTab === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock className="w-4 h-4" /> Login
            </button>
            <button
              onClick={() => switchTab('otp')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                authTab === 'otp'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4" /> OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
          )}

          {/* Dev OTP notice */}
          {devOtp && authTab === 'otp' && otpSent && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="font-semibold">Dev Mode OTP:</span> {devOtp}
            </div>
          )}

          {/* ── Password Login ── */}
          {authTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username, Phone or Email</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter username, phone or email"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Toggle password visibility">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}

          {/* ── OTP Login ── */}
          {authTab === 'otp' && !otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter 10-digit phone number"
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
                  <>Send OTP <KeyRound className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}

          {/* ── OTP Verify ── */}
          {authTab === 'otp' && otpSent && (
            <form onSubmit={handleOTPLogin} className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">OTP sent to</p>
                <p className="text-sm font-semibold text-gray-900 mb-4">{phone}</p>
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`login-otp-${i}`}
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
              </div>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  Didn&apos;t receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleResendOTP} className="text-orange-600 font-semibold hover:text-orange-700">
                      Resend OTP
                    </button>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setDevOtp(''); setError(''); }}
                  className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Change Number
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-orange-600 font-semibold hover:text-orange-700">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
