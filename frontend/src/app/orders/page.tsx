'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Package, Truck, Clock, CheckCircle2, MapPin, IndianRupee, ChevronRight, Filter, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

const orders = [
  { id: 'NRM-2026-A3X7K', date: '02 Mar 2026', status: 'delivered', items: 3, total: 72502, delivery: 'Delivered on 02 Mar', statusColor: 'bg-green-100 text-green-700', products: ['UltraTech Cement x10', 'JSW Steel 8mm x1', 'River Sand x3'] },
  { id: 'NRM-2026-B8Y2M', date: '28 Feb 2026', status: 'in_transit', items: 2, total: 15400, delivery: 'Expected today by 4 PM', statusColor: 'bg-blue-100 text-blue-700', products: ['Red Clay Bricks x2000', 'M-Sand x2'] },
  { id: 'NRM-2026-C4Z1N', date: '25 Feb 2026', status: 'confirmed', items: 5, total: 124500, delivery: 'Scheduled for 05 Mar', statusColor: 'bg-orange-100 text-orange-700', products: ['TATA TMT 12mm x2', 'Cement x50', 'Tiles x200sqft'] },
  { id: 'NRM-2026-D9W5P', date: '20 Feb 2026', status: 'delivered', items: 1, total: 42000, delivery: 'Delivered on 21 Feb', statusColor: 'bg-green-100 text-green-700', products: ['JSW TMT Steel Bar 12mm x1 ton'] },
  { id: 'NRM-2026-E2Q8R', date: '15 Feb 2026', status: 'cancelled', items: 2, total: 8500, delivery: 'Cancelled by customer', statusColor: 'bg-red-100 text-red-700', products: ['Asian Paints x3', 'CPVC Pipes x10'] },
];

const statusLabels: Record<string, string> = { delivered: 'Delivered', in_transit: 'In Transit', confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' };
const statusIcons: Record<string, any> = { delivered: CheckCircle2, in_transit: Truck, confirmed: Clock, pending: Package, cancelled: XCircle };

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <div className="flex items-center gap-2">
              {['all', 'in_transit', 'confirmed', 'delivered', 'cancelled'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'all' ? 'All' : statusLabels[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map(order => {
              const Icon = statusIcons[order.status] || Package;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.statusColor}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{order.date} · {order.items} items</p>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-lg text-gray-900 flex items-center"><IndianRupee className="w-4 h-4" />{order.total.toLocaleString('en-IN')}</div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-1" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.products.map((p, i) => (
                        <span key={i} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-lg">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.delivery}</span>
                    </div>
                  </div>
                  {order.status === 'in_transit' && (
                    <div className="bg-blue-50 px-5 py-3 flex items-center justify-between">
                      <span className="text-sm text-blue-700 font-medium flex items-center gap-2"><Truck className="w-4 h-4" /> Driver is on the way</span>
                      <span className="text-sm text-blue-600 font-semibold">Track Live →</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
