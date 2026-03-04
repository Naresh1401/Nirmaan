'use client';

import { Building2, Users, Truck, Target, Lightbulb, Shield, TrendingUp, Globe, Award, Zap, Heart, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const team = [
  { name: 'Naresh', role: 'Founder & CEO', desc: 'Passionate about transforming India\'s construction supply chain through technology' },
  { name: 'Technology Team', role: 'Engineering', desc: 'Building the future of construction procurement with AI and data' },
  { name: 'Operations Team', role: 'Logistics', desc: 'Ensuring quality delivery across every construction site' },
];

const milestones = [
  { year: '2024', event: 'Nirmaan founded in Hyderabad', desc: 'Started with a vision to digitize construction material procurement' },
  { year: '2024 Q2', event: 'Platform launch', desc: 'Launched marketplace with 50+ suppliers across Telangana' },
  { year: '2024 Q3', event: 'Business credit launch', desc: 'Introduced 45-day interest-free credit for verified businesses' },
  { year: '2024 Q4', event: 'AI Estimator launch', desc: 'AI-powered material estimation for construction projects' },
  { year: '2025', event: 'Multi-city expansion', desc: 'Expanding to Mumbai, Bangalore, Chennai, Pune' },
];

const stats = [
  { value: '2,800+', label: 'Registered Users' },
  { value: '150+', label: 'Verified Suppliers' },
  { value: '₹1.2 Cr+', label: 'Materials Delivered' },
  { value: '8', label: 'Cities' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" /> Building India's Future
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">About Nirmaan</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We're on a mission to transform India's ₹12 lakh crore construction materials industry
            by connecting builders directly with verified suppliers through technology.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To make construction material procurement transparent, affordable, and efficient for every builder,
              contractor, and homeowner in India. We believe everyone deserves fair prices, quality materials,
              and reliable delivery — whether you're building a home or a skyscraper.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <Lightbulb className="w-10 h-10 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become India's largest construction materials marketplace — the "Amazon for Construction" —
              where every construction site can source verified, quality materials at the best prices
              with next-day delivery, powered by AI and a network of trusted suppliers.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">The Problem We're Solving</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Price Opacity', desc: 'Buyers never know the real market price. Middlemen add 15-30% margins without adding value.' },
              { icon: Shield, title: 'Quality Uncertainty', desc: 'No standardized quality checks. Builders receive substandard materials without recourse.' },
              { icon: Truck, title: 'Delivery Chaos', desc: 'Unreliable delivery with no tracking. Materials arrive late, wrong, or damaged.' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p.icon className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How Nirmaan Solves It</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Globe, title: 'Price Transparency', desc: 'Real-time market prices, supplier comparison, and price history — no hidden costs.' },
                { icon: Award, title: 'Quality Verified', desc: 'Every supplier verified with GST. Weight verification, delivery photos, and quality ratings.' },
                { icon: Zap, title: 'Reliable Delivery', desc: 'GPS-tracked delivery with time slots. Same-day and next-day delivery options.' },
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
          <h2 className="text-3xl font-bold text-white mb-3">Join the Nirmaan Revolution</h2>
          <p className="text-white/80 mb-8">Be part of India's construction materials transformation</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2">Sign Up Now <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/suppliers/register" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all">Become a Supplier</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
