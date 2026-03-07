'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Globe, Shield, Lock, Crown, ArrowRight, Cpu, Activity,
  Thermometer, Droplets, Wind, Eye, Layers, Server,
  BarChart3, AlertTriangle, CheckCircle2, Building2,
  MapPin, Wifi, Radio, Gauge, Zap, TrendingUp, Camera,
} from 'lucide-react';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum', 'enterprise'];
const MIN_TIER = 'platinum';

/* ── Live Projects (demo data) ───────────────────────────────────── */
const DEMO_PROJECTS = [
  {
    id: '1', name: 'Karimnagar Metro Bridge — Span 3',
    type: 'Bridge', location: 'Karimnagar, Telangana',
    sensors: 24, status: 'healthy', lastSync: '2 min ago',
    metrics: { strain: '0.0012', temp: '34°C', vibration: '0.8 Hz', tilt: '0.02°' },
    alerts: 0, model: '🌉',
  },
  {
    id: '2', name: 'Nirmaan Tower — 14-Floor Residential',
    type: 'Building', location: 'Warangal, Telangana',
    sensors: 48, status: 'warning', lastSync: '5 min ago',
    metrics: { strain: '0.0018', temp: '29°C', vibration: '1.2 Hz', tilt: '0.05°' },
    alerts: 2, model: '🏢',
  },
  {
    id: '3', name: 'NH-163 Flyover Section C',
    type: 'Flyover', location: 'Hyderabad, Telangana',
    sensors: 36, status: 'healthy', lastSync: '1 min ago',
    metrics: { strain: '0.0009', temp: '38°C', vibration: '0.6 Hz', tilt: '0.01°' },
    alerts: 0, model: '🛣️',
  },
  {
    id: '4', name: 'Water Treatment Plant — Phase 2',
    type: 'Infrastructure', location: 'Nizamabad, Telangana',
    sensors: 18, status: 'critical', lastSync: '12 min ago',
    metrics: { strain: '0.0025', temp: '42°C', vibration: '2.1 Hz', tilt: '0.08°' },
    alerts: 5, model: '🏭',
  },
];

/* ── Sensor Types ────────────────────────────────────────────────── */
const SENSOR_TYPES = [
  { icon: Activity, label: 'Strain Gauges', desc: 'Monitor structural deformation in beams, columns, and slabs', count: '126 deployed' },
  { icon: Thermometer, label: 'Temperature Sensors', desc: 'Track concrete curing temp, ambient heat, and thermal stress', count: '84 deployed' },
  { icon: Radio, label: 'Vibration Sensors', desc: 'Detect resonance, traffic impact, and seismic activity', count: '62 deployed' },
  { icon: Gauge, label: 'Tilt Meters', desc: 'Measure foundation settlement and structural inclination', count: '48 deployed' },
  { icon: Droplets, label: 'Moisture Sensors', desc: 'Monitor water ingress, humidity, and corrosion risk', count: '56 deployed' },
  { icon: Wind, label: 'Wind Load Sensors', desc: 'Real-time wind speed and pressure on tall structures', count: '32 deployed' },
];

/* ── Platform Features ───────────────────────────────────────────── */
const FEATURES = [
  { icon: Globe, title: 'Real-Time 3D Model', desc: 'Interactive 3D digital replica of your structure updated with live sensor data', tier: 'platinum' },
  { icon: Activity, title: 'Structural Health Monitoring', desc: 'Continuous strain, vibration, tilt, and temperature monitoring with alerts', tier: 'platinum' },
  { icon: AlertTriangle, title: 'Predictive Maintenance', desc: 'AI predicts cracks, corrosion, and failures before they happen', tier: 'platinum' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Historical trends, anomaly detection, and structural performance scores', tier: 'platinum' },
  { icon: Camera, title: 'Drone Integration', desc: 'Combine drone imagery with IoT data for comprehensive monitoring', tier: 'enterprise' },
  { icon: Server, title: 'API & Data Export', desc: 'REST API access to all sensor data. Export CSV, JSON, or integrate with BIM', tier: 'enterprise' },
];

export default function DigitalTwinPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const userTier = user?.membership_tier || 'free';
  const userTierIdx = TIER_ORDER.indexOf(userTier);
  const hasAccess = userTierIdx >= TIER_ORDER.indexOf(MIN_TIER);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Globe className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Digital Twin Technology</h1>
          <p className="text-gray-500 mb-6">Sign in to access real-time 3D structural monitoring and predictive maintenance.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Digital Twin Technology</h1>
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">

      {/* ═══ Hero ═══ */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-5">
            <Globe className="w-4 h-4 text-yellow-300" />
            Platinum Feature — Digital Twin Technology
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Digital Twin<br />
            <span className="text-yellow-300">Technology</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-3xl mx-auto mb-6">
            Create real-time 3D digital replicas of your structures. Monitor structural health with IoT sensors,
            detect anomalies with AI, and predict maintenance before failures occur.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Wifi className="w-4 h-4" /> {DEMO_PROJECTS.reduce((s, p) => s + p.sensors, 0)}+ Sensors</span>
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {DEMO_PROJECTS.length} Projects</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> Real-time Monitoring</span>
          </div>
        </div>
      </section>

      {/* ═══ Live Projects Dashboard ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Project Dashboard</h2>
          <p className="text-gray-500">Real-time structural health monitoring across all your projects</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMO_PROJECTS.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
              className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                project.status === 'critical' ? 'border-red-200 hover:border-red-300' :
                project.status === 'warning' ? 'border-amber-200 hover:border-amber-300' :
                'border-gray-100 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {project.model}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{project.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" /> {project.location}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  project.status === 'healthy' ? 'bg-green-100 text-green-700' :
                  project.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {project.status === 'healthy' ? '● Healthy' : project.status === 'warning' ? '⚠ Warning' : '🔴 Critical'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Strain</p>
                  <p className="text-xs font-bold text-gray-800">{project.metrics.strain}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Temp</p>
                  <p className="text-xs font-bold text-gray-800">{project.metrics.temp}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Vibration</p>
                  <p className="text-xs font-bold text-gray-800">{project.metrics.vibration}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400">Tilt</p>
                  <p className="text-xs font-bold text-gray-800">{project.metrics.tilt}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {project.sensors} sensors</span>
                <span>Synced {project.lastSync}</span>
                {project.alerts > 0 && (
                  <span className="flex items-center gap-1 text-red-500 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> {project.alerts} alerts
                  </span>
                )}
              </div>

              {selectedProject === project.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => showToast(`Loading 3D model for ${project.name}... 🏛️`)} className="text-xs bg-emerald-50 text-emerald-700 font-semibold py-2 rounded-lg hover:bg-emerald-100 transition-all flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> View 3D Model
                    </button>
                    <button onClick={() => showToast(`Opening analytics for ${project.name} 📊`)} className="text-xs bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-1">
                      <BarChart3 className="w-3 h-3" /> Analytics
                    </button>
                    <button onClick={() => showToast(`${project.alerts} alerts found for ${project.name} ⚠️`)} className="text-xs bg-amber-50 text-amber-700 font-semibold py-2 rounded-lg hover:bg-amber-100 transition-all flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Alert History
                    </button>
                    <button onClick={() => { const el = document.createElement('a'); el.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(`Project,${project.name}\nStrain,${project.metrics.strain}\nTemp,${project.metrics.temp}\nVibration,${project.metrics.vibration}\nTilt,${project.metrics.tilt}\nSensors,${project.sensors}\nAlerts,${project.alerts}`)); el.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_data.csv`); el.click(); showToast('Data exported as CSV! 📁'); }} className="text-xs bg-violet-50 text-violet-700 font-semibold py-2 rounded-lg hover:bg-violet-100 transition-all flex items-center justify-center gap-1">
                      <Server className="w-3 h-3" /> Export Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Sensor Types ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">IoT Sensor Network</h2>
          <p className="text-gray-500">Industrial-grade sensors for comprehensive structural monitoring</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SENSOR_TYPES.map(sensor => {
            const Icon = sensor.icon;
            return (
              <div key={sensor.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{sensor.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sensor.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sensor.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Capabilities</h2>
          <p className="text-gray-500">Everything you need for intelligent structural monitoring</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feat => {
            const Icon = feat.icon;
            const featTierIdx = TIER_ORDER.indexOf(feat.tier);
            const canUse = userTierIdx >= featTierIdx;
            return (
              <div key={feat.title} className={`rounded-2xl border p-5 transition-all ${canUse ? 'bg-white hover:shadow-md hover:border-emerald-200' : 'bg-gray-50 opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canUse ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${canUse ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-gray-900">{feat.title}</h3>
                      {!canUse && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How Digital Twin Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Create 3D Model', desc: 'Upload BIM files or let our team scan your structure with LiDAR/drones', icon: '🏗️' },
            { step: '2', title: 'Install Sensors', desc: 'Deploy IoT sensors at critical structural points — strain, temp, vibration, tilt', icon: '📡' },
            { step: '3', title: 'Live Monitoring', desc: 'Data streams in real-time to your 3D model with color-coded health indicators', icon: '📊' },
            { step: '4', title: 'AI Predictions', desc: 'AI analyzes trends and predicts failures, cracks, and maintenance needs', icon: '🤖' },
          ].map(s => (
            <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold mx-auto mb-2">{s.step}</div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white">
          <Globe className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold mb-2">Ready to Monitor Your Structure?</h2>
          <p className="text-emerald-100 text-sm mb-5 max-w-xl mx-auto">
            Connect your construction project to our Digital Twin platform. Get real-time insights, predictive alerts, and AI-powered structural analysis.
          </p>
          <button onClick={() => showToast('New project setup wizard coming soon! 🏗️')} className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all">
            Add New Project
          </button>
        </div>
      </section>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce text-sm font-semibold">{toast}</div>}
    </div>
  );
}
