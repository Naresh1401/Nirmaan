'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Star, Truck, MapPin, ShoppingCart, Heart, IndianRupee, Factory, Package, Shield, Clock, ChevronRight, Minus, Plus, CheckCircle2, BarChart3, ArrowLeft } from 'lucide-react';

const productData: Record<string, any> = {
  '1': {
    name: 'UltraTech Cement PPC (50kg)', brand: 'UltraTech', category: 'Cement', image: '🏗️',
    description: 'Premium Portland Pozzolana Cement ideal for all general construction purposes including foundations, walls, columns, and slabs. Conforms to IS 1489 Part 1.',
    specs: { 'Type': 'PPC', 'Weight': '50 kg', 'Grade': '53 Grade', 'Standard': 'IS 1489', 'Shelf Life': '3 months' },
    suppliers: [
      { id: 's1', name: 'Peddapalli Traders', price: 385, mrp: 420, rating: 4.5, reviews: 128, stock: 250, delivery: 'Same Day', distance: '2.5 km', verified: true },
      { id: 's2', name: 'Sri Ganesh Hardware', price: 392, mrp: 420, rating: 4.3, reviews: 67, stock: 150, delivery: 'Same Day', distance: '4.1 km', verified: true },
      { id: 's3', name: 'Karimnagar Building Materials', price: 398, mrp: 420, rating: 4.1, reviews: 45, stock: 80, delivery: 'Next Day', distance: '12 km', verified: false },
    ],
    priceHistory: [385, 390, 388, 395, 392, 385, 380, 385, 388, 390, 392, 385],
  },
};

// Default product for any ID
const defaultProduct = {
  name: 'Construction Material', brand: 'Premium', category: 'General', image: '🏗️',
  description: 'High-quality construction material from verified suppliers.',
  specs: { 'Type': 'Standard', 'Quality': 'Premium Grade' },
  suppliers: [
    { id: 's1', name: 'Local Supplier', price: 500, mrp: 600, rating: 4.2, reviews: 50, stock: 100, delivery: 'Same Day', distance: '3 km', verified: true },
    { id: 's2', name: 'District Supplier', price: 520, mrp: 600, rating: 4.0, reviews: 30, stock: 75, delivery: 'Next Day', distance: '8 km', verified: true },
  ],
  priceHistory: [500, 510, 505, 520, 515, 500, 495, 500, 510, 515, 520, 500],
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = productData[params.id] || defaultProduct;
  const [selectedSupplier, setSelectedSupplier] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('suppliers');
  const supplier = product.suppliers[selectedSupplier];

  const reviews = [
    { name: 'Ramesh K.', rating: 5, date: '2 weeks ago', text: 'Excellent quality cement. Delivered on time. Will order again.', verified: true },
    { name: 'Sunil P.', rating: 4, date: '1 month ago', text: 'Good product but delivery was slightly delayed. Quality is fine.', verified: true },
    { name: 'Vijay R.', rating: 5, date: '1 month ago', text: 'Best price in the market. Nirmaan makes ordering so easy!', verified: true },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/products" className="hover:text-orange-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-400">{product.category}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Product Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl h-64 md:h-auto flex items-center justify-center">
                    <span className="text-8xl">{product.image}</span>
                  </div>
                  <div>
                    <div className="text-sm text-orange-600 font-semibold mb-1">{product.brand}</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-green-600 text-green-600" />
                        <span className="text-sm font-bold text-green-700">{supplier.rating}</span>
                      </div>
                      <span className="text-sm text-gray-400">({supplier.reviews} reviews)</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

                    {/* Price */}
                    <div className="bg-orange-50 rounded-xl p-4 mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-gray-900 flex items-center"><IndianRupee className="w-6 h-6" />{supplier.price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-400 line-through">₹{supplier.mrp.toLocaleString('en-IN')}</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{Math.round((1 - supplier.price / supplier.mrp) * 100)}% OFF</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">From {supplier.name}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                      <div className="flex items-center border border-gray-200 rounded-xl">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                        <span className="px-6 font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                      </div>
                      <span className="text-sm text-gray-500">Total: ₹{(supplier.price * quantity).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25">
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 p-3.5 rounded-xl transition-all">
                        <Heart className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {[
                    { key: 'suppliers', label: 'Compare Suppliers', icon: Factory },
                    { key: 'specs', label: 'Specifications', icon: Package },
                    { key: 'reviews', label: 'Reviews', icon: Star },
                    { key: 'price-history', label: 'Price Trend', icon: BarChart3 },
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <tab.icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'suppliers' && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-900 mb-4">Compare {product.suppliers.length} Suppliers</h3>
                      {product.suppliers.map((s: any, i: number) => (
                        <div key={s.id} onClick={() => setSelectedSupplier(i)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedSupplier === i ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{s.name}</h4>
                                {s.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.distance}</span>
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-orange-400 text-orange-400" /> {s.rating}</span>
                                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {s.delivery}</span>
                                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {s.stock} in stock</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-extrabold text-gray-900">₹{s.price.toLocaleString('en-IN')}</div>
                              <div className="text-xs text-gray-400 line-through">₹{s.mrp.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Product Specifications</h3>
                      <div className="divide-y divide-gray-100">
                        {Object.entries(product.specs).map(([key, val]) => (
                          <div key={key} className="flex py-3">
                            <span className="w-40 text-gray-500 text-sm">{key}</span>
                            <span className="text-gray-900 font-medium text-sm">{val as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Customer Reviews</h3>
                      <div className="space-y-4">
                        {reviews.map((r, i) => (
                          <div key={i} className="border-b border-gray-100 last:border-0 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-orange-400 text-orange-400" />)}</div>
                              {r.verified && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified Purchase</span>}
                            </div>
                            <p className="text-gray-700 text-sm">{r.text}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <span className="font-medium text-gray-600">{r.name}</span> · <span>{r.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'price-history' && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Price Trend (Last 12 Months)</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-end gap-2 h-40">
                          {product.priceHistory.map((price: number, i: number) => {
                            const max = Math.max(...product.priceHistory);
                            const min = Math.min(...product.priceHistory);
                            const h = ((price - min) / (max - min + 1)) * 100 + 20;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-gray-500">₹{price}</span>
                                <div className="w-full bg-orange-400 rounded-t-sm hover:bg-orange-500 transition-colors" style={{ height: `${h}%` }}></div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>12 months ago</span><span>Now</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Truck className="w-5 h-5 text-green-600" />
                    <div><p className="text-sm font-semibold text-green-700">{supplier.delivery} Delivery</p><p className="text-xs text-green-600">Free delivery on orders above ₹5,000</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm font-semibold text-blue-700">Quality Verified</p><p className="text-xs text-blue-600">Weight check at pickup & delivery</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div><p className="text-sm font-semibold text-purple-700">Scheduled Delivery</p><p className="text-xs text-purple-600">Choose your preferred time slot</p></div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Price ({quantity} units)</span><span>₹{(supplier.price * quantity).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600">Free</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>₹{(supplier.price * quantity).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <Link href="/checkout" className="w-full mt-2 border-2 border-orange-500 text-orange-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-all">
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
