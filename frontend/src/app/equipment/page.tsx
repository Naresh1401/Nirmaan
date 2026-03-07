'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Truck, MapPin, Star, Clock, Shield, Search, ChevronRight,
  Calendar, IndianRupee, CheckCircle2, Lock, Crown, Users,
  TrendingUp, Wrench, Zap,
} from 'lucide-react';

const EQUIPMENT_TYPES = [
  { id: 'all', label: 'All Equipment' },
  { id: 'excavator', label: '⛏️ Excavators' },
  { id: 'crane', label: '🏗️ Cranes' },
  { id: 'concrete', label: '🔄 Concrete Mixers' },
  { id: 'compactor', label: '🚜 Compactors' },
  { id: 'drill', label: '🪛 Drilling Rigs' },
  { id: 'scaffolding', label: '🪜 Scaffolding' },
  { id: 'loader', label: '🚧 Loaders' },
];

const EQUIPMENT = [
  {
    id: '1',
    name: 'JCB 3DX Backhoe Loader',
    type: 'excavator',
    owner: 'Ravi Machinery',
    location: 'Karimnagar',
    ratePerHour: 1800,
    ratePerDay: 12000,
    available: true,
    rating: 4.7,
    reviews: 43,
    operatorIncluded: true,
    deliveryAvailable: true,
    specs: ['25 HP engine', '0.21m³ bucket', 'Max depth 4.5m'],
    image: '⛏️',
  },
  {
    id: '2',
    name: '20T Hydraulic Crane',
    type: 'crane',
    owner: 'Telangana Crane Services',
    location: 'Warangal',
    ratePerHour: 3500,
    ratePerDay: 22000,
    available: true,
    rating: 4.8,
    reviews: 28,
    operatorIncluded: true,
    deliveryAvailable: true,
    specs: ['20 ton capacity', '30m boom length', 'Hydraulic controls'],
    image: '🏗️',
  },
  {
    id: '3',
    name: 'Transit Concrete Mixer — 6m³',
    type: 'concrete',
    owner: 'Suresh Ready Mix',
    location: 'Peddapalli',
    ratePerHour: 800,
    ratePerDay: 5500,
    available: true,
    rating: 4.5,
    reviews: 67,
    operatorIncluded: true,
    deliveryAvailable: true,
    specs: ['6m³ drum', 'Water tank included', 'Self-loading'],
    image: '🔄',
  },
  {
    id: '4',
    name: 'Soil Compactor (Vibratory Roller)',
    type: 'compactor',
    owner: 'NMS Equipments',
    location: 'Ramagundam',
    ratePerHour: 1200,
    ratePerDay: 8000,
    available: false,
    rating: 4.4,
    reviews: 19,
    operatorIncluded: false,
    deliveryAvailable: true,
    specs: ['8T static weight', '1680mm drum width', 'Pad foot drum'],
    image: '🚜',
  },
  {
    id: '5',
    name: 'Rotary Drilling Rig — 400mm dia',
    type: 'drill',
    owner: 'Foundation Experts',
    location: 'Hyderabad',
    ratePerHour: 5000,
    ratePerDay: 35000,
    available: true,
    rating: 4.9,
    reviews: 14,
    operatorIncluded: true,
    deliveryAvailable: true,
    specs: ['400mm drill dia', '25m depth', 'Hydraulic torque head'],
    image: '🪛',
  },
  {
    id: '6',
    name: 'Modular Scaffolding System (500 sqft)',
    type: 'scaffolding',
    owner: 'Safe Build Systems',
    location: 'Nizamabad',
    ratePerHour: 0,
    ratePerDay: 2500,
    available: true,
    rating: 4.6,
    reviews: 88,
    operatorIncluded: false,
    deliveryAvailable: true,
    specs: ['Covers 500 sqft', 'Up to 12m height', 'Galvanized pipes'],
    image: '🪜',
  },
  {
    id: '7',
    name: 'Wheel Loader — 1.8m³ Bucket',
    type: 'loader',
    owner: 'Ravi Machinery',
    location: 'Karimnagar',
    ratePerHour: 1500,
    ratePerDay: 10000,
    available: true,
    rating: 4.5,
    reviews: 31,
    operatorIncluded: true,
    deliveryAvailable: false,
    specs: ['1.8m³ bucket', '3T lift capacity', 'AC cabin'],
    image: '🚧',
  },
  {
    id: '8',
    name: '5T Pick-and-Carry Crane',
    type: 'crane',
    owner: 'LiftRight Services',
    location: 'Warangal',
    ratePerHour: 1800,
    ratePerDay: 12500,
    available: true,
    rating: 4.7,
    reviews: 22,
    operatorIncluded: true,
    deliveryAvailable: true,
    specs: ['5T capacity', 'Telescopic boom', 'Can travel with load'],
    image: '🏗️',
  },
];

export default function EquipmentPage() {
  const { isAuthenticated } = useAuth();
  const [activeType, setActiveType] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [rateView, setRateView] = useState<'hour' | 'day'>('day');

  const filtered = EQUIPMENT.filter(e => {
    const matchType = activeType === 'all' || e.type === activeType;
    const matchSearch = !searchQ || e.name.toLowerCase().includes(searchQ.toLowerCase()) || e.location.toLowerCase().includes(searchQ.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-8 h-8 text-orange-200" />
            <h1 className="text-3xl font-extrabold">Equipment Rental Marketplace</h1>
          </div>
          <p className="text-orange-100 mb-6 max-w-2xl">Rent excavators, cranes, concrete mixers and more — by the hour or day. Operator available. Delivery to site.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1 max-w-md">
              <Search className="w-5 h-5 text-orange-200" />
              <input
                type="text"
                placeholder="Search equipment by name, location..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent outline-none text-white placeholder-orange-200 flex-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              <button
                onClick={() => setRateView('hour')}
                className={`px-4 py-2.5 text-sm font-semibold transition-all ${rateView === 'hour' ? 'bg-white text-orange-700' : 'text-white'}`}
              >
                Hourly
              </button>
              <button
                onClick={() => setRateView('day')}
                className={`px-4 py-2.5 text-sm font-semibold transition-all ${rateView === 'day' ? 'bg-white text-orange-700' : 'text-white'}`}
              >
                Daily
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Available Equipment', value: '350+', icon: Truck, color: 'text-orange-600' },
            { label: 'Equipment Owners', value: '85+', icon: Users, color: 'text-blue-600' },
            { label: 'Avg. Hourly Rate', value: '₹1,800', icon: IndianRupee, color: 'text-green-600' },
            { label: 'Delivery Districts', value: '12', icon: MapPin, color: 'text-violet-600' },
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
          {EQUIPMENT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeType === t.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Equipment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(eq => (
            <div key={eq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{eq.image}</div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${eq.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {eq.available ? '● Available' : '○ Rented'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{eq.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{eq.owner}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{eq.rating}</span>
                  <span className="text-xs text-gray-400">({eq.reviews} rentals)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> {eq.location}
                </div>
                <div className="space-y-1 mb-3">
                  {eq.specs.map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> {s}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {eq.operatorIncluded && (
                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Operator Included</span>
                  )}
                  {eq.deliveryAvailable && (
                    <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Delivery Available</span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    {rateView === 'hour' && eq.ratePerHour > 0 ? (
                      <>
                        <span className="text-xl font-extrabold text-orange-600">₹{eq.ratePerHour.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">/hour</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-extrabold text-orange-600">₹{eq.ratePerDay.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">/day</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isAuthenticated ? (
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 text-sm transition-all flex items-center justify-center gap-2" disabled={!eq.available}>
                  {eq.available ? (
                    <><Calendar className="w-4 h-4" /> Book Now</>
                  ) : 'Currently Rented'}
                </button>
              ) : (
                <Link href="/login" className="w-full bg-gray-100 text-gray-500 py-3 text-sm text-center font-semibold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Login to Book
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-3xl p-8 text-white text-center">
          <Truck className="w-12 h-12 text-orange-200 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold mb-2">Own Construction Equipment?</h2>
          <p className="text-orange-100 mb-6 max-w-lg mx-auto">List your equipment on Nirmaan and earn rental income. We handle bookings, payments, and delivery logistics.</p>
          <Link href={isAuthenticated ? '#list-equipment' : '/register'} className="bg-white text-orange-700 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all inline-block">
            List Your Equipment
          </Link>
        </div>
      </div>
    </div>
  );
}
