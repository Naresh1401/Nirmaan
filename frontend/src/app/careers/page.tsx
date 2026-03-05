'use client';

import Link from 'next/link';
import { MapPin, Clock, Briefcase, ArrowRight, Mail } from 'lucide-react';

const openings = [
  {
    slug: 'gen-ai-intern',
    title: 'Gen AI Intern',
    location: 'Remote',
    type: 'Internship (3-6 months)',
    posted: '3 days ago',
    desc: 'Help us explore and build AI-powered features for Nirmaan — chatbots, smart search, material estimation, and more. You should be comfortable with Python and have played around with LLMs or AI APIs. Paid internship, flexible hours.',
  },
  {
    slug: 'delivery-coordinator',
    title: 'Delivery Coordinator',
    location: 'Karimnagar / Peddapalli',
    type: 'Full-time',
    posted: '1 week ago',
    desc: 'Coordinate with delivery partners, track dispatches, handle delays or cancellations. This is a ground-level role — you\'ll sometimes need to visit sites. Need a bike and a working phone. Telugu + Hindi preferred.',
  },
  {
    slug: 'operations-executive',
    title: 'Operations Executive',
    location: 'Peddapalli',
    type: 'Full-time',
    posted: '2 weeks ago',
    desc: 'Handle day-to-day supplier coordination, manage delivery schedules, and resolve order issues. You\'ll be on calls with suppliers and drivers most of the day. Construction industry experience helps, but willingness to learn matters more.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Work with Us</h1>
          <p className="text-slate-300 text-lg">
            We&apos;re a small team based out of Peddapalli, trying to fix how construction materials
            are bought and sold in Telangana. If that sounds interesting, read on.
          </p>
        </div>
      </section>

      {/* What it's like */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What working here is like</h2>
        <div className="text-gray-600 space-y-4 leading-relaxed">
          <p>
            Honestly, it&apos;s early stage. We don&apos;t have fancy offices or free lunches.
            What we do have is a real problem to solve and the freedom to figure out how.
          </p>
          <p>
            You&apos;ll wear multiple hats. Some days you might be debugging code, other days
            you&apos;re on a call with a cement supplier trying to sort out a pricing issue.
            If you need clearly defined job descriptions and processes for everything,
            this probably isn&apos;t the right fit yet.
          </p>
          <p>
            But if you want to build something from scratch in a space that actually matters
            to people&apos;s livelihoods — contractors, small builders, local suppliers — we&apos;d
            love to talk.
          </p>
        </div>
      </section>

      {/* Open positions */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <Link key={i} href={`/careers/${job.slug}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                  <span className="text-xs text-gray-400">{job.posted}</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{job.desc}</p>
                <span className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  View Details & Apply <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply</h2>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <p className="text-gray-700 mb-4">
            No formal application form. Just send us an email with:
          </p>
          <ul className="text-gray-600 space-y-2 text-sm mb-4">
            <li>• Which role you&apos;re interested in</li>
            <li>• A bit about yourself — what you&apos;ve done, what you&apos;re good at</li>
            <li>• Why this sounds interesting to you (a line or two is fine)</li>
            <li>• Your resume if you have one (not mandatory)</li>
          </ul>
          <a href="mailto:careers@nirmaan.co" className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
            <Mail className="w-4 h-4" /> careers@nirmaan.co
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Don&apos;t see a role that fits? Email us anyway. We&apos;re always open to meeting good people.
        </p>
      </section>
    </div>
  );
}
