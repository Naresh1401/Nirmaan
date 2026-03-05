'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 border border-gray-100">
          <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent</h2>
          <p className="text-gray-500 text-sm">
            Thanks for reaching out. We&apos;ll get back to you within 1-2 business days.
            If it&apos;s urgent, just call us directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-slate-300 text-lg">
            Have a question, feedback, or issue with an order? We&apos;re here to help.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Contact Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">+91 85555 01401</p>
                  <p className="text-gray-500">Mon-Sat, 9 AM - 7 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">hello@nirmaan.co</p>
                  <p className="text-gray-500">We reply within 24 hours usually</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Peddapalli, Telangana</p>
                  <p className="text-gray-500">505172</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Working Hours</p>
                  <p className="text-gray-500">Mon-Sat: 9:00 AM - 7:00 PM</p>
                  <p className="text-gray-500">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <p className="font-medium text-gray-900 mb-1">For order issues</p>
            <p className="text-gray-500">
              If you have a problem with a specific order, go to
              your <a href="/orders" className="text-orange-600 underline">Orders page</a> first.
              You can track status and contact support from there directly.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Send us a Message</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Rajesh"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+91 ..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">What&apos;s this about?</label>
                <select value={form.subject} onChange={e => set('subject', e.target.value)}
                  title="Subject"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700">
                  <option value="">Pick a topic</option>
                  <option value="order">Order issue or question</option>
                  <option value="pricing">Pricing inquiry</option>
                  <option value="supplier">I want to list as a supplier</option>
                  <option value="delivery">Delivery problem</option>
                  <option value="credit">Business credit question</option>
                  <option value="feedback">General feedback</option>
                  <option value="other">Something else</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder="Tell us what you need help with..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none" />
              </div>
            </div>
            <button onClick={() => setSubmitted(true)}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
