'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Leaf, Shield, Lock, Crown, ArrowRight, BarChart3, TrendingUp,
  CheckCircle2, AlertTriangle, Droplets, Wind, Zap, Sun,
  TreePine, Recycle, Building2, Globe, Award, MapPin,
  Thermometer, Factory, FileText, ArrowDown,
} from 'lucide-react';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum', 'enterprise'];
const MIN_TIER = 'gold';

/* ── Carbon Categories ───────────────────────────────────────────── */
const CARBON_CATEGORIES = [
  { material: 'Cement (OPC)', emission: '0.9 kg CO₂/kg', impact: 'Very High', tip: 'Use PPC or fly ash blended cement to reduce by 20-30%', icon: '🏭', color: 'bg-red-50 text-red-700' },
  { material: 'Steel (TMT)', emission: '1.8 kg CO₂/kg', impact: 'Very High', tip: 'Use recycled steel or optimize designs to reduce steel quantity', icon: '🔩', color: 'bg-red-50 text-red-700' },
  { material: 'Bricks (Clay)', emission: '0.24 kg CO₂/brick', impact: 'High', tip: 'Switch to AAC blocks or fly ash bricks — 40% lower emissions', icon: '🧱', color: 'bg-orange-50 text-orange-700' },
  { material: 'Sand (River)', emission: '0.01 kg CO₂/kg', impact: 'Low', tip: 'Use M-Sand (manufactured sand) to reduce mining impact', icon: '🏖️', color: 'bg-yellow-50 text-yellow-700' },
  { material: 'Aggregate', emission: '0.008 kg CO₂/kg', impact: 'Low', tip: 'Source locally to minimize transport emissions', icon: '🪨', color: 'bg-green-50 text-green-700' },
  { material: 'Aluminium', emission: '8.24 kg CO₂/kg', impact: 'Extreme', tip: 'Use recycled aluminium — 95% less energy than primary production', icon: '📦', color: 'bg-red-50 text-red-700' },
  { material: 'Glass', emission: '0.86 kg CO₂/kg', impact: 'Medium', tip: 'Use double-glazed or Low-E glass for energy efficiency', icon: '🪟', color: 'bg-amber-50 text-amber-700' },
  { material: 'Timber', emission: '-1.0 kg CO₂/kg', impact: 'Carbon Negative', tip: 'Timber stores carbon — use sustainably sourced wood for framing', icon: '🪵', color: 'bg-emerald-50 text-emerald-700' },
];

/* ── Green Certifications ────────────────────────────────────────── */
const CERTIFICATIONS = [
  { name: 'IGBC Green Homes', body: 'Indian Green Building Council', levels: ['Certified', 'Silver', 'Gold', 'Platinum'], desc: 'India\'s leading green building rating for residential projects', icon: '🏠' },
  { name: 'GRIHA', body: 'TERI', levels: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], desc: 'National rating system for green buildings under BEE', icon: '🌿' },
  { name: 'LEED', body: 'USGBC', levels: ['Certified', 'Silver', 'Gold', 'Platinum'], desc: 'Globally recognized green building certification', icon: '🌍' },
  { name: 'EDGE', body: 'IFC/World Bank', levels: ['EDGE Certified', 'EDGE Advanced', 'Zero Carbon'], desc: 'Focus on energy, water, and materials savings — ideal for emerging markets', icon: '💡' },
];

/* ── Sustainability Features ─────────────────────────────────────── */
const FEATURES = [
  { icon: BarChart3, title: 'Carbon Footprint Calculator', desc: 'Input materials, equipment, and transport data to get total project CO₂ emissions', tier: 'gold' },
  { icon: Leaf, title: 'Green Material Recommendations', desc: 'AI suggests eco-friendly alternatives for every material in your estimate', tier: 'gold' },
  { icon: Award, title: 'Certification Readiness Report', desc: 'Auto-check your project against IGBC, GRIHA, LEED, and EDGE requirements', tier: 'gold' },
  { icon: Droplets, title: 'Water Efficiency Tracker', desc: 'Monitor water usage during construction. Recommend rainwater harvesting and recycling', tier: 'gold' },
  { icon: Zap, title: 'Energy Optimization', desc: 'Analyze energy consumption and recommend solar, LED, and efficient HVAC systems', tier: 'platinum' },
  { icon: Recycle, title: 'Waste Management Plan', desc: 'Track construction waste, recommend recycling, and generate compliance reports', tier: 'platinum' },
  { icon: Globe, title: 'ESG Reporting', desc: 'Generate Environmental-Social-Governance reports for investors and regulators', tier: 'enterprise' },
  { icon: TreePine, title: 'Carbon Offset Marketplace', desc: 'Purchase verified carbon offsets to make your project carbon-neutral', tier: 'enterprise' },
];

/* ── Demo Project Stats ──────────────────────────────────────────── */
const DEMO_STATS = {
  projectName: 'Nirmaan Green Residency — G+8',
  totalCO2: 842,
  savedCO2: 198,
  savingsPercent: 19,
  waterSaved: 45000,
  wasteDiverted: 72,
  certTarget: 'IGBC Gold',
  breakdown: [
    { category: 'Cement & Concrete', co2: 380, percent: 45, color: 'bg-red-400' },
    { category: 'Steel', co2: 252, percent: 30, color: 'bg-orange-400' },
    { category: 'Bricks & Blocks', co2: 85, percent: 10, color: 'bg-amber-400' },
    { category: 'Transport', co2: 67, percent: 8, color: 'bg-blue-400' },
    { category: 'Equipment & Energy', co2: 42, percent: 5, color: 'bg-violet-400' },
    { category: 'Other Materials', co2: 16, percent: 2, color: 'bg-gray-400' },
  ],
};

export default function SustainabilityPage() {
  const { user, isAuthenticated } = useAuth();
  const [showCertDetails, setShowCertDetails] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const userTier = user?.membership_tier || 'free';
  const userTierIdx = TIER_ORDER.indexOf(userTier);
  const hasAccess = userTierIdx >= TIER_ORDER.indexOf(MIN_TIER);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Leaf className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sustainability & Carbon Tracking</h1>
          <p className="text-gray-500 mb-6">Sign in to track your project&apos;s environmental impact and get green building certifications.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sustainability & Carbon Tracking</h1>
          <p className="text-gray-500 mb-2">This module requires <span className="font-semibold text-amber-600">Gold</span> tier or above.</p>
          <p className="text-gray-400 text-sm mb-6">Your current plan: <span className="font-semibold capitalize">{userTier}</span></p>
          <Link href="/premium" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all">
            <Crown className="w-4 h-4" /> Upgrade to Gold <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">

      {/* ═══ Hero ═══ */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-5">
            <Leaf className="w-4 h-4 text-yellow-300" />
            Gold+ Feature — Sustainability & Carbon Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Sustainability &<br />
            <span className="text-yellow-300">Carbon Tracking</span>
          </h1>
          <p className="text-lg text-green-100 max-w-3xl mx-auto mb-6">
            Measure, reduce, and offset your construction carbon footprint.
            Get green building certification readiness reports and sustainable material recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Factory className="w-4 h-4" /> Carbon Calculator</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> 4 Certifications</span>
            <span className="flex items-center gap-1"><Recycle className="w-4 h-4" /> Waste Tracking</span>
          </div>
        </div>
      </section>

      {/* ═══ Project Carbon Dashboard (Demo) ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Carbon Dashboard</h2>
          <p className="text-gray-500">Sample: {DEMO_STATS.projectName}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <Factory className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-gray-900">{DEMO_STATS.totalCO2}</p>
            <p className="text-[10px] text-gray-400">tons CO₂ total</p>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-4 text-center">
            <ArrowDown className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-green-600">{DEMO_STATS.savedCO2}</p>
            <p className="text-[10px] text-gray-400">tons CO₂ saved ({DEMO_STATS.savingsPercent}%)</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-4 text-center">
            <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-blue-600">{(DEMO_STATS.waterSaved / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-gray-400">liters water saved</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-4 text-center">
            <Recycle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-amber-600">{DEMO_STATS.wasteDiverted}%</p>
            <p className="text-[10px] text-gray-400">waste diverted from landfill</p>
          </div>
        </div>

        {/* Carbon Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Carbon Emission Breakdown</h3>
          <div className="space-y-3">
            {DEMO_STATS.breakdown.map(item => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-36 flex-shrink-0">{item.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                  <div className={`${item.color} h-4 rounded-full transition-all`} style={{ width: `${item.percent}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700 w-20 text-right">{item.co2} t ({item.percent}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Certification Target: <span className="font-semibold text-green-600">{DEMO_STATS.certTarget}</span></span>
            <button onClick={() => { const el = document.createElement('a'); el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Carbon Report: ${DEMO_STATS.projectName}\nTotal CO2: ${DEMO_STATS.totalCO2} tons\nSaved CO2: ${DEMO_STATS.savedCO2} tons (${DEMO_STATS.savingsPercent}%)\nWater Saved: ${DEMO_STATS.waterSaved} liters\nWaste Diverted: ${DEMO_STATS.wasteDiverted}%\nCert Target: ${DEMO_STATS.certTarget}\n\nBreakdown:\n${DEMO_STATS.breakdown.map(b => `${b.category}: ${b.co2}t (${b.percent}%)`).join('\n')}`)); el.setAttribute('download', 'carbon_report.txt'); el.click(); showToast('Carbon report downloaded! 🌍'); }} className="text-xs bg-green-50 text-green-700 font-semibold px-4 py-1.5 rounded-lg hover:bg-green-100 transition-all">
              Download Full Report
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Carbon per Material ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Material Carbon Emissions</h2>
          <p className="text-gray-500">CO₂ emissions per unit of common construction materials with green alternatives</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARBON_CATEGORIES.map(mat => (
            <div key={mat.material} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-green-200 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{mat.icon}</span>
                <div>
                  <h3 className="font-bold text-xs text-gray-900">{mat.material}</h3>
                  <p className="text-[10px] font-mono text-gray-500">{mat.emission}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mat.color}`}>{mat.impact}</span>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">💡 {mat.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Green Certifications ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Green Building Certifications</h2>
          <p className="text-gray-500">Get certification-ready with automated compliance checking</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CERTIFICATIONS.map(cert => (
            <div
              key={cert.name}
              onClick={() => setShowCertDetails(showCertDetails === cert.name ? null : cert.name)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="text-3xl mb-2">{cert.icon}</div>
              <h3 className="font-bold text-sm text-gray-900">{cert.name}</h3>
              <p className="text-[10px] text-gray-400 mb-2">{cert.body}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{cert.desc}</p>
              {showCertDetails === cert.name && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1.5">Levels:</p>
                  <div className="flex flex-wrap gap-1">
                    {cert.levels.map(l => (
                      <span key={l} className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">{l}</span>
                    ))}
                  </div>
                  <button onClick={() => showToast(`${cert.name} readiness check initiated! Results will be ready in 24 hours ✅`)} className="mt-3 w-full text-xs bg-green-50 text-green-700 font-semibold py-2 rounded-lg hover:bg-green-100 transition-all">
                    Check Readiness →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sustainability Tools</h2>
          <p className="text-gray-500">Everything you need to build greener and track your environmental impact</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(feat => {
            const Icon = feat.icon;
            const canUse = userTierIdx >= TIER_ORDER.indexOf(feat.tier);
            return (
              <div key={feat.title} className={`rounded-2xl border p-4 transition-all ${canUse ? 'bg-white hover:shadow-md hover:border-green-200' : 'bg-gray-50 opacity-70'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${canUse ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${canUse ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-bold text-xs text-gray-900">{feat.title}</h3>
                  {!canUse && <Lock className="w-3 h-3 text-gray-400" />}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{feat.desc}</p>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  feat.tier === 'gold' ? 'bg-amber-100 text-amber-700' :
                  feat.tier === 'platinum' ? 'bg-violet-100 text-violet-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {feat.tier === 'gold' ? 'Gold+' : feat.tier === 'platinum' ? 'Platinum+' : 'Enterprise'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white">
          <Leaf className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold mb-2">Build Green, Build Smart</h2>
          <p className="text-green-100 text-sm mb-5 max-w-xl mx-auto">
            Start tracking your project&apos;s environmental impact today. Reduce emissions, save costs, and earn green certifications.
          </p>
          <button onClick={() => showToast('Carbon tracking enabled for your project! 🌱')} className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-all">
            Start Carbon Tracking
          </button>
        </div>
      </section>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce text-sm font-semibold">{toast}</div>}
    </div>
  );
}
