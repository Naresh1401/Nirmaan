'use client';

import { useState } from 'react';

const tabs = ['Overview', 'Users', 'Suppliers', 'Orders', 'Products', 'Reports'];

const stats = [
  { label: 'Total Revenue', value: '₹24,58,350', change: '+18.2% vs last month', icon: '💰' },
  { label: 'Active Users', value: '1,847', change: '+124 this week', icon: '👥' },
  { label: 'Total Orders', value: '3,429', change: '+286 this month', icon: '📦' },
  { label: 'Active Suppliers', value: '42', change: '+5 pending approval', icon: '🏪' },
  { label: 'Delivery Partners', value: '18', change: '15 active now', icon: '🚚' },
  { label: 'Platform GMV', value: '₹1.2 Cr', change: 'This quarter', icon: '📊' },
];

const pendingApprovals = [
  { id: 1, name: 'Krishna Materials', city: 'Ramagundam', type: 'Supplier', gst: 'Yes', date: '2 days ago' },
  { id: 2, name: 'Quick Delivery Services', city: 'Peddapalli', type: 'Delivery Partner', gst: 'N/A', date: '1 day ago' },
  { id: 3, name: 'Sai Hardware Store', city: 'Karimnagar', type: 'Supplier', gst: 'Yes', date: '3 hrs ago' },
];

const recentOrders = [
  { id: 'NRM-5821', buyer: 'Ravi Kumar', supplier: 'Sri Ganesh Traders', amount: '₹19,000', status: 'processing', commission: '₹380' },
  { id: 'NRM-5820', buyer: 'Construction Co.', supplier: 'Sri Sai Steel', amount: '₹1,30,000', status: 'confirmed', commission: '₹2,600' },
  { id: 'NRM-5818', buyer: 'Srinivas Reddy', supplier: 'RK Crushers', amount: '₹5,500', status: 'delivered', commission: '₹110' },
  { id: 'NRM-5815', buyer: 'Budget Homes', supplier: 'Balaji Materials', amount: '₹78,000', status: 'delivered', commission: '₹1,560' },
];

const topSuppliers = [
  { name: 'Balaji Materials', orders: 2100, revenue: '₹45,00,000', rating: 4.7, commission: '₹90,000' },
  { name: 'Sri Ganesh Traders', orders: 1240, revenue: '₹28,00,000', rating: 4.5, commission: '₹56,000' },
  { name: 'Lakshmi Hardware', orders: 890, revenue: '₹18,50,000', rating: 4.3, commission: '₹37,000' },
  { name: 'Modern Cement Depot', orders: 3200, revenue: '₹85,00,000', rating: 4.2, commission: '₹1,70,000' },
];

const statusColors: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Nav */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <h1 className="font-bold text-lg">Nirmaan Admin</h1>
            <p className="text-xs text-gray-400">Platform Management Console</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">Admin User</span>
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold">A</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'Overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-green-600 mt-1">{s.change}</p>
                </div>
              ))}
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-sm border mb-6">
              <div className="p-5 border-b">
                <h3 className="font-semibold text-gray-900">🔔 Pending Approvals ({pendingApprovals.length})</h3>
              </div>
              <div className="divide-y">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.city} · {item.type} · GST: {item.gst} · Applied {item.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Approve</button>
                      <button className="px-4 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-5 border-b">
                  <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Order</th>
                        <th className="text-right px-4 py-2 text-gray-500 font-medium">Amount</th>
                        <th className="text-right px-4 py-2 text-gray-500 font-medium">Commission</th>
                        <th className="text-center px-4 py-2 text-gray-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-t">
                          <td className="px-4 py-3">
                            <p className="font-mono text-orange-600 text-xs">{o.id}</p>
                            <p className="text-xs text-gray-500">{o.buyer} → {o.supplier}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{o.amount}</td>
                          <td className="px-4 py-3 text-right text-green-600">{o.commission}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[o.status]}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Suppliers */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-5 border-b">
                  <h3 className="font-semibold text-gray-900">Top Suppliers</h3>
                </div>
                <div className="divide-y">
                  {topSuppliers.map((s) => (
                    <div key={s.name} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.orders.toLocaleString()} orders · ⭐ {s.rating}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">{s.revenue}</p>
                        <p className="text-xs text-green-600">Commission: {s.commission}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border mt-6 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue (₹ Lakhs)</h3>
              <div className="flex items-end gap-3 h-48">
                {[
                  { month: 'Jan', val: 35 },
                  { month: 'Feb', val: 42 },
                  { month: 'Mar', val: 55 },
                  { month: 'Apr', val: 48 },
                  { month: 'May', val: 62 },
                  { month: 'Jun', val: 78 },
                  { month: 'Jul', val: 71 },
                  { month: 'Aug', val: 85 },
                  { month: 'Sep', val: 92 },
                  { month: 'Oct', val: 88 },
                  { month: 'Nov', val: 95 },
                  { month: 'Dec', val: 100 },
                ].map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">₹{m.val}L</span>
                    <div className="w-full bg-orange-500 rounded-t" style={{ height: `${m.val * 1.5}px` }} />
                    <span className="text-xs text-gray-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Users' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-500">1,847 registered users. User management panel coming soon.</p>
          </div>
        )}

        {activeTab === 'Suppliers' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Management</h2>
            <p className="text-gray-500">42 active suppliers. Detailed supplier management coming soon.</p>
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Management</h2>
            <p className="text-gray-500">3,429 total orders. Detailed order management coming soon.</p>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Catalog</h2>
            <p className="text-gray-500">Platform-wide product catalog management coming soon.</p>
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-500">Detailed platform reports and analytics coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
