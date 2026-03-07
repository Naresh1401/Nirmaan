'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Crown, Gift, Copy, Check, ArrowRight, TrendingUp, Star, AlertCircle, RefreshCw, Loader2, Users } from 'lucide-react';
import { usePremium } from '@/context/PremiumContext';
import { api } from '@/lib/api';

interface LoyaltyTxn {
  id: string;
  points: number;
  transaction_type: string;
  source: string;
  description: string;
  created_at: string;
}

interface ReferralStats {
  code: string;
  uses_count: number;
  max_uses: number;
  reward_points: number;
  is_active: boolean;
}

const TIER_COLORS: Record<string, string> = {
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-amber-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-700',
  free: 'from-gray-400 to-gray-600',
};

const TIER_ICONS: Record<string, string> = {
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  free: '🔓',
};

export default function PremiumDashboard() {
  const { isPremium, membershipTier, membershipStatus, membershipExpiry, loyaltyPoints, benefits, refresh } = usePremium();
  const [history, setHistory] = useState<LoyaltyTxn[]>([]);
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  useEffect(() => {
    if (isPremium) {
      loadHistory();
      loadReferral();
    }
  }, [isPremium]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getLoyaltyHistory(10);
      setHistory(data);
    } catch { /* silently ignore */ }
    finally { setLoadingHistory(false); }
  };

  const loadReferral = async () => {
    setLoadingReferral(true);
    try {
      const data = await api.generateReferralCode();
      setReferral(data);
    } catch { /* silently ignore */ }
    finally { setLoadingReferral(false); }
  };

  const copyCode = () => {
    if (referral?.code) {
      navigator.clipboard.writeText(referral.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.cancelMembership();
      setCancelMsg('Membership cancelled. Access continues until end date.');
      await refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to cancel.')
          : 'Failed to cancel.';
      setCancelMsg(msg);
    } finally {
      setCancelLoading(false);
      setCancelConfirm(false);
    }
  };

  const tierLabel = membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1);
  const tierGradient = TIER_COLORS[membershipTier] || TIER_COLORS.free;
  const tierIcon = TIER_ICONS[membershipTier] || '🔓';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" /> Premium Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage your membership, rewards, and referrals</p>
            </div>
            <button onClick={() => refresh()} className="text-slate-400 hover:text-amber-400 transition-colors p-2 rounded-xl hover:bg-slate-700">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {cancelMsg && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl px-4 py-3 text-sm">
              {cancelMsg}
            </div>
          )}

          {/* Membership card */}
          <div className={`bg-gradient-to-br ${tierGradient} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{tierIcon}</span>
                    <span className="text-white font-bold text-xl">{tierLabel} Member</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Status: <span className="text-white font-semibold capitalize">{membershipStatus || 'Free'}</span>
                  </p>
                  {membershipExpiry && (
                    <p className="text-white/70 text-sm mt-1">
                      Valid until: <span className="text-white font-semibold">{new Date(membershipExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </p>
                  )}
                </div>
                {loyaltyPoints && (
                  <div className="bg-white/10 rounded-xl px-4 py-3 text-right">
                    <p className="text-white/70 text-xs mb-0.5">Loyalty Points</p>
                    <p className="text-white font-extrabold text-2xl">{loyaltyPoints.available_points.toLocaleString('en-IN')}</p>
                    <p className="text-white/70 text-xs">≈ ₹{loyaltyPoints.monetary_value.toFixed(2)} value</p>
                  </div>
                )}
              </div>
              {!isPremium && (
                <Link href="/premium" className="mt-4 inline-flex items-center gap-2 bg-white text-slate-800 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-50 transition-all">
                  Upgrade Now <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Loyalty Points */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-amber-400" /> Loyalty Points
              </h2>
              {loyaltyPoints ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Available</span>
                    <span className="text-white font-bold text-lg">{loyaltyPoints.available_points.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Earned</span>
                    <span className="text-slate-300">{loyaltyPoints.total_points.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Redeemed</span>
                    <span className="text-slate-300">{loyaltyPoints.redeemed_points.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Tier Multiplier</span>
                    <span className="text-amber-400 font-semibold">{loyaltyPoints.tier_bonus_multiplier}x</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-2">
                    <p className="text-xs text-amber-300 text-center">
                      Monetary value: <span className="font-bold">₹{loyaltyPoints.monetary_value.toFixed(2)}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 text-center mt-0.5">Redeem at checkout (100 pts = ₹1)</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm">No loyalty account yet</p>
                  <Link href="/premium" className="text-amber-400 text-sm mt-1 inline-block">Upgrade to earn points</Link>
                </div>
              )}
            </div>

            {/* Referral */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-400" /> Referral Code
              </h2>
              {loadingReferral ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
              ) : referral ? (
                <div className="space-y-3">
                  <div className="bg-slate-700 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-amber-300 font-mono font-bold text-lg tracking-widest">{referral.code}</span>
                    <button onClick={copyCode} className="text-slate-400 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-slate-600">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Used</span>
                    <span className="text-white">{referral.uses_count} / {referral.max_uses} times</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reward per referral</span>
                    <span className="text-amber-400 font-semibold">{referral.reward_points} pts</span>
                  </div>
                  <p className="text-xs text-slate-500">Share your code to earn {referral.reward_points} points for both you and your friend!</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm">No referral code</p>
                  {isPremium && (
                    <button onClick={loadReferral} className="text-amber-400 text-sm mt-2">Generate Code</button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Benefits */}
          {isPremium && Object.keys(benefits).length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="font-bold text-white text-base flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-400" /> Active Benefits
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(benefits).map(([key, value]) => {
                  if (value === false || value === null) return null;
                  return (
                    <div key={key} className="bg-slate-700/50 border border-slate-600 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-slate-400 text-[10px]">
                          {typeof value === 'boolean' ? '✓ Included' : String(value)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction History */}
          {isPremium && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> Points History
                </h2>
                <button onClick={loadHistory} className="text-slate-400 hover:text-amber-400 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {loadingHistory ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No transactions yet. Start earning by placing orders!</p>
              ) : (
                <div className="space-y-2">
                  {history.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{txn.source.replace(/_/g, ' ')}</p>
                        <p className="text-slate-400 text-xs">{txn.description}</p>
                        <p className="text-slate-500 text-[10px]">{new Date(txn.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`font-bold text-sm ${txn.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {txn.points > 0 ? '+' : ''}{txn.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upgrade prompt for free users */}
          {!isPremium && (
            <div className="bg-gradient-to-br from-amber-900/30 to-slate-800 border border-amber-500/30 rounded-2xl p-6 text-center">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Unlock NirmaaN Premium</h3>
              <p className="text-slate-400 mb-5">Get discounts, loyalty rewards, AI consultant access, and more.</p>
              <Link href="/premium" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all">
                <Crown className="w-4 h-4" /> View Plans
              </Link>
            </div>
          )}

          {/* Danger zone */}
          {isPremium && (
            <div className="bg-slate-800 border border-red-500/20 rounded-2xl p-5">
              <h2 className="font-bold text-white text-base flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" /> Membership Management
              </h2>
              {!cancelConfirm ? (
                <button onClick={() => setCancelConfirm(true)} className="text-red-400 hover:text-red-300 text-sm border border-red-400/30 px-4 py-2 rounded-xl hover:bg-red-400/10 transition-all">
                  Cancel Membership
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">Are you sure? Access will continue until your billing period ends.</p>
                  <div className="flex gap-3">
                    <button onClick={handleCancel} disabled={cancelLoading} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                      {cancelLoading ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                    <button onClick={() => setCancelConfirm(false)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm">
                      Keep Membership
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
