'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeliveryRegisterPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', vehicleType: 'pickup', city: 'Peddapalli', license: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🚚 Deliver with Nirmaan</h1>
          <p className="text-gray-500 mt-2">Earn ₹25,000-45,000/month delivering construction materials</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="pickup">Pickup Truck (Tata Ace / Bolero)</option>
              <option value="mini_truck">Mini Truck (Eicher 10ft)</option>
              <option value="truck">Full Truck</option>
              <option value="auto">Auto Trolley</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Peddapalli</option>
              <option>Karimnagar</option>
              <option>Ramagundam</option>
              <option>Warangal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driving License Number</label>
            <input value={formData.license} onChange={(e) => setFormData({ ...formData, license: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="TS12 20XX XXXXXXX" />
          </div>

          <button onClick={() => alert('Application submitted! We will contact you within 48 hours.')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-2">
            Apply Now
          </button>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 text-sm mb-2">Delivery Partner Benefits</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>💰 Earn ₹150-500 per delivery</li>
            <li>📅 Flexible hours — choose your schedule</li>
            <li>🔒 Fuel allowance included</li>
            <li>💳 Daily payouts to your bank</li>
          </ul>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Already registered? Login</Link>
        </p>
      </div>
    </div>
  );
}
