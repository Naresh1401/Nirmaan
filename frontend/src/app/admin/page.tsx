'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Users, Package, Truck, IndianRupee, TrendingUp, ShoppingCart, Star, AlertCircle, CheckCircle, Clock, XCircle, Building2, FileCheck, BarChart3, Eye, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

const overviewStats = [
  { label: 'Total Users', value: '2,847', change: '+128 this week', icon: Users, color: 'bg-blue-50 text-blue-600', chartColor: 'bg-blue-500' },
  { label: 'Total Revenue (GMV)', value: '₹1.24 Cr', change: '+18% vs last month', icon: IndianRupee, color: 'bg-green-50 text-green-600', chartColor: 'bg-green-500' },
  { label: 'Active Orders', value: '342', change: '+45 today', icon: ShoppingCart, color: 'bg-purple-50 text-purple-600', chartColor: 'bg-purple-500' },
  { label: 'Active Suppliers', value: '156', change: '+12 this month', icon: Building2, color: 'bg-orange-50 text-orange-600', chartColor: 'bg-orange-500' },
];

const userRegistrations = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', city: 'Hyderabad', role: 'customer', joined: '2024-01-15', orders: 12, totalSpent: '₹1,45,000', status: 'active' },
  { id: 2, name: 'Priya Constructions', email: 'priya@builders.com', phone: '+91 87654 32109', city: 'Mumbai', role: 'customer', joined: '2024-01-14', orders: 34, totalSpent: '₹8,52,000', status: 'active' },
  { id: 3, name: 'Suresh Materials Hub', email: 'suresh@hub.com', phone: '+91 76543 21098', city: 'Bangalore', role: 'supplier', joined: '2024-01-13', orders: 0, totalSpent: '₹0', status: 'pending' },
  { id: 4, name: 'Vijay M.', email: 'vijay@email.com', phone: '+91 65432 10987', city: 'Chennai', role: 'customer', joined: '2024-01-12', orders: 3, totalSpent: '₹42,000', status: 'active' },
  { id: 5, name: 'Anil D.', email: 'anil@email.com', phone: '+91 54321 09876', city: 'Hyderabad', role: 'delivery_partner', joined: '2024-01-11', orders: 0, totalSpent: '₹0', status: 'active' },
  { id: 6, name: 'Karthik Builders', email: 'karthik@build.com', phone: '+91 43210 98765', city: 'Pune', role: 'customer', joined: '2024-01-10', orders: 7, totalSpent: '₹2,15,000', status: 'inactive' },
];

const pendingSuppliers = [
  { id: 1, name: 'Metro Building Supplies', gst: '36AABCU9603R1ZM', city: 'Hyderabad', category: 'Cement, Steel', appliedOn: '2024-01-14', contact: '+91 98123 45678' },
  { id: 2, name: 'Coastal Aggregates Ltd', gst: '32AADFC0142R1Z5', city: 'Kochi', category: 'Sand, Gravel', appliedOn: '2024-01-13', contact: '+91 97234 56789' },
  { id: 3, name: 'Deccan TMT Steel', gst: '36AABCF5768H1ZP', city: 'Vijayawada', category: 'Steel, Iron', appliedOn: '2024-01-12', contact: '+91 96345 67890' },
];

const recentOrders = [
  { id: 'NRM-2026-A3X7K', customer: 'Rajesh K.', supplier: 'Sri Cement World', amount: 12250, status: 'confirmed', paymentMode: 'COD', date: '15 Jan 2024' },
  { id: 'NRM-2026-B8Y2M', customer: 'Priya Constructions', supplier: 'JSW Steel Mart', amount: 58000, status: 'in_transit', paymentMode: 'Online', date: '15 Jan 2024' },
  { id: 'NRM-2026-C4Z1N', customer: 'Vijay M.', supplier: 'Bhavani Bricks', amount: 32500, status: 'delivered', paymentMode: 'Credit', date: '14 Jan 2024' },
  { id: 'NRM-2026-D9W5P', customer: 'Karthik Builders', supplier: 'Sri Cement World', amount: 19250, status: 'pending', paymentMode: 'Online', date: '14 Jan 2024' },
  { id: 'NRM-2026-E2V8Q', customer: 'Suresh R.', supplier: 'Metro Sand Supply', amount: 8400, status: 'cancelled', paymentMode: 'COD', date: '13 Jan 2024' },
];

const creditAccounts = [
  { customer: 'Priya Constructions', limit: 500000, used: 320000, status: 'active', dueDate: '28 Jan 2024', paymentHistory: 'good' },
  { customer: 'Karthik Builders', limit: 300000, used: 285000, status: 'active', dueDate: '20 Jan 2024', paymentHistory: 'fair' },
  { customer: 'Rajesh Kumar', limit: 100000, used: 45000, status: 'active', dueDate: '15 Feb 2024', paymentHistory: 'excellent' },
];

const revenueData = [
  { month: 'Aug', val: 45 }, { month: 'Sep', val: 52 }, { month: 'Oct', val: 61 },
  { month: 'Nov', val: 78 }, { month: 'Dec', val: 95 }, { month: 'Jan', val: 124 },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

const roleColors: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700',
  supplier: 'bg-orange-100 text-orange-700',
  delivery_partner: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'users' | 'orders' | 'suppliers' | 'credit'>('overview');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'suppliers', label: 'Suppliers', icon: Building2 },
    { key: 'credit', label: 'Credit', icon: IndianRupee },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Monitor and manage the Nirmaan platform</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-200 shadow-sm mb-6 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {overviewStats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${s.color} rounded-xl p-2.5`}><s.icon className="w-5 h-5" /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{s.change}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Revenue Growth (₹ Lakhs)</h3>
                  <div className="flex items-end gap-4 h-52">
                    {revenueData.map(d => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 font-semibold">₹{d.val}L</span>
                        <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 transition-all" style={{ height: `${(d.val / 130) * 100}%` }} />
                        <span className="text-xs text-gray-400">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Order Status Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Delivered', count: 1842, pct: 54, color: 'bg-green-500' },
                      { label: 'In Transit', count: 342, pct: 10, color: 'bg-purple-500' },
                      { label: 'Confirmed', count: 512, pct: 15, color: 'bg-blue-500' },
                      { label: 'Pending', count: 389, pct: 11, color: 'bg-yellow-500' },
                      { label: 'Cancelled', count: 340, pct: 10, color: 'bg-red-500' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">{s.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-16 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Growth Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">User Growth Summary</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Customers', total: 2156, thisWeek: 98, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Suppliers', total: 156, thisWeek: 12, color: 'text-orange-600 bg-orange-50' },
                    { label: 'Delivery Partners', total: 535, thisWeek: 18, color: 'text-green-600 bg-green-50' },
                  ].map(g => (
                    <div key={g.label} className={`rounded-xl p-4 ${g.color}`}>
                      <p className="text-2xl font-extrabold">{g.total.toLocaleString()}</p>
                      <p className="font-semibold text-sm">{g.label}</p>
                      <p className="text-xs mt-1 opacity-75">+{g.thisWeek} this week</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Metrics */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Avg Order Value', value: '₹3,620', icon: TrendingUp },
                  { label: 'Delivery Success', value: '96.8%', icon: Truck },
                  { label: 'Quality Score', value: '4.6/5', icon: Star },
                  { label: 'Platform Revenue', value: '₹4.34L', icon: IndianRupee },
                ].map(m => (
                  <div key={m.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <m.icon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xl font-extrabold text-gray-900">{m.value}</p>
                    <p className="text-sm text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">All Registered Users</h3>
                <p className="text-sm text-gray-500">Complete user data collected through the platform</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="text-left px-4 py-3 font-semibold">User</th>
                    <th className="text-left px-4 py-3 font-semibold">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold">City</th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 font-semibold">Orders</th>
                    <th className="text-left px-4 py-3 font-semibold">Spent</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {userRegistrations.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-semibold text-gray-900 text-sm">{u.name}</p></td>
                        <td className="px-4 py-3"><p className="text-xs text-gray-500">{u.email}</p><p className="text-xs text-gray-400">{u.phone}</p></td>
                        <td className="px-4 py-3 text-sm text-gray-600">{u.city}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColors[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.orders}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.totalSpent}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[u.status]}`}>{u.status}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">All Orders</h3>
                <p className="text-sm text-gray-500">Monitor every order across the platform</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold">Customer</th>
                    <th className="text-left px-4 py-3 font-semibold">Supplier</th>
                    <th className="text-left px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Payment</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{o.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{o.customer}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{o.supplier}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{o.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{o.paymentMode}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[o.status]}`}>{o.status.replace('_', ' ')}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suppliers Tab */}
          {tab === 'suppliers' && (
            <div className="space-y-6 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-orange-500" /> Pending Supplier Verifications</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {pendingSuppliers.map(s => (
                    <div key={s.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">GST: {s.gst} · {s.city} · {s.category}</p>
                        <p className="text-xs text-gray-400">Applied: {s.appliedOn} · Contact: {s.contact}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Approve</button>
                        <button className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1"><UserX className="w-3.5 h-3.5" /> Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Credit Tab */}
          {tab === 'credit' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Business Credit Accounts</h3>
                <p className="text-sm text-gray-500">Monitor credit limits, usage, and repayment</p>
              </div>
              <div className="divide-y divide-gray-50">
                {creditAccounts.map((c, i) => (
                  <div key={i} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{c.customer}</p>
                        <p className="text-xs text-gray-500">Due: {c.dueDate} · Payment history: <span className={`font-semibold ${c.paymentHistory === 'excellent' ? 'text-green-600' : c.paymentHistory === 'good' ? 'text-blue-600' : 'text-yellow-600'}`}>{c.paymentHistory}</span></p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[c.status]}`}>{c.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full ${(c.used / c.limit) > 0.9 ? 'bg-red-500' : (c.used / c.limit) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(c.used / c.limit) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">₹{(c.used / 1000).toFixed(0)}k / ₹{(c.limit / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
