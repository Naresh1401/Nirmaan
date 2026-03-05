'use client';

import { Building2, Users, Truck, Target, Lightbulb, Shield, TrendingUp, Globe, Award, Zap, Heart, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const team = [
  { name: 'Naresh', role: 'Founder & CEO', desc: 'From Peddapalli. Started Nirmaan after seeing how hard it was for local builders to get fair prices on materials.' },
  { name: 'Charan', role: 'Technology', desc: 'Handles the tech side — built the platform, manages the backend, and keeps things running.' },
  { name: 'Venkatesh', role: 'Operations', desc: 'Manages supplier relationships, delivery coordination, and makes sure orders actually reach sites on time.' },
];

const milestones = [
  { year: '2024', event: 'Nirmaan started in Peddapalli', desc: 'Began talking to local contractors and suppliers to understand the real problems' },
  { year: '2024 Q2', event: 'First version launched', desc: 'Built the marketplace and onboarded initial suppliers from Peddapalli and Karimnagar' },
  { year: '2024 Q3', event: 'Business credit pilot', desc: 'Started testing credit facility for trusted repeat buyers' },
  { year: '2024 Q4', event: 'Material estimator added', desc: 'Launched a tool to help builders estimate material quantities for their projects' },
  { year: '2025', event: 'Expanded to more towns', desc: 'Added suppliers from Warangal, Ramagundam, and Nizamabad' },
  { year: '2025 Q3', event: 'OTP login & delivery tracking', desc: 'Launched passwordless OTP login, real-time delivery tracking, and chatbot assistant' },
  { year: '2026', event: 'Admin Dashboard 2.0 with 2FA & RBAC', desc: 'Production-grade admin panel with role-based access, two-factor auth, analytics, and AI-powered predictions' },
];

const stats = [
  { value: '500+', label: 'Registered Users' },
  { value: '80+', label: 'Verified Suppliers' },
  { value: '₹35L+', label: 'Materials Ordered' },
  { value: '8', label: 'Districts' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">About Nirmaan</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We started Nirmaan because buying construction materials in smaller towns shouldn't mean
            calling 10 suppliers, comparing rates on paper, and hoping deliveries show up on time.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
            <Target className="w-10 h-10 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What We're Trying to Do</h2>
            <p className="text-gray-600 leading-relaxed">
              Make it easier for contractors, builders, and homeowners to buy construction materials at fair prices
              from verified local suppliers — with proper billing, transparent pricing, and delivery you can actually track.
              We're starting in Telangana and figuring things out one district at a time.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <Lightbulb className="w-10 h-10 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Where We Want to Go</h2>
            <p className="text-gray-600 leading-relaxed">
              We want Nirmaan to be the go-to way builders in Telangana order materials — where
              you can compare rates, place an order, and know exactly when it'll arrive at your site.
              Eventually, we'd like to cover more states, but right now we're focused on getting things right locally.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Problems We See Every Day</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Unclear Pricing', desc: 'Rates change daily and every dealer quotes differently. Hard to know if you\'re getting a fair deal.' },
              { icon: Shield, title: 'Quality Concerns', desc: 'No easy way to verify material quality until it arrives at your site. Returns are a headache.' },
              { icon: Truck, title: 'Delivery Issues', desc: 'You order and then keep calling to ask "where is my truck?" — no tracking, no updates.' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p.icon className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What We Do About It</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
              { icon: Globe, title: 'Transparent Rates', desc: 'See prices from multiple suppliers in your area — all in one place, updated regularly.' },
              { icon: Award, title: 'Supplier Verification', desc: 'We check GST, visit the supplier, and look at reviews before listing them.' },
              { icon: Zap, title: 'Delivery Tracking', desc: 'GPS tracking for trucks. You get updates when material is picked up and when it\'s arriving.' },
              ].map((s, i) => (
                <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <s.icon className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-full bg-orange-200 mt-1" />}
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex-1 mb-2">
                  <p className="text-xs font-bold text-orange-500 mb-1">{m.year}</p>
                  <h3 className="font-bold text-gray-900">{m.event}</h3>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">{t.name[0]}</div>
                <h3 className="font-bold text-gray-900">{t.name}</h3>
                <p className="text-sm text-orange-500 font-semibold">{t.role}</p>
                <p className="text-sm text-gray-500 mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Want to Try Nirmaan?</h2>
          <p className="text-white/80 mb-8">Sign up and see what materials are available near you</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2">Sign Up Now <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/suppliers/register" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all">Become a Supplier</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
