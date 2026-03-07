'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building2, MapPin, IndianRupee, Calendar, Users, ChevronRight,
  Plus, Filter, Search, Star, Clock, Shield, TrendingUp, ArrowRight,
  Crown, Lock, Briefcase, Zap, CheckCircle2,
} from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'all', label: 'All Projects' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'government', label: 'Government' },
];

const SAMPLE_PROJECTS = [
  {
    id: '1',
    title: 'G+3 Residential Apartment Complex',
    type: 'residential',
    location: 'Karimnagar, Telangana',
    budget: '₹2.5 Cr – ₹3 Cr',
    area: '12,000 sqft',
    timeline: '18 months',
    bids: 7,
    status: 'Open',
    postedBy: 'Naresh Reddy',
    description: 'Construction of a G+3 apartment with 12 units. Foundation work completed. Seeking general contractor for superstructure.',
    tags: ['RCC Frame', 'Apartment', 'Superstructure'],
    verified: true,
    postedDays: 3,
  },
  {
    id: '2',
    title: 'State Highway Road Widening — 8km',
    type: 'infrastructure',
    location: 'Peddapalli to Mancherial, Telangana',
    budget: '₹18 Cr – ₹22 Cr',
    area: '8 km',
    timeline: '24 months',
    bids: 12,
    status: 'Open',
    postedBy: 'TSSPDCL Roads Division',
    description: 'Widening of existing 2-lane highway to 4-lane, including drainage, road safety, and junction improvements.',
    tags: ['Road', 'Highway', 'Government'],
    verified: true,
    postedDays: 7,
  },
  {
    id: '3',
    title: 'Commercial Shopping Complex — Ground Floor',
    type: 'commercial',
    location: 'Warangal, Telangana',
    budget: '₹80L – ₹1.2 Cr',
    area: '4,500 sqft',
    timeline: '8 months',
    bids: 4,
    status: 'Open',
    postedBy: 'Suresh Enterprises',
    description: 'Construction of a ground-floor commercial complex with 12 shops and basement parking.',
    tags: ['Commercial', 'Shopping', 'Parking'],
    verified: false,
    postedDays: 1,
  },
  {
    id: '4',
    title: 'Water Treatment Plant — 5 MLD',
    type: 'infrastructure',
    location: 'Ramagundam, Telangana',
    budget: '₹4.5 Cr – ₹6 Cr',
    area: '2 acres',
    timeline: '30 months',
    bids: 9,
    status: 'Open',
    postedBy: 'HMWS&SB',
    description: 'Design-build contract for a 5 MLD water treatment plant with sedimentation tanks, filters, and pump house.',
    tags: ['Water', 'Treatment', 'Municipal'],
    verified: true,
    postedDays: 14,
  },
  {
    id: '5',
    title: 'Individual House Construction — 1800 sqft',
    type: 'residential',
    location: 'Nizamabad, Telangana',
    budget: '₹35L – ₹45L',
    area: '1,800 sqft',
    timeline: '10 months',
    bids: 15,
    status: 'Open',
    postedBy: 'Venkatesh P.',
    description: 'Fully furnished individual house on 150 sq yd plot. G+1, 3 BHK. Owner has approved drawings from DTCP.',
    tags: ['Residential', 'Individual', 'G+1'],
    verified: false,
    postedDays: 2,
  },
  {
    id: '6',
    title: 'Railway Over Bridge (ROB) — 45m Span',
    type: 'infrastructure',
    location: 'Secunderabad, Telangana',
    budget: '₹12 Cr – ₹15 Cr',
    area: '45m span',
    timeline: '36 months',
    bids: 5,
    status: 'Open',
    postedBy: 'South Central Railway (SCR)',
    description: 'Construction of a railway over bridge (ROB) replacing a level crossing. PSC girder design. Government tender.',
    tags: ['Bridge', 'Railway', 'PSC Girder'],
    verified: true,
    postedDays: 21,
  },
];

const typeColors: Record<string, string> = {
  residential: 'bg-green-100 text-green-700',
  commercial: 'bg-blue-100 text-blue-700',
  infrastructure: 'bg-orange-100 text-orange-700',
  industrial: 'bg-purple-100 text-purple-700',
  government: 'bg-red-100 text-red-700',
};

export default function ProjectsPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeType, setActiveType] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const isPremium = user?.membership_tier && user.membership_tier !== 'free';

  const filtered = SAMPLE_PROJECTS.filter(p => {
    const matchType = activeType === 'all' || p.type === activeType;
    const q = searchQ.toLowerCase();
    const matchSearch = !searchQ
      || p.title.toLowerCase().includes(q)
      || p.location.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-200" />
            <h1 className="text-3xl font-extrabold">Infrastructure Project Marketplace</h1>
          </div>
          <p className="text-blue-100 mb-6 max-w-2xl">Post large projects, receive contractor bids, AI cost estimates, and milestone-based payments.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1 max-w-md">
              <Search className="w-5 h-5 text-blue-200" />
              <input
                type="text"
                placeholder="Search projects by name, location..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent outline-none text-white placeholder-blue-200 flex-1 text-sm"
              />
            </div>
            {isAuthenticated && (
              <button className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm">
                <Plus className="w-4 h-4" /> Post Your Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Gate */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-violet-600" />
              <div>
                <p className="font-bold text-gray-900">Premium Feature</p>
                <p className="text-sm text-gray-500">Login to bid on projects. Premium members get priority bid placement.</p>
              </div>
            </div>
            <Link href="/login" className="bg-violet-600 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-violet-700 transition-all">Login / Sign Up</Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          {PROJECT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeType === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: '128', icon: Briefcase, color: 'text-blue-600' },
            { label: 'Total Value', value: '₹850 Cr+', icon: IndianRupee, color: 'text-green-600' },
            { label: 'Registered Contractors', value: '2,400+', icon: Users, color: 'text-orange-600' },
            { label: 'Avg. Bids / Project', value: '8.3', icon: TrendingUp, color: 'text-violet-600' },
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

        {/* Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(project => (
            <div key={project.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[project.type] || 'bg-gray-100 text-gray-700'}`}>
                        {project.type}
                      </span>
                      {project.verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{project.postedDays}d ago</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{project.title}</h3>
                  </div>
                  <span className="ml-3 flex-shrink-0 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{project.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <span>{project.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{project.area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{project.timeline}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span><strong className="text-gray-900">{project.bids}</strong> bids</span>
                    <span className="text-gray-300">•</span>
                    <span>by {project.postedBy}</span>
                  </div>
                  {isAuthenticated ? (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
                      Place Bid <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link href="/login" className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
                      <Lock className="w-4 h-4" /> Login to Bid
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to post project */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <Building2 className="w-12 h-12 text-blue-200 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold mb-2">Have a Construction Project?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">Post your project for free. Get contractor bids, AI cost estimation, and milestone-based payment protection.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={isAuthenticated ? '#post' : '/register'} className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all">
              Post a Project
            </Link>
            <Link href="/premium" className="bg-blue-500/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500/60 transition-all flex items-center gap-2 justify-center">
              <Crown className="w-4 h-4" /> Go Premium
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
