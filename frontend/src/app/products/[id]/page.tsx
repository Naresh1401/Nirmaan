'use client';

import Link from 'next/link';
import { useCartStore } from '@/hooks/useCart';

const product = {
  id: '1',
  name: 'UltraTech Cement OPC 53 Grade',
  brand: 'UltraTech',
  category: 'Cement',
  description: 'UltraTech Cement OPC 53 is India\'s leading cement brand. Made with the finest raw materials, it provides superior strength and durability for all construction needs. Ideal for RCC, foundations, beams, and columns.',
  specifications: {
    'Grade': 'OPC 53',
    'Weight': '50 kg per bag',
    'Setting Time': '30 minutes (initial)',
    'Compressive Strength': '53 MPa at 28 days',
    'IS Standard': 'IS 12269:2013',
  },
  suppliers: [
    { id: 's1', name: 'Sri Ganesh Traders', city: 'Peddapalli', price: 380, mrp: 420, stock: 250, rating: 4.5, deliveryTime: '24 hours', distance: '2.3 km' },
    { id: 's2', name: 'Lakshmi Hardware', city: 'Peddapalli', price: 375, mrp: 420, stock: 180, rating: 4.3, deliveryTime: '24 hours', distance: '3.1 km' },
    { id: 's3', name: 'Balaji Materials', city: 'Peddapalli', price: 390, mrp: 420, stock: 320, rating: 4.7, deliveryTime: '12 hours', distance: '1.5 km' },
    { id: 's4', name: 'Modern Cement Depot', city: 'Karimnagar', price: 370, mrp: 420, stock: 500, rating: 4.2, deliveryTime: '48 hours', distance: '35 km' },
  ],
};

export default function ProductDetailPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-600">Materials</Link>
            <span>/</span>
            <span className="text-gray-900">{product.category}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-80 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-8xl">🏗️</span>
            </div>
            <div className="flex gap-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 ring-orange-400">
                  <span className="text-2xl">🏗️</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-orange-600 font-medium">{product.brand}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★★★★★</span>
                <span className="text-sm text-gray-600">4.5 (128 reviews)</span>
              </div>
              <span className="text-sm text-green-600 font-medium">✓ Verified Product</span>
            </div>

            <p className="text-gray-600 mt-4">{product.description}</p>

            {/* Specifications */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{key}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Comparison */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compare Suppliers</h2>
          <p className="text-gray-500 text-sm mb-6">Choose the best supplier based on price, rating, and delivery time</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.suppliers.map((sup, idx) => (
              <div key={sup.id} className={`bg-white rounded-xl Shadow-sm p-5 border-2 ${idx === 0 ? 'border-orange-400' : 'border-gray-100'} relative`}>
                {idx === 0 && (
                  <span className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">Best Price</span>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sup.name}</h3>
                    <p className="text-sm text-gray-500">{sup.city} · {sup.distance}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm text-gray-600">{sup.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{sup.price}</p>
                    <p className="text-xs text-gray-400 line-through">₹{sup.mrp}</p>
                    <p className="text-xs text-green-600 font-medium">{Math.round(((sup.mrp - sup.price) / sup.mrp) * 100)}% OFF</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span>🚚 {sup.deliveryTime}</span>
                  <span>📦 {sup.stock} in stock</span>
                </div>

                <button
                  onClick={() => addItem({ id: `${product.id}-${sup.id}`, name: product.name, price: sup.price, quantity: 1, supplier: sup.name, unit: 'bag' })}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Add to Cart — ₹{sup.price}/bag
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Price History Chart Placeholder */}
        <div className="mt-10 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Price History (Last 30 Days)</h2>
          <p className="text-sm text-gray-500 mb-4">Track price trends to buy at the best time</p>
          <div className="h-48 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm text-gray-500">Price trend: <span className="text-green-600 font-medium">↓ 2.3% this month</span></p>
              <p className="text-xs text-gray-400 mt-1">Best time to buy: Prices are below average!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
