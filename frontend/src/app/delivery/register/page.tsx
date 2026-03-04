'use client';

import AuthGuard from '@/components/AuthGuard';
import { Truck, MapPin, IndianRupee, Clock, ShieldCheck, CheckCircle2, Phone, User, FileText } from 'lucide-react';
import { useState } from 'react';

export default function DeliveryRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '',
    vehicleType: 'mini_truck', vehicleNumber: '', licenseNumber: '',
    experience: '', aadhar: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">We'll review your application and contact you within 48 hours.</p>
          <div className="bg-blue-50 rounded-xl p-4 text-left text-sm">
            <p className="font-semibold text-blue-700 mb-1">What's next?</p>
            <ul className="text-blue-600 space-y-1">
              <li>• Document verification (24-48 hours)</li>
              <li>• Vehicle inspection scheduled</li>
              <li>• Onboarding training call</li>
              <li>• Start earning with first delivery!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Truck className="w-12 h-12 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Become a Nirmaan Delivery Partner</h1>
            <p className="text-cyan-100 text-lg">Earn ₹25,000 - ₹60,000/month delivering construction materials</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6">
          {/* Benefits */}
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: IndianRupee, label: 'Earn ₹25K+/mo', desc: 'Guaranteed minimum earnings' },
              { icon: Clock, label: 'Flexible Hours', desc: 'Work when you want' },
              { icon: ShieldCheck, label: 'Insurance Cover', desc: 'Free accident insurance' },
              { icon: MapPin, label: 'Local Routes', desc: 'Deliver in your city' },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <b.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="font-bold text-gray-900 text-sm">{b.label}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Registration Form</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                <select value={form.city} onChange={e => set('city', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select city</option>
                  {['Hyderabad', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Delhi NCR', 'Kolkata', 'Ahmedabad'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type *</label>
                <select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="mini_truck">Mini Truck (Tata Ace / Bolero)</option>
                  <option value="pickup">Pickup (Mahindra / Ashok Leyland Dost)</option>
                  <option value="truck10">10-wheeler Truck</option>
                  <option value="tractor">Tractor Trolley</option>
                  <option value="three_wheeler">3-Wheeler (Auto / E-Rickshaw)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Number *</label>
                <input type="text" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)} placeholder="TS 09 AB 1234"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Driving License Number *</label>
                <input type="text" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="DL number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhar Number *</label>
                <input type="text" value={form.aadhar} onChange={e => set('aadhar', e.target.value)} placeholder="1234 5678 9012"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Driving Experience</label>
                <input type="number" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <button onClick={() => setSubmitted(true)}
              className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-lg">
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
