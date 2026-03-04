'use client';

import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { Building2, MapPin, Phone, FileText, CheckCircle2, ArrowRight, Upload, ArrowLeft } from 'lucide-react';

export default function SupplierRegisterPage() {
  const [form, setForm] = useState({ business_name: '', gst_number: '', pan_number: '', description: '', address: '', city: 'Peddapalli', state: 'Telangana', pincode: '', delivery_radius_km: '10' });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-12 max-w-lg text-center shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-500 mb-6">Our team will review your application and verify your documents. You&apos;ll receive a notification once approved.</p>
            <Link href="/" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600">Go to Homepage</Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10">
          <div className="max-w-3xl mx-auto px-4">
            <Link href="/" className="text-blue-200 hover:text-white flex items-center gap-1 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <h1 className="text-3xl font-bold text-white mb-2">Become a Supplier</h1>
            <p className="text-blue-100">Join 500+ suppliers on Nirmaan and grow your business</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Business Name *</label>
                <input type="text" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="e.g., Sri Ganesh Hardware & Building Materials" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">GST Number</label>
                  <input type="text" value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value })} placeholder="36XXXXX1234Z1Z5" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">PAN Number</label>
                  <input type="text" value={form.pan_number} onChange={e => setForm({ ...form, pan_number: e.target.value })} placeholder="ABCDE1234F" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Business Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Tell us about your business, materials you sell..." className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Shop/Warehouse Address *</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Full address" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">City</label>
                  <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                    <option>Peddapalli</option><option>Karimnagar</option><option>Ramagundam</option><option>Warangal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Pincode</label>
                  <input type="text" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="505172" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Delivery Radius (km)</label>
                  <input type="number" value={form.delivery_radius_km} onChange={e => setForm({ ...form, delivery_radius_km: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
                Submit Application <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
