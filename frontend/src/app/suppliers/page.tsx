'use client';

import Link from 'next/link';

const suppliers = [
  { id: '1', name: 'Sri Ganesh Traders', city: 'Peddapalli', rating: 4.5, orders: 1240, products: 32, verified: true, tier: 'gold', distance: '2.3 km', speciality: 'Cement & Aggregates', since: '2018' },
  { id: '2', name: 'Lakshmi Hardware', city: 'Peddapalli', rating: 4.3, orders: 890, products: 48, verified: true, tier: 'silver', distance: '3.1 km', speciality: 'Full Range Materials', since: '2015' },
  { id: '3', name: 'Balaji Materials', city: 'Peddapalli', rating: 4.7, orders: 2100, products: 25, verified: true, tier: 'gold', distance: '1.5 km', speciality: 'Cement & Steel', since: '2012' },
  { id: '4', name: 'Sri Sai Steel Center', city: 'Peddapalli', rating: 4.6, orders: 780, products: 18, verified: true, tier: 'silver', distance: '4.2 km', speciality: 'Steel & Iron', since: '2019' },
  { id: '5', name: 'Modern Cement Depot', city: 'Karimnagar', rating: 4.2, orders: 3200, products: 55, verified: true, tier: 'gold', distance: '35 km', speciality: 'Bulk Cement', since: '2010' },
  { id: '6', name: 'Tile World', city: 'Peddapalli', rating: 4.4, orders: 520, products: 120, verified: true, tier: 'silver', distance: '3.8 km', speciality: 'Tiles & Sanitaryware', since: '2020' },
  { id: '7', name: 'RK Crushers', city: 'Ramagundam', rating: 4.0, orders: 650, products: 8, verified: true, tier: 'bronze', distance: '28 km', speciality: 'Sand & Gravel', since: '2016' },
  { id: '8', name: 'Power Electronics', city: 'Peddapalli', rating: 4.8, orders: 420, products: 95, verified: true, tier: 'silver', distance: '2.0 km', speciality: 'Electrical Supplies', since: '2017' },
];

const tierColors: Record<string, string> = {
  gold: 'bg-yellow-100 text-yellow-700',
  silver: 'bg-gray-100 text-gray-700',
  bronze: 'bg-orange-100 text-orange-700',
};

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Verified Suppliers</h1>
          <p className="mt-1 text-gray-500">{suppliers.length} suppliers near Peddapalli, Telangana</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <Link href={`/suppliers/${sup.id}`} key={sup.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{sup.name}</h3>
                  <p className="text-sm text-gray-500">{sup.city} · {sup.distance}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {sup.verified && (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${tierColors[sup.tier]}`}>
                    {sup.tier}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">🏷️ {sup.speciality}</p>

              <div className="grid grid-cols-3 gap-3 text-center bg-gray-50 rounded-lg p-3 mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">⭐ {sup.rating}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{sup.orders.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{sup.products}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
              </div>

              <p className="text-xs text-gray-400">Supplying since {sup.since}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
