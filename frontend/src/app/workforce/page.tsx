'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Users, MapPin, Star, Clock, Shield, Search, Filter,
  Phone, ChevronRight, Crown, Wrench, Zap, CheckCircle2,
  HardHat, TrendingUp, Lock,
} from 'lucide-react';

const WORKER_TYPES = [
  { id: 'all', label: 'All Workers' },
  { id: 'mason', label: '🧱 Masons' },
  { id: 'electrician', label: '⚡ Electricians' },
  { id: 'plumber', label: '🔧 Plumbers' },
  { id: 'carpenter', label: '🪚 Carpenters' },
  { id: 'welder', label: '🔥 Welders' },
  { id: 'painter', label: '🎨 Painters' },
  { id: 'tile_worker', label: '🔲 Tile Workers' },
  { id: 'equipment_operator', label: '🚜 Equipment Operators' },
];

const WORKERS = [
  {
    id: '1',
    name: 'Ramaiah B.',
    type: 'mason',
    label: 'Senior Mason',
    location: 'Karimnagar',
    experience: '12 years',
    rating: 4.8,
    reviews: 64,
    rate: '₹800/day',
    available: true,
    verified: true,
    skills: ['RCC Work', 'Brickwork', 'Plastering', 'Tiling'],
    completedJobs: 180,
  },
  {
    id: '2',
    name: 'Suresh K.',
    type: 'electrician',
    label: 'Licensed Electrician',
    location: 'Warangal',
    experience: '8 years',
    rating: 4.9,
    reviews: 91,
    rate: '₹900/day',
    available: true,
    verified: true,
    skills: ['House Wiring', '3-Phase', 'Panel Work', 'Solar'],
    completedJobs: 220,
  },
  {
    id: '3',
    name: 'Anand P.',
    type: 'plumber',
    label: 'Plumbing Contractor',
    location: 'Peddapalli',
    experience: '10 years',
    rating: 4.7,
    reviews: 53,
    rate: '₹850/day',
    available: false,
    verified: true,
    skills: ['Water Supply', 'Drainage', 'Sanitary', 'CPVC Fitting'],
    completedJobs: 142,
  },
  {
    id: '4',
    name: 'Vikram T.',
    type: 'carpenter',
    label: 'Furniture & Formwork',
    location: 'Ramagundam',
    experience: '15 years',
    rating: 4.6,
    reviews: 78,
    rate: '₹950/day',
    available: true,
    verified: true,
    skills: ['Shuttering', 'Furniture', 'Doors & Windows', 'Woodwork'],
    completedJobs: 195,
  },
  {
    id: '5',
    name: 'Mahesh G.',
    type: 'welder',
    label: 'Structural Welder',
    location: 'Hyderabad',
    experience: '9 years',
    rating: 4.5,
    reviews: 39,
    rate: '₹1,000/day',
    available: true,
    verified: false,
    skills: ['MIG Welding', 'TIG Welding', 'Steel Fabrication', 'Pipe Welding'],
    completedJobs: 88,
  },
  {
    id: '6',
    name: 'Priya S.',
    type: 'painter',
    label: 'Interior & Exterior Painter',
    location: 'Nizamabad',
    experience: '7 years',
    rating: 4.8,
    reviews: 112,
    rate: '₹700/day',
    available: true,
    verified: true,
    skills: ['Emulsion Paint', 'Texture Work', 'Waterproofing', 'Wallpaper'],
    completedJobs: 260,
  },
  {
    id: '7',
    name: 'Ravi N.',
    type: 'tile_worker',
    label: 'Tile & Marble Expert',
    location: 'Karimnagar',
    experience: '11 years',
    rating: 4.9,
    reviews: 147,
    rate: '₹850/day',
    available: true,
    verified: true,
    skills: ['Floor Tiles', 'Wall Tiles', 'Marble', 'Granite Cutting'],
    completedJobs: 320,
  },
  {
    id: '8',
    name: 'Shankar M.',
    type: 'equipment_operator',
    label: 'JCB & Excavator Operator',
    location: 'Warangal',
    experience: '6 years',
    rating: 4.6,
    reviews: 29,
    rate: '₹1,200/day',
    available: false,
    verified: true,
    skills: ['JCB Backhoe', 'Excavator', 'Bulldozer', 'Compactor'],
    completedJobs: 75,
  },
];

export default function WorkforcePage() {
  const { isAuthenticated } = useAuth();
  const [activeType, setActiveType] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = WORKERS.filter(w => {
    const matchType = activeType === 'all' || w.type === activeType;
    const matchSearch = !searchQ || w.name.toLowerCase().includes(searchQ.toLowerCase()) || w.label.toLowerCase().includes(searchQ.toLowerCase()) || w.location.toLowerCase().includes(searchQ.toLowerCase());
    const matchAvailable = !showAvailableOnly || w.available;
    return matchType && matchSearch && matchAvailable;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <HardHat className="w-8 h-8 text-emerald-200" />
            <h1 className="text-3xl font-extrabold">Hire Construction Workers</h1>
          </div>
          <p className="text-emerald-100 mb-6 max-w-2xl">Find verified, rated construction workers near your site. Masons, electricians, plumbers, carpenters and more.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1 max-w-md">
              <Search className="w-5 h-5 text-emerald-200" />
              <input
                type="text"
                placeholder="Search by skill, name, location..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent outline-none text-white placeholder-emerald-200 flex-1 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={e => setShowAvailableOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-white text-sm font-medium">Available now</span>
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Verified Workers', value: '5,200+', icon: Shield, color: 'text-emerald-600' },
            { label: 'Avg. Rating', value: '4.7 ★', icon: Star, color: 'text-amber-500' },
            { label: 'Jobs Completed', value: '18,000+', icon: CheckCircle2, color: 'text-blue-600' },
            { label: 'Districts Covered', value: '15', icon: MapPin, color: 'text-orange-600' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {WORKER_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeType === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Worker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(worker => (
            <div key={worker.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {worker.name[0]}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${worker.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {worker.available ? '● Available' : '○ Busy'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">{worker.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{worker.label}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{worker.rating}</span>
                  <span className="text-xs text-gray-400">({worker.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {worker.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock className="w-3.5 h-3.5" /> {worker.experience} exp • {worker.completedJobs} jobs
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {worker.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {worker.skills.length > 3 && (
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{worker.skills.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-700">{worker.rate}</span>
                  {worker.verified && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <Shield className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
              </div>
              {isAuthenticated ? (
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm transition-all flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Hire Now
                </button>
              ) : (
                <Link href="/login" className="w-full bg-gray-100 text-gray-500 py-3 text-sm text-center font-semibold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Login to Hire
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white text-center">
          <HardHat className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold mb-2">Are You a Construction Worker?</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">Join Nirmaan's workforce network. Get verified, build your profile, and get hired for jobs near you.</p>
          <Link href={isAuthenticated ? '#register-worker' : '/register'} className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all inline-block">
            Register as Worker
          </Link>
        </div>
      </div>
    </div>
  );
}
