'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Check, Star, Zap, Shield, Truck, Bot, Gift, Users, TrendingUp, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import { api } from '@/lib/api';

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

const PLANS = [
  {
    tier: 'silver',
    name: 'Silver',
    icon: '🥈',
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-400',
    badge: '',
    prices: { monthly: 499, quarterly: 1299, yearly: 4499 },
    savings: { quarterly: 198, yearly: 1489 },
    features: [
      '5% discount on all orders',
      'Free delivery on orders ₹3,000+',
      '1.5x loyalty points multiplier',
      'Priority customer support',
      '25% credit limit boost',
      'Exclusive member deals',
      '25 AI consultant queries/day',
      '500 welcome bonus points',
    ],
  },
  {
    tier: 'gold',
    name: 'Gold',
    icon: '🥇',
    color: 'from-amber-400 to-yellow-600',
    border: 'border-amber-400',
    badge: 'Most Popular',
    prices: { monthly: 999, quarterly: 2499, yearly: 8999 },
    savings: { quarterly: 498, yearly: 1989 },
    features: [
      '10% discount on all orders',
      'Always FREE delivery',
      '2x loyalty points multiplier',
      'Priority support + account manager',
      '50% credit limit boost',
      'Exclusive deals & early access',
      '100 AI consultant queries/day',
      'Bulk pricing access',
      '500 welcome bonus points',
    ],
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    icon: '💎',
    color: 'from-purple-400 to-purple-700',
    border: 'border-purple-400',
    badge: 'Best Value',
    prices: { monthly: 2499, quarterly: 6499, yearly: 21999 },
    savings: { quarterly: 998, yearly: 7989 },
    features: [
      '15% discount on all orders',
      'Always FREE delivery',
      '3x loyalty points multiplier',
      'Dedicated account manager',
      '100% credit limit boost',
      'Government tender access',
      'Unlimited AI consultant queries',
      'Custom cost reports',
      'Infrastructure project support',
      '500 welcome bonus points',
    ],
  },
];

const COMPARISON = [
  { feature: 'Order Discount', free: '—', silver: '5%', gold: '10%', platinum: '15%' },
  { feature: 'Free Delivery Threshold', free: '₹10,000+', silver: '₹3,000+', gold: 'Always Free', platinum: 'Always Free' },
  { feature: 'Loyalty Multiplier', free: '1x', silver: '1.5x', gold: '2x', platinum: '3x' },
  { feature: 'Credit Limit Boost', free: '—', silver: '+25%', gold: '+50%', platinum: '+100%' },
  { feature: 'AI Consultant Queries', free: '—', silver: '25/day', gold: '100/day', platinum: 'Unlimited' },
  { feature: 'Priority Support', free: '—', silver: '✓', gold: '✓', platinum: '✓' },
  { feature: 'Account Manager', free: '—', silver: '—', gold: '✓', platinum: '✓' },
  { feature: 'Bulk Pricing Access', free: '—', silver: '—', gold: '✓', platinum: '✓' },
  { feature: 'Govt Tender Access', free: '—', silver: '—', gold: '—', platinum: '✓' },
  { feature: 'Custom Reports', free: '—', silver: '—', gold: '—', platinum: '✓' },
];

const FAQS = [
  {
    q: 'Can I cancel my membership anytime?',
    a: 'Yes. You can cancel anytime from your Premium Dashboard. Your access continues until the end of your current billing period.',
  },
  {
    q: 'Do loyalty points expire?',
    a: 'Loyalty points are valid for 12 months from the date of earning. Redeem them before they expire.',
  },
  {
    q: 'What happens to my loyalty points if I downgrade?',
    a: 'Your accumulated points remain intact. However, the earning multiplier reverts to your new tier's rate.',
  },
  {
    q: 'Is the AI Consultant available 24/7?',
    a: 'Yes. The AI Civil Engineering Consultant is available round the clock for Silver, Gold, and Platinum members.',
  },
  {
    q: 'Can I upgrade my plan mid-cycle?',
    a: 'Yes. Upgrading will immediately activate your new tier's benefits. The remaining days from your current plan will be credited.',
  },
];

export default function PremiumPage() {
  const { isAuthenticated } = useAuth();
  const { isPremium, membershipTier } = usePremium();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/premium';
      return;
    }
    setLoading(tier);
    setError(null);
    try {
      const data = await api.subscribe(tier, billing);
      setSuccess(`🎉 Welcome to NirmaaN ${tier.charAt(0).toUpperCase() + tier.slice(1)}! You earned ${data.signup_bonus_points} bonus points.`);
      setTimeout(() => { window.location.href = '/premium/dashboard'; }, 2000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Subscription failed. Please try again.')
          : 'Subscription failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Crown className="w-4 h-4" />
            NirmaaN Premium — India&apos;s First Construction Materials Premium Club
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Build Smarter with<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              NirmaaN Premium
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Unlock exclusive discounts, loyalty rewards, AI civil engineering guidance,
            free delivery, and dedicated account management.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#plans" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg flex items-center gap-2">
              <Crown className="w-5 h-5" /> View Plans
            </a>
            {isPremium && (
              <Link href="/premium/dashboard" className="border-2 border-amber-500/50 text-amber-300 font-bold px-8 py-4 rounded-xl hover:bg-amber-500/10 transition-all flex items-center gap-2">
                My Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Benefits overview */}
      <section className="py-12 px-4 bg-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <TrendingDown className="w-6 h-6" />, label: 'Up to 15% off', desc: 'On all orders' },
              { icon: <Truck className="w-6 h-6" />, label: 'Free Delivery', desc: 'Gold & Platinum' },
              { icon: <Bot className="w-6 h-6" />, label: 'AI Consultant', desc: 'Civil engineering expert' },
              { icon: <Gift className="w-6 h-6" />, label: 'Loyalty Points', desc: 'Up to 3x multiplier' },
            ].map((b) => (
              <div key={b.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mx-auto mb-3">
                  {b.icon}
                </div>
                <p className="font-bold text-white text-sm">{b.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
            <p className="text-slate-400">Save more with longer billing cycles</p>
            {/* Billing toggle */}
            <div className="inline-flex bg-slate-800 border border-slate-700 rounded-xl p-1 mt-6 gap-1">
              {(['monthly', 'quarterly', 'yearly'] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setBilling(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${billing === c ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                  {c === 'yearly' && <span className="ml-1 text-[10px] bg-green-500 text-white px-1 py-0.5 rounded-full">Best</span>}
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm mb-6 text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const price = plan.prices[billing];
              const isActive = isPremium && membershipTier === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`relative bg-slate-800 border-2 ${plan.badge === 'Most Popular' ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-700'} rounded-2xl p-6 flex flex-col`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{plan.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                      <p className="text-xs text-slate-400">Premium tier</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 text-sm">/{billing === 'monthly' ? 'mo' : billing === 'quarterly' ? 'qtr' : 'yr'}</span>
                    </div>
                    {billing !== 'monthly' && plan.savings[billing as keyof typeof plan.savings] && (
                      <p className="text-xs text-green-400 mt-1">
                        Save ₹{plan.savings[billing as keyof typeof plan.savings].toLocaleString('en-IN')} vs monthly
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isActive ? (
                    <div className="w-full text-center py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm">
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={loading === plan.tier}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        plan.badge === 'Most Popular'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                      } disabled:opacity-50`}
                    >
                      {loading === plan.tier ? 'Processing…' : isAuthenticated ? `Get ${plan.name}` : 'Sign Up to Subscribe'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-12 px-4 bg-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Full Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium w-40">Feature</th>
                  <th className="py-3 px-4 text-slate-400 font-medium">Free</th>
                  <th className="py-3 px-4 text-slate-300 font-semibold">🥈 Silver</th>
                  <th className="py-3 px-4 text-amber-400 font-semibold">🥇 Gold</th>
                  <th className="py-3 px-4 text-purple-400 font-semibold">💎 Platinum</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-4 text-slate-300 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{row.free}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{row.silver}</td>
                    <td className="py-3 px-4 text-center text-amber-300">{row.gold}</td>
                    <td className="py-3 px-4 text-center text-purple-300">{row.platinum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 border-t border-slate-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Smarter?</h2>
          <p className="text-slate-400 mb-8">Join thousands of builders, contractors, and engineers who trust NirmaaN Premium.</p>
          <a href="#plans" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold px-10 py-4 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-xl text-lg">
            <Sparkles className="w-5 h-5" /> Start Your Premium Journey
          </a>
        </div>
      </section>
    </div>
  );
}

// Re-export TrendingDown since lucide has it
function TrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
