'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Crown, Star, Zap, Shield, Brain, Wrench, Users, Truck,
  Building2, CheckCircle2, ArrowRight, Sparkles, Award,
  TrendingUp, Globe, ChevronRight, X, Gift, Layers,
  FlaskConical, MapPin, BarChart3, Lock, Landmark, Leaf,
  Camera, Cpu, Banknote, FileText, HardHat, Gauge,
  ArrowUpRight, ChevronDown, Rocket, ServerCog,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ── Tier definitions ─────────────────────────────────────────────── */

const TIERS = [
  {
    id: 'free',
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'from-gray-500 to-gray-600',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: Zap,
    tagline: 'Get started with the basics',
    features: [
      '5 AI queries/day',
      'Materials marketplace browsing',
      'Order tracking',
      'Basic chatbot assistant',
    ],
    highlights: [],
  },
  {
    id: 'silver',
    name: 'Professional',
    monthlyPrice: 999,
    annualPrice: 9990,
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-700',
    icon: Star,
    tagline: 'For contractors & small builders',
    features: [
      '50 AI queries/day',
      '5% discount on all orders',
      'Advanced AI civil consultant',
      'Structural calculations & load analysis',
      'AI cost prediction',
      'Project marketplace access',
      'Contractor bidding system',
      'Milestone-based payments',
      'Workforce hiring with verification',
      'Equipment rental marketplace',
      'Construction loans & material credit',
      'Escrow payment protection',
      'Priority support',
      '2× loyalty points',
    ],
    highlights: ['AI Engineering', 'Projects', 'Workforce', 'Equipment', 'Finance'],
  },
  {
    id: 'gold',
    name: 'Business',
    monthlyPrice: 2499,
    annualPrice: 24990,
    color: 'from-amber-400 to-yellow-600',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    icon: Crown,
    tagline: 'For construction firms & large projects',
    popular: true,
    features: [
      '200 AI queries/day',
      '10% discount on all orders',
      'Everything in Professional, plus:',
      'Soil suitability & risk detection',
      'Architecture design studio',
      'AI floor plan generation',
      'AI design suggestions & 3D viz',
      'AI construction planning engine',
      'Budget forecasting',
      'Resource allocation optimization',
      'Government tender access',
      'Infrastructure analytics dashboard',
      'Carbon footprint tracking',
      'Green building reports',
      '3× loyalty points',
    ],
    highlights: ['Design Studio', 'AI Planning', 'Gov Tenders', 'Sustainability'],
  },
  {
    id: 'platinum',
    name: 'Premium',
    monthlyPrice: 4999,
    annualPrice: 49990,
    color: 'from-violet-500 to-purple-700',
    border: 'border-violet-300',
    badge: 'bg-violet-100 text-violet-800',
    icon: Award,
    tagline: 'For infrastructure companies & developers',
    features: [
      'Unlimited AI queries',
      '15% discount on all orders',
      'Everything in Business, plus:',
      'Digital twin 3D building models',
      'IoT sensor integration',
      'Predictive maintenance',
      'Drone site monitoring',
      'Custom API access',
      'Dedicated account manager',
      '5× loyalty points',
    ],
    highlights: ['Digital Twins', 'IoT', 'Drone Monitoring', 'Dedicated Support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 14999,
    annualPrice: 149990,
    color: 'from-emerald-500 to-teal-700',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: Rocket,
    tagline: 'For governments, smart cities & mega projects',
    features: [
      'Unlimited everything',
      '20% discount on all orders',
      'Everything in Premium, plus:',
      'Smart city analytics',
      'White-label platform',
      '7× loyalty points',
      'Custom integrations',
      'SLA-backed uptime',
    ],
    highlights: ['Smart Cities', 'White Label', 'Custom SLA'],
  },
];

/* ── Construction Lifecycle Phases ────────────────────────────────── */

const LIFECYCLE = [
  { phase: 'Idea', icon: '💡', desc: 'Conceptualize your project with AI assistance' },
  { phase: 'Planning', icon: '📋', desc: 'AI-generated timelines, budgets & resource plans' },
  { phase: 'Design', icon: '🏛️', desc: '3D visualization, floor plans & AI design studio' },
  { phase: 'Procurement', icon: '🏗️', desc: 'Materials marketplace with live pricing & logistics' },
  { phase: 'Workforce', icon: '👷', desc: 'Hire verified masons, electricians, plumbers & more' },
  { phase: 'Construction', icon: '🔨', desc: 'Drone monitoring, milestone payments & progress tracking' },
  { phase: 'Monitoring', icon: '📡', desc: 'IoT sensors, digital twins & predictive maintenance' },
  { phase: 'Maintenance', icon: '🔧', desc: 'Structural health monitoring & maintenance prediction' },
  { phase: 'Analytics', icon: '📊', desc: 'Infrastructure analytics & carbon footprint tracking' },
];

/* ── Platform Feature Sections ────────────────────────────────────── */

const PLATFORM_FEATURES = [
  {
    icon: Building2, title: 'Construction Marketplace',
    desc: 'Global marketplace for cement, steel, sand, aggregates, electrical, plumbing, tiles, hardware tools, and construction chemicals. Live supplier network with real-time pricing, bulk procurement, logistics optimization, and delivery tracking.',
    minTier: 'free', link: '/products',
  },
  {
    icon: Brain, title: 'AI Civil Engineering Intelligence',
    desc: 'Expert-level structural calculations, IS code guidance, load analysis, material estimation, foundation recommendations, soil suitability, cost prediction, and risk detection — all powered by AI.',
    minTier: 'silver', link: '/estimator',
  },
  {
    icon: Landmark, title: 'Infrastructure Project Marketplace',
    desc: 'Post residential buildings, apartments, roads, bridges, dams, airports, and smart city projects. Get contractor bids, AI cost estimates, risk evaluations, timeline tracking, and milestone payments.',
    minTier: 'silver', link: '/projects',
  },
  {
    icon: Users, title: 'Workforce Economy',
    desc: 'Hire verified masons, electricians, plumbers, welders, carpenters, painters, tile workers, and equipment operators. Skill verification, ratings, real-time availability, and geo-based hiring.',
    minTier: 'silver', link: '/workforce',
  },
  {
    icon: Wrench, title: 'Equipment Sharing Economy',
    desc: 'Rent excavators, cranes, concrete mixers, bulldozers, drilling rigs, and scaffolding. Hourly and daily rentals with operator availability and delivery to site.',
    minTier: 'silver', link: '/equipment',
  },
  {
    icon: Layers, title: 'Architecture & Design Studio',
    desc: 'Connect with architects for building, interior, exterior, and landscape design. AI-powered 3D visualization, floor plan generation, and urban planning tools.',
    minTier: 'gold', link: '/design-studio',
  },
  {
    icon: Cpu, title: 'AI Construction Planning Engine',
    desc: 'Auto-generate construction timelines, budget forecasts, resource allocation plans, and risk alerts. Input your project specs and get a complete execution plan.',
    minTier: 'gold', link: '/estimator',
  },
  {
    icon: Globe, title: 'Digital Twin Technology',
    desc: 'Create 3D digital models of buildings and infrastructure. Integrate IoT sensors for real-time structural monitoring and predictive maintenance.',
    minTier: 'platinum', link: '/digital-twin',
  },
  {
    icon: Banknote, title: 'Construction Finance System',
    desc: 'Construction loans, material credit lines, contractor payments, and escrow protection. All payments are milestone-based for maximum security.',
    minTier: 'silver', link: '/credit',
  },
  {
    icon: FileText, title: 'Government Infrastructure',
    desc: 'Access government tenders, monitor infrastructure projects, track progress, and manage contractor compliance for public works.',
    minTier: 'gold', link: '/projects',
  },
  {
    icon: Camera, title: 'Drone & IoT Monitoring',
    desc: 'Drone-based site monitoring for construction progress. IoT sensors for structural health, environmental conditions, and safety compliance.',
    minTier: 'platinum', link: '/drone-monitoring',
  },
  {
    icon: Leaf, title: 'Sustainability & Carbon Tracking',
    desc: 'Track and reduce your project\'s environmental impact. Get green building certification reports and sustainability recommendations.',
    minTier: 'gold', link: '/sustainability',
  },
];

/* ── Comparison Table Features ─────────────────────────────────────── */

const COMPARISON_SECTIONS = [
  {
    group: 'Construction Marketplace',
    rows: [
      { label: 'Materials Marketplace', free: true, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Bulk Procurement', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Logistics Optimization', free: false, silver: true, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'AI Engineering Intelligence',
    rows: [
      { label: 'Basic Material Estimator', free: true, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Advanced AI Consultant', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Structural Calculations', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Load Analysis', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Soil Suitability Analysis', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'Cost Prediction & Risk Detection', free: false, silver: false, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Project Marketplace',
    rows: [
      { label: 'Post & Browse Projects', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Contractor Bidding', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Milestone Payments', free: false, silver: true, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Workforce & Equipment',
    rows: [
      { label: 'Workforce Hiring', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Equipment Rental', free: false, silver: true, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Design & Planning',
    rows: [
      { label: 'Architecture Design Studio', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'AI Floor Plan Generation', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'AI Construction Planning Engine', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'Budget Forecasting', free: false, silver: false, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Digital Twin & IoT',
    rows: [
      { label: '3D Digital Twins', free: false, silver: false, gold: false, platinum: true, enterprise: true },
      { label: 'IoT Sensor Integration', free: false, silver: false, gold: false, platinum: true, enterprise: true },
      { label: 'Drone Monitoring', free: false, silver: false, gold: false, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Finance & Government',
    rows: [
      { label: 'Construction Loans', free: false, silver: true, gold: true, platinum: true, enterprise: true },
      { label: 'Government Tender Access', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'Infrastructure Analytics', free: false, silver: false, gold: true, platinum: true, enterprise: true },
    ],
  },
  {
    group: 'Sustainability & Advanced',
    rows: [
      { label: 'Carbon Footprint Tracking', free: false, silver: false, gold: true, platinum: true, enterprise: true },
      { label: 'Smart City Analytics', free: false, silver: false, gold: false, platinum: false, enterprise: true },
      { label: 'White-Label Platform', free: false, silver: false, gold: false, platinum: false, enterprise: true },
      { label: 'Custom API Access', free: false, silver: false, gold: false, platinum: true, enterprise: true },
      { label: 'Dedicated Account Manager', free: false, silver: false, gold: false, platinum: true, enterprise: true },
    ],
  },
];

const LOYALTY_TIERS = [
  { tier: 'Starter', multiplier: '1×', color: 'text-gray-600', bg: 'bg-gray-50', bonus: 0 },
  { tier: 'Professional', multiplier: '2×', color: 'text-slate-700', bg: 'bg-slate-50', bonus: 500 },
  { tier: 'Business', multiplier: '3×', color: 'text-amber-700', bg: 'bg-amber-50', bonus: 1500 },
  { tier: 'Premium', multiplier: '5×', color: 'text-violet-700', bg: 'bg-violet-50', bonus: 5000 },
  { tier: 'Enterprise', multiplier: '7×', color: 'text-emerald-700', bg: 'bg-emerald-50', bonus: 15000 },
];

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum', 'enterprise'];

/* ── Revenue Model (for transparency section) ────────────────────── */

const REVENUE_STREAMS = [
  { icon: '💳', title: 'Marketplace Commission', desc: '2-5% on material transactions' },
  { icon: '🏢', title: 'Contractor Subscriptions', desc: 'Monthly/annual premium tiers' },
  { icon: '🤖', title: 'Premium AI Tools', desc: 'Advanced engineering & planning AI' },
  { icon: '🚜', title: 'Equipment Rentals', desc: 'Commission on equipment bookings' },
  { icon: '📊', title: 'Infrastructure Analytics', desc: 'Data insights for governments' },
  { icon: '🏗️', title: 'Project Marketplace Fees', desc: 'Bidding and escrow fees' },
];

/* ── Component ────────────────────────────────────────────────────── */

export default function PremiumPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);

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
        body: JSON.stringify({ tier: tierId, billing_cycle: billingCycle, payment_reference: `mock_${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Subscription failed');
      setSuccessMsg(`🎉 Welcome to the ${data.tier ? TIERS.find(t => t.id === data.tier)?.name || data.tier : ''} plan! ${data.loyalty_bonus_awarded ? `You earned ${data.loyalty_bonus_awarded.toLocaleString()} bonus loyalty points!` : ''}`);
      const r2 = await fetch(`${API_URL}/api/v1/premium/status`, { headers: { Authorization: `Bearer ${token}` } });
      setMembershipStatus(await r2.json());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubscribing(null);
    }
  };

  const currentTier = membershipStatus?.tier || 'free';
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-gray-50">

      {/* ═══ Hero ═══ */}
      <section className="relative bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-6">
            <Crown className="w-4 h-4 text-yellow-300" />
            Nirmaan — The Digital Operating System for Construction
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Digitize Your Entire<br />
            <span className="text-yellow-300">Construction Lifecycle</span>
          </h1>
          <p className="text-lg text-violet-100 mb-6 max-w-3xl mx-auto">
            From idea to infrastructure analytics — Nirmaan integrates materials supply, workforce, engineering intelligence, project execution, IoT monitoring, and financial systems into one unified super-platform.
          </p>
          {isAuthenticated && membershipStatus && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 text-white">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Current: {TIERS.find(t => t.id === currentTier)?.name || currentTier} Plan</span>
              {(membershipStatus.loyalty_points ?? 0) > 0 && (
                <>
                  <span className="opacity-50">•</span>
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <span>{(membershipStatus.loyalty_points ?? 0).toLocaleString()} pts (₹{membershipStatus.points_value_inr ?? 0})</span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══ Construction Lifecycle Pipeline ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">One Platform, Entire Construction Lifecycle</h2>
          <p className="text-gray-500">Nirmaan digitizes every phase — from the first idea to long-term infrastructure analytics</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-violet-200 via-amber-200 to-emerald-200 -translate-y-1/2" />
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {LIFECYCLE.map((step, i) => (
              <div key={step.phase} className="relative flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-2xl mb-2 group-hover:shadow-lg group-hover:scale-110 transition-all z-10">
                  {step.icon}
                </div>
                <p className="text-xs font-bold text-gray-800">{step.phase}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5 hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Messages ═══ */}
      <div className="max-w-7xl mx-auto px-4">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
            <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* ═══ Billing Toggle ═══ */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h2>
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >Monthly</button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billingCycle === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Annual <span className="text-green-600 text-xs ml-1">Save 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Pricing Cards ═══ */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrentTier = currentTier === tier.id;
            const tierIdx = TIER_ORDER.indexOf(tier.id);
            const isDowngrade = tierIdx < currentTierIdx && tierIdx > 0;
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const perMonth = billingCycle === 'annual' && tier.annualPrice ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border-2 ${tier.border} bg-white shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-lg ${tier.popular ? 'ring-2 ring-amber-400 scale-[1.02]' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">MOST POPULAR</div>
                )}
                {isCurrentTier && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl">ACTIVE</div>
                )}
                {/* Header */}
                <div className={`bg-gradient-to-br ${tier.color} p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 rounded-lg p-1.5"><Icon className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="text-white font-bold text-base">{tier.name}</h3>
                      <p className="text-white/70 text-[10px]">{tier.tagline}</p>
                    </div>
                  </div>
                  <div className="text-white mt-1">
                    {price === 0 ? (
                      <span className="text-2xl font-extrabold">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold">₹{perMonth.toLocaleString()}</span>
                        <span className="text-white/70 text-xs">/mo</span>
                        {billingCycle === 'annual' && (
                          <p className="text-white/60 text-[10px] mt-0.5">₹{price.toLocaleString()} billed annually</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* Features */}
                <div className="p-4 flex-1 flex flex-col">
                  {tier.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tier.highlights.map(h => (
                        <span key={h} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">{h}</span>
                      ))}
                    </div>
                  )}
                  <ul className="space-y-1.5 mb-4 flex-1 text-xs">
                    {tier.features.map(f => (
                      <li key={f} className={`flex items-start gap-1.5 ${f.startsWith('Everything') ? 'text-violet-600 font-semibold' : 'text-gray-700'}`}>
                        {f.startsWith('Everything') ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isCurrentTier || subscribing === tier.id || tier.id === 'free'}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isCurrentTier
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : tier.id === 'free'
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : tier.id === 'enterprise'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                        : `bg-gradient-to-r ${tier.color} text-white hover:opacity-90`
                    } disabled:opacity-60`}
                  >
                    {subscribing === tier.id ? 'Processing…' : isCurrentTier ? '✓ Current Plan' : tier.id === 'free' ? 'Free Plan' : tier.id === 'enterprise' ? 'Contact Sales' : `Upgrade to ${tier.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Feature Comparison Toggle ═══ */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-800 transition-colors"
          >
            <span>{showComparison ? 'Hide' : 'Show'} Full Feature Comparison</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showComparison && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[200px]">Feature</th>
                  {TIERS.map(t => (
                    <th key={t.id} className="text-center px-3 py-3 font-semibold text-gray-700 min-w-[90px]">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${t.badge}`}>{t.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map(section => (
                  <>
                    <tr key={section.group} className="bg-violet-50/50">
                      <td colSpan={6} className="px-4 py-2 font-bold text-violet-700 text-xs">{section.group}</td>
                    </tr>
                    {section.rows.map(row => (
                      <tr key={row.label} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700 text-xs">{row.label}</td>
                        {(['free', 'silver', 'gold', 'platinum', 'enterprise'] as const).map(tid => (
                          <td key={tid} className="text-center px-3 py-2">
                            {row[tid] ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-gray-200 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
                {/* AI Queries & Discount rows */}
                <tr className="bg-violet-50/50">
                  <td colSpan={6} className="px-4 py-2 font-bold text-violet-700 text-xs">Limits & Discounts</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-2 text-gray-700 text-xs">AI Queries/Day</td>
                  <td className="text-center text-xs font-semibold">5</td>
                  <td className="text-center text-xs font-semibold">50</td>
                  <td className="text-center text-xs font-semibold">200</td>
                  <td className="text-center text-xs font-semibold text-violet-600">∞</td>
                  <td className="text-center text-xs font-semibold text-emerald-600">∞</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-2 text-gray-700 text-xs">Order Discount</td>
                  <td className="text-center text-xs">0%</td>
                  <td className="text-center text-xs font-semibold text-green-600">5%</td>
                  <td className="text-center text-xs font-semibold text-green-600">10%</td>
                  <td className="text-center text-xs font-semibold text-green-600">15%</td>
                  <td className="text-center text-xs font-semibold text-green-600">20%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-700 text-xs">Loyalty Multiplier</td>
                  <td className="text-center text-xs">1×</td>
                  <td className="text-center text-xs font-semibold">2×</td>
                  <td className="text-center text-xs font-semibold">3×</td>
                  <td className="text-center text-xs font-semibold">5×</td>
                  <td className="text-center text-xs font-semibold">7×</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ═══ Platform Features Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">12 Platform Modules, One Ecosystem</h2>
          <p className="text-gray-500">Every module you need to plan, build, monitor, and maintain construction projects at scale</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLATFORM_FEATURES.map(feat => {
            const Icon = feat.icon;
            const tierIdx = TIER_ORDER.indexOf(feat.minTier);
            const hasAccess = currentTierIdx >= tierIdx;
            return (
              <Link
                key={feat.title}
                href={feat.link}
                className={`group rounded-2xl border p-5 bg-white shadow-sm transition-all hover:shadow-md ${!hasAccess ? 'opacity-80' : 'hover:border-violet-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${hasAccess ? 'bg-violet-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${hasAccess ? 'text-violet-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{feat.title}</h3>
                      {!hasAccess && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-2">{feat.desc}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      feat.minTier === 'free' ? 'bg-gray-100 text-gray-600' :
                      feat.minTier === 'silver' ? 'bg-slate-100 text-slate-700' :
                      feat.minTier === 'gold' ? 'bg-amber-100 text-amber-700' :
                      feat.minTier === 'platinum' ? 'bg-violet-100 text-violet-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {feat.minTier === 'free' ? 'All Plans' : `${TIERS.find(t => t.id === feat.minTier)?.name}+`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Loyalty Program ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-400/20 rounded-xl p-3"><Gift className="w-7 h-7 text-amber-600" /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Loyalty Rewards Program</h2>
              <p className="text-gray-500 text-sm">Earn points on every purchase. 100 points = ₹1 discount</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {LOYALTY_TIERS.map(b => (
              <div key={b.tier} className={`${b.bg} rounded-2xl p-3 text-center border border-white`}>
                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">{b.tier}</p>
                <p className={`text-2xl font-extrabold ${b.color}`}>{b.multiplier}</p>
                <p className="text-[10px] text-gray-500">points/₹</p>
                {b.bonus > 0 && <p className="text-[10px] text-amber-600 font-semibold mt-1">+{b.bonus.toLocaleString()} bonus</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {[
              { icon: TrendingUp, title: 'Earn', desc: 'Get 1–7 points per ₹1 spent, multiplied by your tier' },
              { icon: Award, title: 'Redeem', desc: 'Convert points to instant discounts at checkout (100 pts = ₹1)' },
              { icon: Sparkles, title: 'Bonus', desc: 'Get welcome bonuses (500–15,000 pts) when you upgrade' },
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
                <p className="text-2xl font-extrabold text-amber-600">{(membershipStatus.loyalty_points ?? 0).toLocaleString()} pts</p>
                <p className="text-xs text-gray-400">≈ ₹{membershipStatus.points_value_inr ?? 0} in discounts</p>
              </div>
              <Link href="/products" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                Shop & Earn <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Revenue Model (Transparency) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How Nirmaan Works</h2>
          <p className="text-gray-500">A sustainable ecosystem powering India&apos;s construction industry</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {REVENUE_STREAMS.map(item => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Platform Vision Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore the Platform</h2>
          <p className="text-gray-500">Every module connects to create the complete construction operating system</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🏗️', label: 'Materials Marketplace', href: '/products' },
            { icon: '🤖', label: 'AI Engineering Consultant', href: '/estimator' },
            { icon: '📋', label: 'Project Marketplace', href: '/projects' },
            { icon: '👷', label: 'Hire Workforce', href: '/workforce' },
            { icon: '🚜', label: 'Equipment Rental', href: '/equipment' },
            { icon: '🏛️', label: 'Design Studio', href: '/design-studio' },
            { icon: '🌐', label: 'Digital Twins', href: '/digital-twin' },
            { icon: '💰', label: 'Construction Finance', href: '/credit' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md transition-all hover:border-violet-200">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      {!isAuthenticated && (
        <section className="max-w-4xl mx-auto px-4 pb-16 text-center">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white">
            <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold mb-2">Start Building Smarter Today</h2>
            <p className="text-violet-100 mb-6 text-sm max-w-xl mx-auto">Join thousands of contractors, builders, and infrastructure companies using Nirmaan to digitize their construction workflow.</p>
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
