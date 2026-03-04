'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Phone, Lock, Eye, EyeOff, ArrowRight, User, Mail, MapPin, ChevronDown } from 'lucide-react';

const roles = [
  { value: 'customer', label: 'Home Builder / Contractor', desc: 'Buy construction materials' },
  { value: 'supplier', label: 'Material Supplier', desc: 'Sell materials on Nirmaan' },
  { value: 'delivery_partner', label: 'Delivery Partner', desc: 'Deliver materials & earn' },
];

const cities = ['Peddapalli', 'Karimnagar', 'Ramagundam', 'Warangal', 'Hyderabad', 'Nizamabad', 'Mancherial', 'Adilabad'];

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', confirmPassword: '', role: 'customer', city: 'Peddapalli', state: 'Telangana' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  if (isAuthenticated) { router.push('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ full_name: form.full_name, phone: form.phone, email: form.email || undefined, password: form.password, role: form.role, city: form.city, state: form.state });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <Building2 className="w-10 h-10 text-white" />
            <span className="text-3xl font-extrabold text-white">Nirmaan</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Join India&apos;s Largest<br />Construction Marketplace</h1>
          <p className="text-orange-100 text-lg max-w-md">Create your free account and start ordering construction materials at the best prices with doorstep delivery.</p>
        </div>
        <div className="relative space-y-4 text-white/80 text-sm">
          <p>✓ Compare prices from 500+ suppliers</p>
          <p>✓ Track deliveries in real-time</p>
          <p>✓ Get business credit up to ₹5L</p>
          <p>✓ AI-powered material estimation</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Building2 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-extrabold text-gray-900">Nirmaan</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">{step === 1 ? 'Create Account' : 'Set Password'}</h2>
          <p className="text-gray-500 mb-8">{step === 1 ? 'Tell us about yourself' : 'Secure your account'}</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
                  <div className="space-y-2">
                    {roles.map(r => (
                      <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.role === r.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={e => setForm({ ...form, role: e.target.value })} className="text-orange-500 focus:ring-orange-500" />
                        <div><p className="font-semibold text-gray-900 text-sm">{r.label}</p><p className="text-gray-500 text-xs">{r.desc}</p></div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Enter your full name" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email (optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none text-gray-900">
                      {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900" required />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all">Back</button>
              )}
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{step === 1 ? 'Continue' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">Already have an account? <Link href="/login" className="text-orange-600 font-semibold hover:text-orange-700">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
