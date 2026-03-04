'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Package, Truck, CheckCircle2, MapPin, Phone, Clock, ArrowLeft, IndianRupee, Star, Camera, Calendar } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const steps = [
    { label: 'Order Placed', time: '02 Mar, 8:30 AM', done: true },
    { label: 'Confirmed', time: '02 Mar, 8:45 AM', done: true },
    { label: 'Picked Up', time: '02 Mar, 10:15 AM', done: true },
    { label: 'In Transit', time: '02 Mar, 10:30 AM', done: true },
    { label: 'Delivered', time: '02 Mar, 12:00 PM', done: true },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/orders" className="text-gray-500 hover:text-orange-600"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold text-gray-900">Order {orderId}</h1>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Delivered</span>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Delivery Tracking</h2>
            <div className="relative">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    {i < steps.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${step.done ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                  </div>
                  <div className="pb-2">
                    <p className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-sm text-gray-500">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Items */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {[
                  { name: 'UltraTech Cement PPC (50kg)', qty: 10, price: 385, image: '🏗️' },
                  { name: 'JSW TMT Steel Bar 8mm', qty: 1, price: 58000, image: '🔩' },
                  { name: 'River Sand Fine Grade', qty: 3, price: 2800, image: '⏳' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1"><p className="font-medium text-gray-900 text-sm">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.qty}</p></div>
                    <span className="font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span>₹72,502</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">Construction Site, NH-63</p><p className="text-gray-500">Near Railway Station, Peddapalli, 505172</p></div></div>
                  <div className="flex items-start gap-3"><Truck className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">Delivered by Raju (TG-09-1234)</p><p className="text-gray-500">Mini Truck · 2 trips</p></div></div>
                  <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-900">Delivered on 02 Mar 2026</p><p className="text-gray-500">Morning slot (6 AM - 10 AM)</p></div></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Quality Verification</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Weight verified: 500kg cement ✓</span>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl">
                    <Camera className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Delivery photo uploaded ✓</span>
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Rate this Order</h3>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-8 h-8 text-gray-300 hover:text-orange-400 cursor-pointer transition-colors" />)}
                </div>
                <textarea placeholder="Share your experience..." rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900" />
                <button className="mt-3 bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all text-sm">Submit Review</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
