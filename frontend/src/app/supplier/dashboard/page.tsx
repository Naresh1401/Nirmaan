'use client';

import { useState } from 'react';
import Link from 'next/link';

const tabs = ['Dashboard', 'Products', 'Orders', 'Analytics', 'Settings'];

const dashboardStats = [
  { label: 'Total Revenue', value: '₹4,82,350', change: '+12.5%', positive: true },
  { label: 'Orders Today', value: '18', change: '+3', positive: true },
  { label: 'Products Listed', value: '32', change: '2 low stock', positive: false },
  { label: 'Customer Rating', value: '4.5 ⭐', change: '+0.2', positive: true },
];

const recentOrders = [
  { id: 'NRM-5821', customer: 'Ravi Kumar', items: 'UltraTech Cement x50 bags', total: '₹19,000', status: 'pending', time: '12 min ago' },
  { id: 'NRM-5820', customer: 'Construction Co.', items: 'TMT Steel 8mm x2 tons', total: '₹1,30,000', status: 'confirmed', time: '45 min ago' },
  { id: 'NRM-5818', customer: 'Srinivas Reddy', items: 'River Sand x100 cft', total: '₹5,500', status: 'dispatched', time: '2 hrs ago' },
  { id: 'NRM-5815', customer: 'Budget Homes Pvt', items: 'Bricks x5000, Cement x100', total: '₹78,000', status: 'delivered', time: '5 hrs ago' },
  { id: 'NRM-5812', customer: 'Anil Builders', items: 'Aggregate 20mm x200 cft', total: '₹9,600', status: 'delivered', time: '1 day ago' },
];

const products = [
  { name: 'UltraTech OPC 53 Grade', sku: 'CEM-001', price: '₹380', stock: 450, status: 'active' },
  { name: 'ACC Gold Cement', sku: 'CEM-002', price: '₹375', stock: 12, status: 'low_stock' },
  { name: 'TMT Steel Fe500D 8mm', sku: 'STL-001', price: '₹65,000/ton', stock: 8, status: 'active' },
  { name: 'River Sand (Fine)', sku: 'SND-001', price: '₹55/cft', stock: 2000, status: 'active' },
  { name: 'Red Clay Bricks', sku: 'BRK-001', price: '₹8/pc', stock: 0, status: 'out_of_stock' },
  { name: 'Gravel 20mm', sku: 'AGG-001', price: '₹48/cft', stock: 800, status: 'active' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  low_stock: 'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-5 hidden lg:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">🏪 Supplier Hub</h1>
          <p className="text-sm text-gray-500">Sri Ganesh Traders</p>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'Dashboard' && '📊 '}
              {tab === 'Products' && '📦 '}
              {tab === 'Orders' && '🛒 '}
              {tab === 'Analytics' && '📈 '}
              {tab === 'Settings' && '⚙️ '}
              {tab}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Mobile tab selector */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Dashboard' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500 text-sm">Welcome back! Here&apos;s your business overview.</p>
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">
                + Add Product
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {dashboardStats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-yellow-600'}`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border mb-8">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                <button onClick={() => setActiveTab('Orders')} className="text-sm text-orange-600 font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Order ID</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Items</th>
                      <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                      <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-orange-600">{order.id}</td>
                        <td className="px-5 py-3">
                          <div>{order.customer}</div>
                          <div className="text-xs text-gray-400">{order.time}</div>
                        </td>
                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{order.items}</td>
                        <td className="px-5 py-3 text-right font-medium">{order.total}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Products' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">
                + Add Product
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">SKU</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Price</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Stock</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.sku} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{prod.name}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{prod.sku}</td>
                      <td className="px-5 py-3 text-right">{prod.price}</td>
                      <td className="px-5 py-3 text-right">{prod.stock}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[prod.status]}`}>
                          {prod.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-orange-600 text-xs font-medium hover:underline mr-3">Edit</button>
                        <button className="text-red-500 text-xs font-medium hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Orders' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Order ID</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Items</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-orange-600">{order.id}</td>
                      <td className="px-5 py-3">{order.customer}</td>
                      <td className="px-5 py-3 text-gray-600">{order.items}</td>
                      <td className="px-5 py-3 text-right font-medium">{order.total}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {order.status === 'pending' && (
                          <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Accept</button>
                        )}
                        {order.status === 'confirmed' && (
                          <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700">Dispatch</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Analytics' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const values = [35, 55, 42, 70, 85, 65, 48];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-8">{day}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                          <div className="bg-orange-500 rounded-full h-4" style={{ width: `${values[i]}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-20 text-right">
                          ₹{Math.round(values[i] * 800).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-4">
                  {[
                    { name: 'UltraTech Cement', orders: 124, revenue: '₹47,120' },
                    { name: 'TMT Steel 8mm', orders: 18, revenue: '₹11,70,000' },
                    { name: 'River Sand', orders: 89, revenue: '₹4,89,500' },
                    { name: 'Red Clay Bricks', orders: 67, revenue: '₹2,68,000' },
                    { name: 'Gravel 20mm', orders: 45, revenue: '₹2,16,000' },
                  ].map((prod) => (
                    <div key={prod.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{prod.name}</p>
                        <p className="text-xs text-gray-500">{prod.orders} orders</p>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{prod.revenue}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Settings' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input defaultValue="Sri Ganesh Traders" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input defaultValue="+91 9876543210" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea defaultValue="Shop No. 42, Main Road, Peddapalli, Telangana 504195" rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input defaultValue="36AABCS1429B1Z7" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <button className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
