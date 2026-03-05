'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useAdmin } from '../layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, admin } = useAdmin();

  const [step, setStep] = useState<'credentials' | '2fa' | 'backup'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (admin) router.push('/admin');
  }, [admin, router]);

  useEffect(() => {
    if (step === '2fa' && totpInputRef.current) {
      totpInputRef.current.focus();
    }
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Login failed');
        return;
      }

      if (data.requires_2fa) {
        setTempToken(data.temp_token);
        setStep('2fa');
      } else {
        // No 2FA enabled — direct login
        login(data.access_token, {
          id: data.user_id,
          full_name: data.full_name || username,
          admin_role: data.admin_role || 'super_admin',
          permissions: data.permissions || [],
        });
        router.push('/admin');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ totp_code: totpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || '2FA verification failed');
        return;
      }

      login(data.access_token, {
        id: data.user_id,
        full_name: data.full_name || username,
        admin_role: data.admin_role,
        permissions: data.permissions || [],
      });
      router.push('/admin');
    } catch {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/verify-backup-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ backup_code: backupCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Backup code verification failed');
        return;
      }

      login(data.access_token, {
        id: data.user_id,
        full_name: data.full_name || username,
        admin_role: data.admin_role,
        permissions: data.permissions || [],
      });
      router.push('/admin');
    } catch {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-orange-500/25">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Nirmaan Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Secure admin portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-center mb-6">
                <Shield className="mx-auto text-orange-500 mb-2" size={32} />
                <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-500">Enter your admin credentials</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  placeholder="admin_username"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-10 text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Step 2: TOTP */}
          {step === '2fa' && (
            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div className="text-center mb-6">
                <KeyRound className="mx-auto text-orange-500 mb-2" size={32} />
                <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-500">Enter the code from your authenticator app</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-digit code</label>
                <input
                  ref={totpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-2xl font-mono tracking-[0.5em] text-gray-900"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => setStep('backup')}
                className="w-full text-sm text-gray-500 hover:text-orange-600 transition"
              >
                Use backup code instead
              </button>
            </form>
          )}

          {/* Step 2 alt: Backup Code */}
          {step === 'backup' && (
            <form onSubmit={handleBackupCode} className="space-y-5">
              <div className="text-center mb-6">
                <KeyRound className="mx-auto text-orange-500 mb-2" size={32} />
                <h2 className="text-lg font-semibold text-gray-900">Backup Code</h2>
                <p className="text-sm text-gray-500">Enter one of your recovery codes</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Code</label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={e => setBackupCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center font-mono text-lg text-gray-900"
                  placeholder="XX-XX-XX"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !backupCode}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => setStep('2fa')}
                className="w-full text-sm text-gray-500 hover:text-orange-600 transition"
              >
                Use authenticator app instead
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Protected by 2FA • IP logged • All actions audited
        </p>
      </div>
    </div>
  );
}
