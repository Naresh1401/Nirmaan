'use client';

import { useState } from 'react';
import Link from 'next/link';

type UserType = 'buyer' | 'supplier';

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('buyer');
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: 'Peddapalli',
    businessName: '',
    gstNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🏗️ Nirmaan</h1>
          <p className="text-gray-500 mt-1">Join the #1 Construction Marketplace</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-1 rounded-full ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">I want to register as</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setUserType('buyer')}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  userType === 'buyer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">🏠</div>
                <div className="font-semibold text-gray-900">Buyer</div>
                <p className="text-xs text-gray-500 mt-1">Buy construction materials</p>
              </button>
              <button
                onClick={() => setUserType('supplier')}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  userType === 'supplier' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">🏪</div>
                <div className="font-semibold text-gray-900">Supplier</div>
                <p className="text-xs text-gray-500 mt-1">Sell materials on Nirmaan</p>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                  <option>Peddapalli</option>
                  <option>Karimnagar</option>
                  <option>Ramagundam</option>
                  <option>Warangal</option>
                  <option>Hyderabad</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.name || phone.length !== 10}
              className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {userType === 'supplier' ? 'Business Details' : 'Additional Details'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
              {userType === 'supplier' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Your shop/business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                    <input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
              >
                Verify Phone
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Verify Phone</h2>
            <p className="text-gray-500 text-sm mb-6">OTP sent to +91 {phone}</p>

            <div className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500 outline-none"
              />

              <button
                onClick={() => {
                  alert('Account created successfully! (Demo)');
                  window.location.href = '/';
                }}
                disabled={otp.length !== 6}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Account
              </button>

              <button className="w-full text-orange-600 text-sm font-medium hover:underline">
                Resend OTP
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
