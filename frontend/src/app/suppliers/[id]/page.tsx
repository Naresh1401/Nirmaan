'use client';

import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { Star, MapPin, Truck, Package, CheckCircle2, Phone, Clock, ArrowLeft, Shield, Factory, IndianRupee } from 'lucide-react';

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const products = [
    { name: 'UltraTech Cement PPC (50kg)', price: 385, mrp: 420, stock: 250, rating: 4.5, image: '🏗️' },
    { name: 'ACC Cement OPC 53 (50kg)', price: 375, mrp: 410, stock: 180, rating: 4.3, image: '🏗️' },
    { name: 'JSW TMT Steel Bar 8mm', price: 58000, mrp: 63000, stock: 45, rating: 4.7, image: '🔩' },
    { name: 'River Sand Fine Grade', price: 2800, mrp: 3200, stock: 500, rating: 4.2, image: '⏳' },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <Link href="/suppliers" className="text-blue-200 hover:text-white flex items-center gap-1 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> All Suppliers</Link>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">🏪</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Peddapalli Traders</h1>
                  <CheckCircle2 className="w-6 h-6 text-green-300" />
                </div>
                <div className="flex items-center gap-4 text-blue-100 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Peddapalli, Telangana</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> 4.5 (128 reviews)</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Since 2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Products', value: '45', icon: Package },
              { label: 'Orders Completed', value: '890', icon: CheckCircle2 },
              { label: 'Delivery', value: 'Same Day', icon: Truck },
              { label: 'Rating', value: '4.5/5', icon: Star },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="bg-blue-50 rounded-lg p-2"><s.icon className="w-5 h-5 text-blue-600" /></div>
                <div><p className="font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Products from this Supplier</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {products.map((p, i) => (
              <Link key={i} href={`/products/${i + 1}`} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl">{p.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-extrabold text-gray-900">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-orange-400 text-orange-400" /> {p.rating}</span>
                    <span>{p.stock} in stock</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
