'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Star, MapPin, Search, ChevronRight, Factory, Shield, Truck, Package, CheckCircle2, Phone, Clock } from 'lucide-react';
import { useState } from 'react';

const suppliers = [
  { id: 's1', name: 'Peddapalli Traders', city: 'Peddapalli', rating: 4.5, reviews: 128, products: 45, orders: 890, verified: true, categories: ['Cement', 'Sand', 'Steel'], since: '2020', delivery: 'Same Day', image: '🏪' },
  { id: 's2', name: 'Sri Ganesh Hardware', city: 'Peddapalli', rating: 4.3, reviews: 67, products: 32, orders: 450, verified: true, categories: ['Cement', 'Bricks', 'Tiles'], since: '2018', delivery: 'Same Day', image: '🏬' },
  { id: 's3', name: 'Karimnagar Building Materials', city: 'Karimnagar', rating: 4.6, reviews: 203, products: 78, orders: 1200, verified: true, categories: ['All Materials'], since: '2015', delivery: 'Next Day', image: '🏗️' },
  { id: 's4', name: 'Sri Steel Works', city: 'Peddapalli', rating: 4.7, reviews: 89, products: 25, orders: 670, verified: true, categories: ['Steel', 'TMT Bars'], since: '2019', delivery: 'Same Day', image: '🔩' },
  { id: 's5', name: 'Godavari Sand Depot', city: 'Ramagundam', rating: 4.3, reviews: 234, products: 8, orders: 2100, verified: true, categories: ['Sand', 'Gravel'], since: '2017', delivery: 'Same Day', image: '⏳' },
  { id: 's6', name: 'Kalyan Brick Works', city: 'Peddapalli', rating: 4.6, reviews: 167, products: 12, orders: 980, verified: true, categories: ['Bricks', 'Blocks'], since: '2016', delivery: 'Same Day', image: '🧱' },
  { id: 's7', name: 'Tile Palace', city: 'Karimnagar', rating: 4.5, reviews: 203, products: 150, orders: 560, verified: false, categories: ['Tiles', 'Sanitaryware'], since: '2021', delivery: '2-3 Days', image: '🔲' },
  { id: 's8', name: 'Color World Paints', city: 'Warangal', rating: 4.4, reviews: 145, products: 95, orders: 340, verified: true, categories: ['Paint', 'Primers'], since: '2020', delivery: 'Next Day', image: '🎨' },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const filtered = suppliers.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (cityFilter && s.city !== cityFilter) return false;
    return true;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Verified Suppliers</h1>
            <p className="text-blue-100 mb-6">Discover trusted construction material suppliers near you</p>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="flex-1 outline-none text-gray-700" />
              </div>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="bg-white rounded-xl px-4 py-3 text-gray-700 outline-none">
                <option value="">All Cities</option>
                <option>Peddapalli</option><option>Karimnagar</option><option>Ramagundam</option><option>Warangal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 mb-4">{filtered.length} suppliers found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(s => (
              <Link key={s.id} href={`/suppliers/${s.id}`} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all overflow-hidden group">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl">{s.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{s.name}</h3>
                        {s.verified && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                      <span className="text-sm font-bold text-green-700">{s.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">({s.reviews} reviews)</span>
                    <span className="text-xs text-gray-400">Since {s.since}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.categories.map(c => <span key={c} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{c}</span>)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold text-gray-900">{s.products}</p><p className="text-gray-500">Products</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold text-gray-900">{s.orders}</p><p className="text-gray-500">Orders</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold text-gray-900">{s.delivery}</p><p className="text-gray-500">Delivery</p></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
