'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { IndianRupee, CreditCard, ShieldCheck, Building2, CheckCircle2, ArrowRight, FileText, Phone, Star, TrendingUp, Zap, Clock, Truck, Package, Users, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const buyerTiers = [
  {
    name: 'Starter',
    tagline: 'Build your trust',
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    icon: Zap,
    eligibility: '3-5 completed orders, min ₹25,000 total spend',
    creditLimit: 'Up to ₹50,000',
    repayment: '15 days interest-free',
    perks: [
      'Buy now, pay within 15 days — zero interest',
      'Use credit at checkout instantly',
      'Builds your Nirmaan credit score for higher tiers',
    ],
  },
  {
    name: 'Growth',
    tagline: 'For regular buyers',
    color: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    icon: TrendingUp,
    eligibility: '10+ orders, min ₹1,00,000 total spend, clean repayment history',
    creditLimit: '₹50,000 – ₹2,00,000',
    repayment: '30 days interest-free',
    perks: [
      '30-day interest-free window on every purchase',
      'Higher credit limit for bulk orders',
      'Priority order processing — your orders get confirmed faster',
      'Dedicated account manager on WhatsApp',
    ],
  },
  {
    name: 'Bulk Buyer',
    tagline: 'For large projects',
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: Building2,
    eligibility: '25+ orders, min ₹5,00,000 total spend, zero overdue payments',
    creditLimit: '₹2,00,000 – ₹10,00,000',
    repayment: '45 days interest-free',
    perks: [
      '45-day interest-free credit — longest window',
      'Custom pricing on high-volume orders',
      'Priority delivery slots and dedicated logistics',
      'Quarterly business review with the Nirmaan team',
      'Invoice-based ordering — no upfront payment needed',
    ],
  },
];

export default function CreditPage() {
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [activeTab, setActiveTab] = useState<'buyers' | 'suppliers'>('buyers');
  const [formData, setFormData] = useState({ businessName: '', turnover: '', tier: '', reason: '' });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 py-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <CreditCard className="w-4 h-4" /> Nirmaan Business Credit
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Buy Materials Now. Pay Later.</h1>
            <p className="text-emerald-100 max-w-xl mx-auto">
              Interest-free credit for builders who buy from Nirmaan. Start small, build trust, unlock higher limits. No collateral, no paperwork hassle.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6">
          {/* Tab Switch */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-1.5 flex mb-6">
            <button onClick={() => setActiveTab('buyers')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'buyers' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              <Package className="w-4 h-4" /> For Buyers
            </button>
            <button onClick={() => setActiveTab('suppliers')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'suppliers' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              <Truck className="w-4 h-4" /> For Suppliers
            </button>
          </div>

          {/* ====== BUYER SECTION (PRIMARY) ====== */}
          {activeTab === 'buyers' && (
            <>
              {/* How it works */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="font-bold text-lg text-gray-900 mb-1">How Buyer Credit Works</h2>
                <p className="text-gray-500 text-sm mb-5">The more you buy, the more you unlock. Start with a few orders and grow your credit line.</p>
                <div className="grid sm:grid-cols-4 gap-4">
                  {[
                    { step: '1', title: 'Place Orders', desc: 'Buy construction materials from Nirmaan as you normally would.' },
                    { step: '2', title: 'Build History', desc: 'Complete 3-5 orders (min ₹25k spend) to qualify for Starter credit.' },
                    { step: '3', title: 'Get Approved', desc: 'Once eligible, apply and get approved — usually within 24 hours.' },
                    { step: '4', title: 'Buy on Credit', desc: 'Use your credit line at checkout. Pay later within the interest-free window.' },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">{s.step}</div>
                      <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Tiers */}
              <h2 className="font-bold text-lg text-gray-900 mb-4">Credit Tiers</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {buyerTiers.map((tier, i) => {
                  const Icon = tier.icon;
                  return (
                    <div key={i} className={`bg-white rounded-2xl border ${tier.border} shadow-sm overflow-hidden flex flex-col`}>
                      <div className={`bg-gradient-to-r ${tier.color} p-4 text-white`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5" />
                          <h3 className="font-bold text-lg">{tier.name}</h3>
                        </div>
                        <p className="text-white/80 text-xs">{tier.tagline}</p>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Eligibility</p>
                            <p className="text-sm text-gray-700 font-medium">{tier.eligibility}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Credit Limit</p>
                            <p className="text-lg font-extrabold text-gray-900">{tier.creditLimit}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Repayment</p>
                            <p className="text-sm text-gray-700 font-medium">{tier.repayment}</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-auto">
                          <p className="text-xs font-semibold text-gray-900 mb-2">What you get:</p>
                          <ul className="space-y-1.5">
                            {tier.perks.map((p, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Apply Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
                {!applied ? (
                  <>
                    <h2 className="font-bold text-lg text-gray-900 mb-1">Apply for Buyer Credit</h2>
                    <p className="text-gray-500 text-sm mb-5">
                      Already placed a few orders? Apply below. We&apos;ll check your purchase history and get back within 1-2 business days.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Business / Firm Name</label>
                        <input type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} placeholder="e.g. Rajesh Constructions" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900" />
                      </div>
                      <div>
                        <label htmlFor="credit-turnover" className="block text-sm font-semibold text-gray-700 mb-1">Monthly Material Spend (approx)</label>
                        <select id="credit-turnover" value={formData.turnover} onChange={e => setFormData({ ...formData, turnover: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900">
                          <option value="">Select range</option>
                          <option>Below ₹50,000</option>
                          <option>₹50,000 – ₹2,00,000</option>
                          <option>₹2,00,000 – ₹10,00,000</option>
                          <option>Above ₹10,00,000</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="credit-tier" className="block text-sm font-semibold text-gray-700 mb-1">Which tier are you applying for?</label>
                        <select id="credit-tier" value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900">
                          <option value="">Select tier</option>
                          <option>Starter (3-5 orders, ₹25k+ spend)</option>
                          <option>Growth (10+ orders, ₹1L+ spend)</option>
                          <option>Bulk Buyer (25+ orders, ₹5L+ spend)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Brief note (optional)</label>
                        <input type="text" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Running a 3-floor residential project" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900" />
                      </div>
                    </div>
                    <button onClick={() => setApplied(true)} className="mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                      Apply for Credit <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted</h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                      We&apos;ll review your purchase history and get back within 1-2 business days via phone or SMS.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-yellow-600">Under Review</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Applied on</span><span className="font-medium text-gray-700">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                    </div>
                    <Link href="/products" className="inline-block mt-5 text-emerald-600 font-semibold text-sm hover:underline">Continue Shopping →</Link>
                  </div>
                )}
              </div>

              {/* FAQ for buyers */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Common Questions — Buyer Credit</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">I&apos;ve only placed 1-2 orders. Can I still apply?</p>
                    <p className="text-gray-500 mt-1">Not yet. You need at least 3 completed orders with a minimum total spend of ₹25,000 to qualify for Starter. Keep ordering and you&apos;ll get there. Quality of repayment matters more than speed.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">What happens if I miss a payment?</p>
                    <p className="text-gray-500 mt-1">Late fees apply (1.5% per month on overdue amount). Repeated late payments can lead to credit limit reduction or account suspension. We send reminders via SMS before the due date.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Can I upgrade from Starter to Growth?</p>
                    <p className="text-gray-500 mt-1">Yes. Once you meet the eligibility criteria for the next tier (more orders, higher spend, clean repayment), you can request an upgrade. We review upgrades weekly.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Is there any interest?</p>
                    <p className="text-gray-500 mt-1">Zero interest within the repayment window (15/30/45 days depending on your tier). After that, 1.5% per month applies on the outstanding balance.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ====== SUPPLIER SECTION (SECONDARY) ====== */}
          {activeTab === 'suppliers' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">Supplier Payment Terms</h2>
                    <p className="text-gray-500 text-sm">How and when you get paid for selling on Nirmaan</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  When a customer places an order for your materials, Nirmaan handles the payment collection. You get paid based on the settlement cycle agreed at the time of onboarding. We offer flexible payment windows depending on order volume and your relationship with us.
                </p>

                {/* Payment tiers */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-blue-900 text-sm">Standard</h3>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-700 mb-1">24-48 hrs</p>
                    <p className="text-xs text-blue-600">After delivery is confirmed and materials verified at site.</p>
                    <p className="text-[11px] text-blue-400 mt-2">Default for all new suppliers</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-indigo-900 text-sm">Weekly Settlement</h3>
                    </div>
                    <p className="text-2xl font-extrabold text-indigo-700 mb-1">7 days</p>
                    <p className="text-xs text-indigo-600">Batch settlement every week for suppliers with 10+ orders/month.</p>
                    <p className="text-[11px] text-indigo-400 mt-2">Reduces transaction overhead</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-purple-900 text-sm">Extended (by agreement)</h3>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-700 mb-1">Up to 45 days</p>
                    <p className="text-xs text-purple-600">For high-volume suppliers with formal agreements and higher margins.</p>
                    <p className="text-[11px] text-purple-400 mt-2">Case-by-case negotiation</p>
                  </div>
                </div>

                {/* How supplier payments work */}
                <h3 className="font-bold text-gray-900 mb-3">How Supplier Payments Work</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { step: '1', title: 'Customer places order', desc: 'Nirmaan collects payment (or extends credit) from the buyer.' },
                    { step: '2', title: 'You dispatch materials', desc: 'Ship the order to the customer\'s site. Our delivery team or yours — depends on arrangement.' },
                    { step: '3', title: 'Delivery confirmed', desc: 'Customer confirms receipt. Weight and quality are verified.' },
                    { step: '4', title: 'You get paid', desc: 'Payment hits your bank account within the agreed settlement window (24 hrs – 45 days).' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">{s.step}</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Supplier benefits */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-3">Why Suppliers Choose Nirmaan</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      'No chasing payments — we handle buyer collections',
                      'Transparent settlement — see every order and payout',
                      'Access to a wider customer base across Telangana',
                      'No listing fees — you only pay a small commission on sales',
                      'Flexible settlement — choose what works for your cash flow',
                      'Dedicated supplier support on WhatsApp',
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ for suppliers */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Common Questions — Supplier Payments</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">What if a buyer pays via credit (not upfront)?</p>
                    <p className="text-gray-500 mt-1">Doesn&apos;t affect you. Nirmaan takes the credit risk. You get paid within your normal settlement window regardless of how the buyer paid.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Can I request faster payouts?</p>
                    <p className="text-gray-500 mt-1">Yes, 24-48 hour payouts are the default for new suppliers. If you&apos;re on weekly or extended terms and need faster access, talk to your account manager.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">What&apos;s the commission structure?</p>
                    <p className="text-gray-500 mt-1">Discussed during onboarding. It varies by material category and volume. No hidden charges — you&apos;ll know exactly what you earn per order.</p>
                  </div>
                </div>
              </div>

              {/* CTA for suppliers */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">Want to sell on Nirmaan?</h3>
                <p className="text-gray-500 text-sm mb-4">Register as a supplier and start receiving orders from builders in your area.</p>
                <Link href="/suppliers/register" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
                  Register as Supplier <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}

          {/* Contact */}
          <div className="text-center text-sm text-gray-500 mb-8">
            Questions? Call us at <a href="tel:+918555501401" className="text-emerald-600 font-semibold">+91 85555 01401</a> or email <a href="mailto:hello@nirmaan.co" className="text-emerald-600 font-semibold">hello@nirmaan.co</a>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
