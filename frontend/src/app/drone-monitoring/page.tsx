'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Camera, Shield, Lock, Crown, ArrowRight, Wifi, Activity,
  Thermometer, Eye, BarChart3, AlertTriangle, CheckCircle2,
  Building2, MapPin, Zap, TrendingUp, Clock, Radio,
  CloudRain, Wind, HardHat, Server, Bell, Gauge,
} from 'lucide-react';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum', 'enterprise'];
const MIN_TIER = 'platinum';

/* ── Monitoring Features ─────────────────────────────────────────── */
const MONITORING_FEATURES = [
  {
    icon: Camera, title: 'Drone Site Surveys',
    desc: 'Automated drone flights capture high-resolution images and generate orthomosaic maps of your construction site. Track progress weekly.',
    tier: 'platinum',
  },
  {
    icon: Activity, title: 'Structural Health Sensors',
    desc: 'IoT sensors monitor strain, vibration, tilt, and temperature at critical structural points in real-time.',
    tier: 'platinum',
  },
  {
    icon: Eye, title: 'AI Progress Tracking',
    desc: 'AI compares drone imagery against BIM models to auto-detect construction progress and flag deviations.',
    tier: 'platinum',
  },
  {
    icon: AlertTriangle, title: 'Safety Compliance Monitor',
    desc: 'Detect missing safety equipment, unauthorized zone entries, and hazardous conditions using computer vision.',
    tier: 'platinum',
  },
  {
    icon: CloudRain, title: 'Environmental Monitoring',
    desc: 'Track weather, air quality, noise levels, dust concentration, and temperature for regulatory compliance.',
    tier: 'platinum',
  },
  {
    icon: Bell, title: 'Real-Time Alerts',
    desc: 'Instant SMS, email, and app notifications for structural anomalies, safety violations, and weather alerts.',
    tier: 'platinum',
  },
  {
    icon: BarChart3, title: 'Analytics & Reports',
    desc: 'Weekly automated reports with progress %, deviation analysis, safety scores, and environmental compliance.',
    tier: 'platinum',
  },
  {
    icon: Server, title: 'API & Data Export',
    desc: 'Full API access to sensor data and drone imagery. Integrate with your project management tools.',
    tier: 'enterprise',
  },
];

/* ── Drone Fleet ─────────────────────────────────────────────────── */
const DRONE_FLEET = [
  { name: 'DJI Mavic 3 Enterprise', type: 'Survey Drone', range: '15 km', flight: '45 min', camera: '20 MP + RTK', use: 'Site mapping & orthomosaic', icon: '🛸' },
  { name: 'DJI Matrice 350 RTK', type: 'Inspection Drone', range: '20 km', flight: '55 min', camera: '48 MP + Thermal', use: 'Structural inspection & thermal', icon: '🚁' },
  { name: 'Skydio X10', type: 'Autonomous Drone', range: '10 km', flight: '40 min', camera: 'AI Vision + LiDAR', use: 'Autonomous inspection flights', icon: '🤖' },
  { name: 'senseFly eBee X', type: 'Fixed-Wing', range: '90 km', flight: '90 min', camera: '24 MP Multispectral', use: 'Large area mapping (roads, townships)', icon: '✈️' },
];

/* ── IoT Sensor Packages ─────────────────────────────────────────── */
const SENSOR_PACKAGES = [
  {
    name: 'Basic Monitoring',
    price: '₹49,999/month',
    sensors: ['8 Strain Gauges', '4 Temperature Sensors', '4 Tilt Meters', 'Gateway + Dashboard'],
    bestFor: 'Individual buildings up to G+4',
    tier: 'platinum',
    popular: false,
  },
  {
    name: 'Advanced Monitoring',
    price: '₹1,49,999/month',
    sensors: ['24 Strain Gauges', '12 Vibration Sensors', '8 Tilt Meters', '8 Temperature', '4 Moisture', 'AI Analytics + Alerts'],
    bestFor: 'High-rise buildings, bridges, commercial',
    tier: 'platinum',
    popular: true,
  },
  {
    name: 'Enterprise Suite',
    price: 'Custom Pricing',
    sensors: ['Unlimited Sensors', 'Drone Surveys (Weekly)', 'LiDAR Scanning', 'Digital Twin Integration', 'Dedicated Dashboard', '24/7 Expert Support', 'API Access'],
    bestFor: 'Infrastructure projects, metro, dams',
    tier: 'enterprise',
    popular: false,
  },
];

/* ── Demo Sites ──────────────────────────────────────────────────── */
const DEMO_SITES = [
  {
    id: '1', name: 'Nirmaan Heights — G+12 Residential',
    location: 'Karimnagar', status: 'on-track', progress: 72, lastDrone: '2 days ago',
    sensors: 32, alerts: 0, safetyScore: 96, icon: '🏢',
  },
  {
    id: '2', name: 'National Highway 163 — Km 45-52',
    location: 'Telangana', status: 'delayed', progress: 58, lastDrone: '1 day ago',
    sensors: 18, alerts: 3, safetyScore: 82, icon: '🛣️',
  },
  {
    id: '3', name: 'Warangal Smart City — Phase 2',
    location: 'Warangal', status: 'on-track', progress: 41, lastDrone: '3 days ago',
    sensors: 56, alerts: 1, safetyScore: 91, icon: '🏙️',
  },
];

export default function DroneIoTPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const userTier = user?.membership_tier || 'free';
  const userTierIdx = TIER_ORDER.indexOf(userTier);
  const hasAccess = userTierIdx >= TIER_ORDER.indexOf(MIN_TIER);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Camera className="w-16 h-16 text-sky-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drone & IoT Monitoring</h1>
          <p className="text-gray-500 mb-6">Sign in to access drone-based site surveys and IoT structural monitoring.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-700 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drone & IoT Monitoring</h1>
          <p className="text-gray-500 mb-2">This module requires <span className="font-semibold text-violet-600">Platinum</span> tier or above.</p>
          <p className="text-gray-400 text-sm mb-6">Your current plan: <span className="font-semibold capitalize">{userTier}</span></p>
          <Link href="/premium" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-violet-700 transition-all">
            <Crown className="w-4 h-4" /> Upgrade to Platinum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-gray-50">

      {/* ═══ Hero ═══ */}
      <section className="relative bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-5">
            <Camera className="w-4 h-4 text-yellow-300" />
            Platinum Feature — Drone & IoT Monitoring
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Drone & IoT<br />
            <span className="text-yellow-300">Site Monitoring</span>
          </h1>
          <p className="text-lg text-sky-100 max-w-3xl mx-auto mb-6">
            Automated drone surveys for construction progress tracking. IoT sensors for structural health,
            environmental compliance, and safety monitoring — all in one dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> {DRONE_FLEET.length} Drone Types</span>
            <span className="flex items-center gap-1"><Radio className="w-4 h-4" /> {MONITORING_FEATURES.length} Features</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Safety Compliant</span>
          </div>
        </div>
      </section>

      {/* ═══ Live Sites ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Monitored Sites</h2>
          <p className="text-gray-500">Real-time overview of all construction sites under monitoring</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEMO_SITES.map(site => (
            <div
              key={site.id}
              onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {site.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{site.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" /> {site.location}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-bold text-gray-700">{site.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${site.status === 'on-track' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${site.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Sensors</p>
                  <p className="text-xs font-bold text-gray-800">{site.sensors}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Safety</p>
                  <p className={`text-xs font-bold ${site.safetyScore >= 90 ? 'text-green-600' : 'text-amber-600'}`}>{site.safetyScore}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Alerts</p>
                  <p className={`text-xs font-bold ${site.alerts === 0 ? 'text-green-600' : 'text-red-600'}`}>{site.alerts}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span className={`font-semibold px-2 py-0.5 rounded-full ${
                  site.status === 'on-track' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {site.status === 'on-track' ? '✓ On Track' : '⚠ Delayed'}
                </span>
                <span>Last drone: {site.lastDrone}</span>
              </div>

              {selectedSite === site.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <button onClick={() => showToast(`Loading drone imagery for ${site.name}... 📸`)} className="text-xs bg-sky-50 text-sky-700 font-semibold py-2 rounded-lg hover:bg-sky-100 transition-all">📸 View Imagery</button>
                  <button onClick={() => { const el = document.createElement('a'); el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Site Report: ${site.name}\nLocation: ${site.location}\nProgress: ${site.progress}%\nSensors: ${site.sensors}\nSafety Score: ${site.safetyScore}%\nAlerts: ${site.alerts}\nStatus: ${site.status}\nLast Drone: ${site.lastDrone}`)); el.setAttribute('download', `${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_report.txt`); el.click(); showToast('Report downloaded! 📊'); }} className="text-xs bg-emerald-50 text-emerald-700 font-semibold py-2 rounded-lg hover:bg-emerald-100 transition-all">📊 Full Report</button>
                  <button onClick={() => showToast(`${site.alerts} alerts logged for ${site.name} ⚠️`)} className="text-xs bg-amber-50 text-amber-700 font-semibold py-2 rounded-lg hover:bg-amber-100 transition-all">⚠ Alert Log</button>
                  <button onClick={() => showToast(`Drone survey scheduled for ${site.name}! 🛸`)} className="text-xs bg-violet-50 text-violet-700 font-semibold py-2 rounded-lg hover:bg-violet-100 transition-all">🛸 Schedule Drone</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Drone Fleet ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Drone Fleet</h2>
          <p className="text-gray-500">Professional-grade drones for every type of construction monitoring</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DRONE_FLEET.map(drone => (
            <div key={drone.name} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-sky-200 transition-all text-center">
              <div className="text-4xl mb-3">{drone.icon}</div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{drone.name}</h3>
              <p className="text-[10px] text-sky-600 font-semibold mb-3 bg-sky-50 rounded-full px-2 py-0.5 inline-block">{drone.type}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Range: <span className="font-semibold text-gray-700">{drone.range}</span></p>
                <p>Flight: <span className="font-semibold text-gray-700">{drone.flight}</span></p>
                <p>Camera: <span className="font-semibold text-gray-700">{drone.camera}</span></p>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 border-t border-gray-50 pt-2">{drone.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Monitoring Features ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Capabilities</h2>
          <p className="text-gray-500">Comprehensive monitoring for construction sites of any scale</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MONITORING_FEATURES.map(feat => {
            const Icon = feat.icon;
            const canUse = userTierIdx >= TIER_ORDER.indexOf(feat.tier);
            return (
              <div key={feat.title} className={`rounded-2xl border p-4 transition-all ${canUse ? 'bg-white hover:shadow-md hover:border-sky-200' : 'bg-gray-50 opacity-70'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${canUse ? 'bg-sky-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${canUse ? 'text-sky-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-bold text-xs text-gray-900">{feat.title}</h3>
                  {!canUse && <Lock className="w-3 h-3 text-gray-400" />}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Sensor Packages ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">IoT Sensor Packages</h2>
          <p className="text-gray-500">Choose the right monitoring level for your project</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SENSOR_PACKAGES.map(pkg => {
            const canBuy = userTierIdx >= TIER_ORDER.indexOf(pkg.tier);
            return (
              <div key={pkg.name} className={`rounded-2xl border p-6 bg-white relative ${pkg.popular ? 'border-sky-300 shadow-lg ring-2 ring-sky-100' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-sm mb-1">{pkg.name}</h3>
                <div className="text-2xl font-extrabold text-sky-700 mb-1">{pkg.price}</div>
                <p className="text-[10px] text-gray-400 mb-3">Best for: {pkg.bestFor}</p>
                <ul className="space-y-2 mb-5">
                  {pkg.sensors.map(s => (
                    <li key={s} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!canBuy}
                  onClick={() => canBuy && showToast(`Subscribed to ${pkg.name}! ✅`)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    canBuy
                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canBuy ? 'Get Started' : 'Requires Enterprise'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-8 text-white">
          <Camera className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold mb-2">Start Monitoring Your Site</h2>
          <p className="text-sky-100 text-sm mb-5 max-w-xl mx-auto">
            Schedule a drone survey or install IoT sensors on your construction site. Get real-time safety, progress, and structural insights.
          </p>
          <button onClick={() => showToast('Site survey request submitted! Our team will contact you within 24 hours 📞')} className="bg-white text-sky-700 font-bold px-8 py-3 rounded-xl hover:bg-sky-50 transition-all">
            Schedule Site Survey
          </button>
        </div>
      </section>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce text-sm font-semibold">{toast}</div>}
    </div>
  );
}
