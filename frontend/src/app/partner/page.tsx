'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, Building2, Truck } from 'lucide-react';

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Partner with Nirmaan</h1>
          <p className="text-blue-200 text-lg">
            Whether you&apos;re a supplier, transporter, or someone who wants to work with us —
            here&apos;s how we can work together.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* For Suppliers */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">For Material Suppliers</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            If you sell cement, steel, sand, bricks, tiles, paint, or other building materials
            in Telangana, you can list your products on Nirmaan. Contractors and builders in
            your area will be able to see your prices and order directly.
          </p>
          <div className="text-sm text-gray-600 space-y-2 mb-5">
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> No listing fees while we&apos;re growing — we take a small commission (2-5%) only on completed orders</p>
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> You set your own prices. We don&apos;t interfere with your rates</p>
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Payment settled to your account within T+1 day</p>
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Need GST registration to get listed</p>
          </div>
          <Link href="/suppliers/register" className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-orange-600 transition-colors">
            Register as a Supplier <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* For Delivery Partners */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">For Delivery Partners</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            If you own a truck, pickup, or mini truck and want to earn by delivering construction
            materials, register as a delivery partner. We&apos;ll assign trips in your area based on
            your vehicle type and availability.
          </p>
          <div className="text-sm text-gray-600 space-y-2 mb-5">
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Paid per trip — amount depends on distance and load</p>
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Choose your own hours. No minimum commitment</p>
            <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Need a valid driving license and vehicle registration</p>
          </div>
          <Link href="/delivery/register" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Register as Delivery Partner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Other partnerships */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Something Else?</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            If you have a different kind of partnership in mind — maybe you&apos;re a real estate developer
            who wants bulk procurement, or a fintech company interested in construction credit, or
            anyone else who thinks we could work together — drop us an email. We&apos;re open to conversations.
          </p>
          <a href="mailto:partnerships@nirmaan.co" className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:text-orange-700">
            <Mail className="w-4 h-4" /> partnerships@nirmaan.co
          </a>
        </div>
      </div>
    </div>
  );
}
