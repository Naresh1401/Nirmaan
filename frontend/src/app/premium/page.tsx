'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Crown, Star, Zap, Shield, Brain, Wrench, Users, Truck,
  Building2, CheckCircle2, ArrowRight, Sparkles, Award,
  TrendingUp, Globe, ChevronRight, X, Gift, Layers,
  FlaskConical, MapPin, BarChart3, Lock,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    color: 'from-gray-500 to-gray-600',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: Zap,
    tagline: 'Get started',
    features: [
      '5 AI queries/day (basic estimator)',
      'Materials marketplace access',
      'Order tracking',
      'Basic chatbot assistant',
    ],
    locked: [
      'Advanced civil engineering AI consultant',
      'Project marketplace',
      'Workforce hiring',
      'Equipment rental',
      'Design studio',
      'Digital twin',
      'Carbon footprint tracking',
      'Priority support',
      'Loyalty rewards multiplier',
    ],
    cta: 'Current Plan',
    ctaStyle: 'bg-gray-200 text-gray-500 cursor-default',
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 999,
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-700',
    icon: Star,
    tagline: 'For professionals',
    features: [
      '50 AI queries/day',
      '5% discount on all orders',
      'Project marketplace access',
      'Workforce hiring',
      'Equipment rental',
      'Priority support',
      '2× loyalty points multiplier',
      'Advanced AI civil consultant',
    ],
    locked: [
      'Architecture design studio',
      'Digital twin technology',
    ],
    cta: 'Upgrade to Silver',
    ctaStyle: 'bg-gradient-to-r from-slate-500 to-slate-700 text-white hover:from-slate-600 hover:to-slate-800',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 2499,
    color: 'from-amber-400 to-yellow-600',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    icon: Crown,
    tagline: 'Most popular',
    popular: true,
    features: [
      '200 AI queries/day',
      '10% discount on all orders',
      'Project marketplace',
      'Workforce hiring',
      'Equipment rental',
      'Architecture design studio',
      'Carbon footprint tracking',
      'Priority support',
      '3× loyalty points multiplier',
      'Advanced AI civil consultant',
    ],
    locked: [
      'Digital twin technology',
    ],
    cta: 'Upgrade to Gold',
    ctaStyle: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 4999,
    color: 'from-violet-500 to-purple-700',
    border: 'border-violet-300',
    badge: 'bg-violet-100 text-violet-800',
    icon: Award,
    tagline: 'Enterprise grade',
    features: [
      'Unlimited AI queries',
      '15% discount on all orders',
      'Project marketplace',
      'Workforce hiring',
      'Equipment rental',
      'Architecture design studio',
      'Digital twin technology',
      'Carbon footprint tracking',
      'Priority support (24/7)',
      '5× loyalty points multiplier',
      'Dedicated account manager',
      'Custom API access',
    ],
    locked: [],
    cta: 'Upgrade to Platinum',
    ctaStyle: 'bg-gradient-to-r from-violet-500 to-purple-700 text-white hover:from-violet-600 hover:to-purple-800',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Civil Engineering Consultant',
    desc: 'Expert-level structural calculations, IS code guidance, foundation recommendations, load analysis, and cost estimation — all in one chat.',
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    icon: Building2,
    title: 'Infrastructure Project Marketplace',
    desc: 'Post large projects (buildings, roads, bridges). Get contractor bids, AI cost estimates, risk evaluations, and milestone payments.',
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    icon: Users,
    title: 'Workforce Economy',
    desc: 'Hire verified masons, electricians, plumbers, carpenters, and more. Geo-based hiring with ratings and real-time availability.',
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    icon: Wrench,
    title: 'Equipment Sharing Economy',
    desc: 'Rent excavators, cranes, concrete mixers, and more by the hour. Delivery to your construction site included.',
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    icon: Layers,
    title: 'Architecture Design Studio',
    desc: 'Connect with architects, interior designers, and urban planners. Get 3D visualizations, floor plans, and AI design suggestions.',
    tiers: ['gold', 'platinum'],
  },
  {
    icon: Globe,
    title: 'Digital Twin Technology',
    desc: 'Create 3D digital models of your buildings, integrate IoT sensors for structural monitoring, and predict maintenance needs.',
    tiers: ['platinum'],
  },
  {
    icon: BarChart3,
    title: 'Carbon Footprint Tracking',
    desc: 'Track and reduce your project\'s environmental impact. Get green building recommendations and sustainability reports.',
    tiers: ['gold', 'platinum'],
  },
  {
    icon: Gift,
    title: 'Loyalty Rewards Program',
    desc: 'Earn points on every order, multiplied by your tier (2×–5×). Redeem for discounts. 100 points = ₹1.',
    tiers: ['silver', 'gold', 'platinum'],
  },
];

const LOYALTY_BENEFITS = [
  { tier: 'Free', multiplier: '1×', color: 'text-gray-600', bg: 'bg-gray-50' },
  { tier: 'Silver', multiplier: '2×', color: 'text-slate-700', bg: 'bg-slate-50' },
  { tier: 'Gold', multiplier: '3×', color: 'text-amber-700', bg: 'bg-amber-50' },
  { tier: 'Platinum', multiplier: '5×', color: 'text-violet-700', bg: 'bg-violet-50' },
];

export default function PremiumPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState<{
    tier: string;
    loyalty_points: number;
    points_value_inr: number;
    expires_at: string | null;
    remaining_ai_queries_today: number;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && token) {
      setLoadingStatus(true);
      fetch(`${API_URL}/api/v1/premium/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => setMembershipStatus(d))
        .catch(() => {})
        .finally(() => setLoadingStatus(false));
    }
  }, [isAuthenticated, token]);

  const handleSubscribe = async (tierId: string) => {
    if (!isAuthenticated || !token) {
      window.location.href = '/login';
      return;
    }
    if (tierId === 'free') return;
    setSubscribing(tierId);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/v1/premium/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: tierId, payment_reference: `mock_${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Subscription failed');
      setSuccessMsg(`🎉 Welcome to ${tierId.charAt(0).toUpperCase() + tierId.slice(1)}! ${data.loyalty_bonus_awarded ? `You earned ${data.loyalty_bonus_awarded} bonus loyalty points!` : ''}`);
      // Refresh status
      const r2 = await fetch(`${API_URL}/api/v1/premium/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembershipStatus(await r2.json());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubscribing(null);
    }
  };

  const currentTier = membershipStatus?.tier || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-6">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span>Nirmaan Premium — The Construction Super-Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Build Smarter.<br />
            <span className="text-yellow-300">Go Premium.</span>
          </h1>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Unlock advanced AI civil engineering consultation, project marketplace, workforce hiring, equipment rental, and much more.
          </p>
          {isAuthenticated && membershipStatus && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 text-white mb-8">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold capitalize">Current: {currentTier} Plan</span>
              {membershipStatus.loyalty_points > 0 && (
                <>
                  <span className="opacity-50">•</span>
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <span>{membershipStatus.loyalty_points.toLocaleString()} points (₹{membershipStatus.points_value_inr})</span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Messages */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-500">Billed monthly. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map(tier => {
            const Icon = tier.icon;
            const isCurrentTier = currentTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border-2 ${tier.border} bg-white shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-lg ${tier.popular ? 'ring-2 ring-amber-400' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl">
                    Active
                  </div>
                )}
                <div className={`bg-gradient-to-br ${tier.color} p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{tier.name}</h3>
                      <p className="text-white/70 text-xs">{tier.tagline}</p>
                    </div>
                  </div>
                  <div className="text-white">
                    {tier.price === 0 ? (
                      <span className="text-3xl font-extrabold">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold">₹{tier.price.toLocaleString()}</span>
                        <span className="text-white/70 text-sm">/month</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <ul className="space-y-2 mb-4 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {tier.locked.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                        <Lock className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isCurrentTier || subscribing === tier.id || tier.id === 'free'}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      isCurrentTier
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : tier.ctaStyle
                    } disabled:opacity-60`}
                  >
                    {subscribing === tier.id ? 'Processing…' : isCurrentTier ? '✓ Current Plan' : tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Premium Platform Features</h2>
          <p className="text-gray-500">Everything you need to run construction projects at scale</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(feat => {
            const Icon = feat.icon;
            const userHasAccess = feat.tiers.includes(currentTier);
            return (
              <div
                key={feat.title}
                className={`rounded-2xl border p-6 bg-white shadow-sm transition-all hover:shadow-md ${!userHasAccess ? 'opacity-70' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${userHasAccess ? 'bg-violet-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${userHasAccess ? 'text-violet-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm">{feat.title}</h3>
                  {!userHasAccess && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{feat.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {feat.tiers.map(t => (
                    <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      t === 'platinum' ? 'bg-violet-100 text-violet-700' :
                      t === 'gold' ? 'bg-amber-100 text-amber-700' :
                      t === 'silver' ? 'bg-slate-100 text-slate-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Loyalty Program */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-400/20 rounded-xl p-3">
              <Gift className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Loyalty Rewards Program</h2>
              <p className="text-gray-500">Earn points on every purchase. 100 points = ₹1 discount</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {LOYALTY_BENEFITS.map(b => (
              <div key={b.tier} className={`${b.bg} rounded-2xl p-4 text-center border border-white`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">{b.tier}</p>
                <p className={`text-3xl font-extrabold ${b.color}`}>{b.multiplier}</p>
                <p className="text-xs text-gray-500 mt-1">points per ₹</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: TrendingUp, title: 'Earn', desc: 'Get 1–5 points per ₹1 spent, multiplied by your tier' },
              { icon: Award, title: 'Redeem', desc: 'Convert points to instant discounts at checkout (100 pts = ₹1)' },
              { icon: Sparkles, title: 'Bonus', desc: 'Get welcome bonuses (500–5000 pts) when you upgrade your plan' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-xl p-4 border border-amber-100">
                  <Icon className="w-5 h-5 text-amber-600 mb-2" />
                  <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
          {isAuthenticated && membershipStatus && (
            <div className="mt-6 bg-white rounded-xl p-4 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Your Loyalty Points</p>
                <p className="text-2xl font-extrabold text-amber-600">{membershipStatus.loyalty_points.toLocaleString()} pts</p>
                <p className="text-xs text-gray-400">≈ ₹{membershipStatus.points_value_inr} in discounts</p>
              </div>
              <Link href="/premium/loyalty" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                Redeem <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Platform Vision */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">The Complete Construction Platform</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Nirmaan is building the digital operating system for construction — from materials procurement to project execution to infrastructure analytics.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🏗️', label: 'Materials Marketplace', href: '/products' },
            { icon: '🤖', label: 'AI Engineering Consultant', href: '/estimator' },
            { icon: '📋', label: 'Project Marketplace', href: '/projects' },
            { icon: '👷', label: 'Hire Workforce', href: '/workforce' },
            { icon: '🚜', label: 'Equipment Rental', href: '/equipment' },
            { icon: '🏛️', label: 'Design Studio', href: '/premium#design' },
            { icon: '🌐', label: 'Digital Twins', href: '/premium#digital-twin' },
            { icon: '💰', label: 'Construction Finance', href: '/credit' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md transition-all hover:border-violet-200">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white">
            <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold mb-2">Start Your Premium Journey</h2>
            <p className="text-violet-100 mb-6">Create a free account to access the marketplace, then upgrade to Premium for the full experience.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-white text-violet-700 font-bold px-8 py-3 rounded-xl hover:bg-violet-50 transition-all">
                Create Free Account
              </Link>
              <Link href="/login" className="bg-violet-500/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-violet-500/60 transition-all">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
