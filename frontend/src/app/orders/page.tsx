'use client';

import Link from 'next/link';

const sampleOrders = [
  {
    id: 'NRM-A1B2C3',
    date: '2026-03-04',
    status: 'delivered',
    items: ['UltraTech Cement × 50', 'River Sand × 200 cft'],
    total: 26500,
    supplier: 'Sri Ganesh Traders',
  },
  {
    id: 'NRM-D4E5F6',
    date: '2026-03-03',
    status: 'in_transit',
    items: ['TATA Steel TMT 12mm × 500 kg', 'Red Bricks × 5000'],
    total: 74000,
    supplier: 'Multiple Suppliers',
    tracking: { driver: 'Ramesh K.', phone: '9876543210', vehicle: 'TG-18-AB-1234', eta: '2 hours' },
  },
  {
    id: 'NRM-G7H8I9',
    date: '2026-03-01',
    status: 'processing',
    items: ['Kajaria Tiles × 500 sqft', 'Plumbing Kit × 1'],
    total: 28500,
    supplier: 'Tile World',
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: '✓' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: '⚙️' },
  in_transit: { label: 'In Transit', color: 'bg-orange-100 text-orange-700', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {sampleOrders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Ordered on {order.date} · {order.supplier}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-600">{item}</p>
                ))}
              </div>

              {/* Live tracking for in_transit orders */}
              {order.tracking && (
                <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-medium text-orange-800 mb-2">🚚 Live Tracking</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Driver</p><p className="font-medium">{order.tracking.driver}</p></div>
                    <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{order.tracking.phone}</p></div>
                    <div><p className="text-xs text-gray-500">Vehicle</p><p className="font-medium">{order.tracking.vehicle}</p></div>
                    <div><p className="text-xs text-gray-500">ETA</p><p className="font-medium text-orange-700">{order.tracking.eta}</p></div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-1">
                    {['Order Placed', 'Picked Up', 'In Transit', 'Delivered'].map((s, i) => (
                      <div key={s} className="flex-1">
                        <div className={`h-1.5 rounded-full ${i <= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        <p className="text-[10px] text-gray-500 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                {order.status === 'delivered' && (
                  <button className="text-sm text-orange-600 hover:underline font-medium">⭐ Write Review</button>
                )}
                {order.status === 'delivered' && (
                  <button className="text-sm text-orange-600 hover:underline font-medium">🔄 Reorder</button>
                )}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button className="text-sm text-red-500 hover:underline font-medium">Cancel Order</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
