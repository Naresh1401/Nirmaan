'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { IndianRupee, TrendingUp, Clock, CheckCircle2, AlertCircle, CreditCard, FileText, ChevronRight, ShieldCheck, Building2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';

const creditInfo = {
  limit: 500000,
  used: 185000,
  available: 315000,
  status: 'active',
  nextDue: '28 Jan 2024',
  dueAmount: 45000,
  interestRate: '1.5%',
  tenure: '45 days',
};

const transactions = [
  { id: 'TXN-001', type: 'purchase', description: 'UltraTech Cement x50 bags', amount: 19250, date: '15 Jan 2024', status: 'pending', orderId: 'NRM-2026-A3X7K' },
  { id: 'TXN-002', type: 'payment', description: 'Credit repayment', amount: 45000, date: '12 Jan 2024', status: 'completed', orderId: null },
  { id: 'TXN-003', type: 'purchase', description: 'JSW TMT Steel 8mm x1 ton', amount: 58000, date: '10 Jan 2024', status: 'completed', orderId: 'NRM-2026-B8Y2M' },
  { id: 'TXN-004', type: 'purchase', description: 'Red Bricks x5000', amount: 32500, date: '8 Jan 2024', status: 'completed', orderId: 'NRM-2026-C4Z1N' },
  { id: 'TXN-005', type: 'payment', description: 'Credit repayment', amount: 75000, date: '5 Jan 2024', status: 'completed', orderId: null },
  { id: 'TXN-006', type: 'purchase', description: 'River Sand 20 tons', amount: 56000, date: '2 Jan 2024', status: 'completed', orderId: 'NRM-2026-D9W5P' },
];

const paymentSchedule = [
  { dueDate: '28 Jan 2024', amount: 45000, status: 'upcoming', details: 'Purchases from 1-15 Jan' },
  { dueDate: '12 Feb 2024', amount: 58000, status: 'upcoming', details: 'Purchases from 16-31 Jan' },
  { dueDate: '28 Feb 2024', amount: 0, status: 'future', details: 'Purchases from 1-15 Feb' },
];

export default function CreditPage() {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const usedPct = (creditInfo.used / creditInfo.limit) * 100;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-7 h-7 text-white" />
              <h1 className="text-2xl font-bold text-white">Business Credit</h1>
            </div>
            <p className="text-emerald-100">Buy now, pay later — up to 45 days interest-free credit for your construction business</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-6">
          {/* Credit Overview Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Credit Limit</p>
                    <p className="text-3xl font-extrabold text-gray-900">₹{(creditInfo.limit / 100000).toFixed(1)}L</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {creditInfo.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Used: <strong className="text-gray-900">₹{(creditInfo.used / 1000).toFixed(0)}k</strong></span>
                    <span className="text-gray-500">Available: <strong className="text-green-600">₹{(creditInfo.available / 1000).toFixed(0)}k</strong></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${usedPct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Interest Rate</p>
                    <p className="font-bold text-gray-900">{creditInfo.interestRate}/mo</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Credit Period</p>
                    <p className="font-bold text-gray-900">{creditInfo.tenure}</p>
                  </div>
                </div>
              </div>

              <div className="border-l border-gray-100 pl-6">
                <h3 className="font-bold text-gray-900 mb-3">Next Payment Due</h3>
                <div className="bg-orange-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-orange-700">₹{creditInfo.dueAmount.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-orange-600">Due by {creditInfo.nextDue}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Pay Now
                </button>
                <button onClick={() => setShowApply(!showApply)} className="w-full mt-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold py-3 rounded-xl transition-all">
                  Request Limit Increase
                </button>
              </div>
            </div>
          </div>

          {showApply && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Request Credit Limit Increase</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Requested Limit (₹)</label>
                  <input type="number" placeholder="e.g. 750000" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Turnover (Annual)</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                    <option>Below ₹25 Lakhs</option>
                    <option>₹25L - ₹1 Crore</option>
                    <option>₹1 Cr - ₹5 Crore</option>
                    <option>Above ₹5 Crore</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Increase</label>
                  <textarea rows={3} placeholder="Describe your business requirement..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all">Submit Request</button>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Transaction History */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Transaction History</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {transactions.map(t => (
                  <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className={`rounded-xl p-2.5 ${t.type === 'purchase' ? 'bg-red-50' : 'bg-green-50'}`}>
                      {t.type === 'purchase' ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.date} {t.orderId && `· ${t.orderId}`}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === 'purchase' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                      </p>
                      <span className={`text-xs font-semibold ${t.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Payment Schedule</h3>
              </div>
              <div className="p-4 space-y-3">
                {paymentSchedule.map((p, i) => (
                  <div key={i} className={`rounded-xl p-4 ${p.status === 'upcoming' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-900 text-sm">{p.dueDate}</p>
                      {p.status === 'upcoming' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Due</span>}
                    </div>
                    <p className="text-lg font-extrabold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">{p.details}</p>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="p-4 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 mb-3">Why Business Credit?</h4>
                <div className="space-y-2">
                  {[
                    'Up to 45 days interest-free',
                    'No collateral required',
                    'Instant approval for orders',
                    'Build business credit score',
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{b}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
