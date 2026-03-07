'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, Shield, Key, UserPlus, Smartphone, Copy, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Tab = 'profile' | '2fa' | 'admins';

export default function SettingsPage() {
  const { adminFetch, admin } = useAdmin();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupStep, setSetupStep] = useState<'idle' | 'scan' | 'verify' | 'done'>('idle');
  const [copying, setCopying] = useState(false);

  // Create admin state
  const [createForm, setCreateForm] = useState({ user_id: '', admin_role: 'support_admin' });
  const [createMsg, setCreateMsg] = useState('');

  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/me`);
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
        setIs2FAEnabled(d.is_2fa_enabled);
      }
    } catch (e) { console.error(e); }
    setProfileLoading(false);
  }, [adminFetch]);

  useEffect(() => { fetchProfile(); }, []);

  const setup2FA = async () => {
    setError('');
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/setup-2fa`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setSetupData(d);
        setSetupStep('scan');
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to setup 2FA');
      }
    } catch (e) { setError('Failed to setup 2FA'); }
  };

  const confirm2FA = async () => {
    setError('');
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/confirm-2fa`, {
        method: 'POST',
        body: JSON.stringify({ totp_code: totpCode }),
      });
      if (res.ok) {
        const d = await res.json();
        setBackupCodes(d.backup_codes || []);
        setSetupStep('done');
        setIs2FAEnabled(true);
        fetchProfile();
      } else {
        const err = await res.json();
        setError(err.detail || 'Invalid code');
      }
    } catch (e) { setError('Verification failed'); }
  };

  const regenerateBackupCodes = async () => {
    setError('');
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/regenerate-backup-codes`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setBackupCodes(d.backup_codes || []);
      }
    } catch (e) { setError('Failed to regenerate'); }
  };

  const createAdmin = async () => {
    setCreateMsg('');
    setError('');
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/create-admin`, {
        method: 'POST',
        body: JSON.stringify({ user_id: parseInt(createForm.user_id), admin_role: createForm.admin_role }),
      });
      if (res.ok) {
        setCreateMsg('Admin created successfully');
        setCreateForm({ user_id: '', admin_role: 'support_admin' });
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to create admin');
      }
    } catch (e) { setError('Failed to create admin'); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const tabs = [
    { key: 'profile', label: 'My Profile', icon: Shield },
    { key: '2fa', label: 'Two-Factor Auth', icon: Key },
    { key: 'admins', label: 'Manage Admins', icon: UserPlus },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Profile, security, and admin management</p>
        </div>
        <button onClick={fetchProfile} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        profileLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div> : profile ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                {(profile.username || admin?.full_name || '?')[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{profile.username || admin?.full_name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{profile.admin_role || admin?.admin_role || 'admin'}</span>
              </div>
            </div>
            <div className="space-y-3 divide-y divide-gray-100">
              {[
                ['Email', profile.email || '—'],
                ['Role', profile.admin_role || 'admin'],
                ['2FA Enabled', is2FAEnabled ? 'Yes' : 'No'],
                ['Failed Login Attempts', String(profile.failed_login_attempts || 0)],
                ['Account Locked', profile.locked_until ? `Until ${new Date(profile.locked_until).toLocaleString()}` : 'No'],
                ['IP Allowlist', profile.ip_allowlist?.length ? profile.ip_allowlist.join(', ') : 'Not configured'],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-gray-500">Failed to load profile</p>
      )}

      {/* 2FA Tab */}
      {tab === '2fa' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className={is2FAEnabled ? 'text-green-500' : 'text-gray-400'} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Use an authenticator app like Google Authenticator</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {setupStep === 'idle' && !is2FAEnabled && (
              <button onClick={setup2FA} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors">Setup 2FA</button>
            )}

            {setupStep === 'idle' && is2FAEnabled && (
              <div className="space-y-3">
                <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle size={16} /> 2FA is active on your account</p>
                <button onClick={regenerateBackupCodes} className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50">Regenerate Backup Codes</button>
              </div>
            )}

            {setupStep === 'scan' && setupData && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Scan this QR code with your authenticator app:</p>
                {setupData.qr_code_base64 && (
                  <div className="flex justify-center">
                    <img src={`data:image/png;base64,${setupData.qr_code_base64}`} alt="TOTP QR Code" className="w-48 h-48 border border-gray-200 rounded-lg" />
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-900 flex-1 break-all">{setupData.secret || setupData.totp_secret}</code>
                    <button onClick={() => copyToClipboard(setupData.secret || setupData.totp_secret)} className="p-1.5 rounded hover:bg-gray-200">
                      {copying ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                    </button>
                  </div>
                </div>
                <button onClick={() => setSetupStep('verify')} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">I&apos;ve scanned it</button>
              </div>
            )}

            {setupStep === 'verify' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Enter the 6-digit code from your authenticator app:</p>
                <input
                  type="text" maxLength={6} inputMode="numeric"
                  value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="000000"
                />
                <button onClick={confirm2FA} disabled={totpCode.length !== 6} className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50">Verify & Enable</button>
              </div>
            )}

            {setupStep === 'done' && backupCodes.length > 0 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-green-700">2FA has been enabled successfully!</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Save your backup codes</p>
                  <p className="text-xs text-yellow-700 mb-3">Store these codes in a safe place. Each code can only be used once.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((c, i) => (
                      <code key={i} className="text-sm font-mono bg-white rounded px-2 py-1 text-center border border-yellow-200">{c}</code>
                    ))}
                  </div>
                  <button onClick={() => copyToClipboard(backupCodes.join('\n'))} className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs text-yellow-700 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50">
                    {copying ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />} Copy All
                  </button>
                </div>
                <button onClick={() => setSetupStep('idle')} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Done</button>
              </div>
            )}

            {backupCodes.length > 0 && setupStep === 'idle' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">Regenerated Backup Codes</p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((c, i) => (
                    <code key={i} className="text-sm font-mono bg-white rounded px-2 py-1 text-center border border-yellow-200">{c}</code>
                  ))}
                </div>
                <button onClick={() => copyToClipboard(backupCodes.join('\n'))} className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs text-yellow-700 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50">
                  {copying ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />} Copy All
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Admins Tab */}
      {tab === 'admins' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><UserPlus size={20} className="text-orange-500" /> Create New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="number"
                  value={createForm.user_id}
                  onChange={e => setCreateForm({ ...createForm, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter existing user ID"
                />
                <p className="text-xs text-gray-400 mt-1">The user must already have an account in the system</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Role</label>
                <select
                  value={createForm.admin_role}
                  onChange={e => setCreateForm({ ...createForm, admin_role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="ops_admin">Operations Admin</option>
                  <option value="supplier_admin">Supplier Admin</option>
                  <option value="finance_admin">Finance Admin</option>
                  <option value="support_admin">Support Admin</option>
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Role Permissions Summary</p>
                <div className="text-xs text-gray-500 space-y-1">
                  {createForm.admin_role === 'super_admin' && <p>Full access to all modules and settings</p>}
                  {createForm.admin_role === 'ops_admin' && <p>Orders, inventory, deliveries, products, suppliers management</p>}
                  {createForm.admin_role === 'supplier_admin' && <p>Supplier verification, products, inventory management</p>}
                  {createForm.admin_role === 'finance_admin' && <p>Payments, refunds, credit, revenue analytics</p>}
                  {createForm.admin_role === 'support_admin' && <p>Disputes, reviews, user support, order viewing</p>}
                </div>
              </div>
              <button
                onClick={createAdmin}
                disabled={!createForm.user_id}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                Create Admin
              </button>
              {createMsg && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-green-700">{createMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
