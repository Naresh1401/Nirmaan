'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SuppliersRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    city: 'Peddapalli',
    address: '',
    gstNumber: '',
    categories: [] as string[],
  });

  const categories = ['Cement', 'Steel', 'Sand & Aggregates', 'Bricks', 'Tiles', 'Electrical', 'Plumbing', 'Paint', 'Hardware'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (cat: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(cat)
        ? formData.categories.filter((c) => c !== cat)
        : [...formData.categories, cat],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Become a Nirmaan Supplier</h1>
          <p className="text-gray-500 mt-2">Reach thousands of buyers across Telangana. Zero listing fees!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input name="businessName" value={formData.businessName} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Your shop name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                <input name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Full name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                  <option>Peddapalli</option>
                  <option>Karimnagar</option>
                  <option>Ramagundam</option>
                  <option>Warangal</option>
                  <option>Hyderabad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Full shop address" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
              <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="22AAAAA0000A1Z5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      formData.categories.includes(cat)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert('Application submitted! Our team will review and contact you within 24 hours.')}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition mt-4"
            >
              Submit Application
            </button>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Why sell on Nirmaan?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Zero listing fees — pay only 2% commission on orders</li>
              <li>✅ Reach 1,800+ active buyers in Telangana</li>
              <li>✅ Delivery logistics handled by our partners</li>
              <li>✅ Weekly payments directly to your bank account</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already a supplier?{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
