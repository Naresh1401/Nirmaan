'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Package, IndianRupee, Truck, Star, TrendingUp, Clock, CheckCircle2, AlertCircle, Plus, Eye, Edit, BarChart3, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Revenue', value: '₹4,25,000', change: '+12%', icon: IndianRupee, color: 'bg-green-50 text-green-600' },
  { label: 'Active Orders', value: '23', change: '+5', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
  { label: 'Products Listed', value: '45', change: '+3', icon: Package, color: 'bg-purple-50 text-purple-600' },
  { label: 'Customer Rating', value: '4.5', change: '+0.2', icon: Star, color: 'bg-orange-50 text-orange-600' },
];

const recentOrders = [
  { id: 'NRM-2026-A3X7K', customer: 'Rajesh K.', items: 'Cement x10, Sand x3', total: 12250, status: 'pending', time: '10 min ago' },
  { id: 'NRM-2026-B8Y2M', customer: 'Suresh R.', items: 'Steel 8mm x1 ton', total: 58000, status: 'confirmed', time: '25 min ago' },
  { id: 'NRM-2026-C4Z1N', customer: 'Priya Builders', items: 'Bricks x5000', total: 32500, status: 'in_transit', time: '1 hour ago' },
  { id: 'NRM-2026-D9W5P', customer: 'Vijay M.', items: 'Cement x50', total: 19250, status: 'delivered', time: '2 hours ago' },
];

const inventory = [
  { name: 'UltraTech Cement PPC (50kg)', stock: 250, price: 385, status: 'in_stock' },
  { name: 'ACC Cement OPC 53 (50kg)', stock: 15, price: 375, status: 'low_stock' },
  { name: 'JSW TMT Steel Bar 8mm', stock: 45, price: 58000, status: 'in_stock' },
  { name: 'River Sand Fine Grade', stock: 0, price: 2800, status: 'out_of_stock' },
  { name: 'Red Clay Bricks (1st Class)', stock: 50, price: 6500, status: 'in_stock' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  in_stock: 'bg-green-100 text-green-700',
  low_stock: 'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

export default function SupplierDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">Supplier Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.full_name || 'Supplier'}!</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${s.color} rounded-xl p-2.5`}><s.icon className="w-5 h-5" /></div>
                  <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">{s.change}</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Recent Orders</h2>
                <Link href="/orders" className="text-blue-600 text-sm font-semibold hover:text-blue-700">View All →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <div key={o.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{o.id}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{o.customer} · {o.items}</p>
                    </div>
                    <div className="text-right"><p className="font-bold text-gray-900">₹{o.total.toLocaleString('en-IN')}</p><p className="text-xs text-gray-400">{o.time}</p></div>
                    {o.status === 'pending' && (
                      <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Accept</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Inventory</h2>
                <button className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Product</button>
              </div>
              <div className="divide-y divide-gray-50">
                {inventory.map((item, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
                          {item.stock === 0 ? 'Out of stock' : item.stock < 20 ? `Low: ${item.stock}` : `${item.stock} units`}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6 mb-8">
            <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Revenue Trend (Last 7 Days)</h2>
            <div className="flex items-end gap-3 h-48">
              {[45000, 62000, 38000, 75000, 52000, 68000, 85000].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">₹{(v / 1000).toFixed(0)}k</span>
                  <div className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors" style={{ height: `${(v / 85000) * 100}%` }}></div>
                  <span className="text-xs text-gray-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
