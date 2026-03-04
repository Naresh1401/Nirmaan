'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = [
  { name: 'Cement', slug: 'cement', icon: '🏗️', count: 48, desc: 'OPC, PPC, PSC grades' },
  { name: 'Sand', slug: 'sand', icon: '⏳', count: 24, desc: 'River sand, M-sand, P-sand' },
  { name: 'Bricks', slug: 'bricks', icon: '🧱', count: 36, desc: 'Red, fly ash, AAC blocks' },
  { name: 'Steel', slug: 'steel', icon: '⚙️', count: 32, desc: 'TMT bars, rods, sheets' },
  { name: 'Gravel', slug: 'gravel', icon: '🪨', count: 18, desc: '20mm, 40mm aggregate' },
  { name: 'Tiles', slug: 'tiles', icon: '🔲', count: 56, desc: 'Vitrified, ceramic, marble' },
  { name: 'Electrical', slug: 'electrical', icon: '⚡', count: 72, desc: 'Wires, switches, MCBs' },
  { name: 'Plumbing', slug: 'plumbing', icon: '🔧', count: 44, desc: 'Pipes, fittings, tanks' },
  { name: 'Tools', slug: 'tools', icon: '🛠️', count: 60, desc: 'Power & hand tools' },
];

const sortOptions = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Newest', value: 'newest' },
];

// Sample products for demo
const sampleProducts = [
  { id: '1', name: 'UltraTech Cement OPC 53', brand: 'UltraTech', price: 380, mrp: 420, unit: 'bag', stock: 250, rating: 4.5, supplier: 'Sri Ganesh Traders', city: 'Peddapalli', image: null, category: 'cement' },
  { id: '2', name: 'ACC Gold Cement PPC', brand: 'ACC', price: 370, mrp: 410, unit: 'bag', stock: 180, rating: 4.3, supplier: 'Lakshmi Hardware', city: 'Peddapalli', image: null, category: 'cement' },
  { id: '3', name: 'Ambuja Cement PPC', brand: 'Ambuja', price: 365, mrp: 400, unit: 'bag', stock: 320, rating: 4.4, supplier: 'Balaji Materials', city: 'Peddapalli', image: null, category: 'cement' },
  { id: '4', name: 'River Sand (Fine)', brand: 'Local', price: 55, mrp: 55, unit: 'cft', stock: 5000, rating: 4.0, supplier: 'Peddapalli Sand Depot', city: 'Peddapalli', image: null, category: 'sand' },
  { id: '5', name: 'M-Sand (Manufactured)', brand: 'Local', price: 42, mrp: 42, unit: 'cft', stock: 8000, rating: 4.2, supplier: 'RK Crushers', city: 'Ramagundam', image: null, category: 'sand' },
  { id: '6', name: 'Red Bricks (Standard)', brand: 'Local', price: 8, mrp: 10, unit: 'piece', stock: 50000, rating: 4.1, supplier: 'Venkat Brick Works', city: 'Sultanabad', image: null, category: 'bricks' },
  { id: '7', name: 'Fly Ash Bricks', brand: 'GreenBuild', price: 6, mrp: 7, unit: 'piece', stock: 30000, rating: 4.3, supplier: 'Eco Bricks Ltd', city: 'Peddapalli', image: null, category: 'bricks' },
  { id: '8', name: 'TATA Tiscon TMT Fe 500D 12mm', brand: 'TATA', price: 68, mrp: 75, unit: 'kg', stock: 5000, rating: 4.7, supplier: 'Sri Sai Steel', city: 'Peddapalli', image: null, category: 'steel' },
  { id: '9', name: 'JSW NeoSteel TMT 10mm', brand: 'JSW', price: 65, mrp: 72, unit: 'kg', stock: 3000, rating: 4.5, supplier: 'Modern Steel Traders', city: 'Karimnagar', image: null, category: 'steel' },
  { id: '10', name: 'Kajaria Floor Tiles 2x2', brand: 'Kajaria', price: 45, mrp: 55, unit: 'sqft', stock: 10000, rating: 4.6, supplier: 'Tile World', city: 'Peddapalli', image: null, category: 'tiles' },
  { id: '11', name: 'Somany Wall Tiles', brand: 'Somany', price: 38, mrp: 48, unit: 'sqft', stock: 8000, rating: 4.4, supplier: 'Tile World', city: 'Peddapalli', image: null, category: 'tiles' },
  { id: '12', name: 'Havells Wire 1.5mm', brand: 'Havells', price: 1250, mrp: 1400, unit: 'bundle', stock: 200, rating: 4.8, supplier: 'Power Electronics', city: 'Peddapalli', image: null, category: 'electrical' },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sampleProducts
    .filter((p) => !selectedCategory || p.category === selectedCategory)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Construction Materials</h1>
          <p className="mt-1 text-gray-500">Browse and compare prices from verified suppliers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <button onClick={() => setSelectedCategory('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${!selectedCategory ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                All Materials
              </button>
              {categories.map((cat) => (
                <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 ${selectedCategory === cat.slug ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search materials, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">{filtered.length} products found {selectedCategory && `in "${selectedCategory}"`}</p>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
                  {/* Image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-5xl">{categories.find(c => c.slug === product.category)?.icon || '📦'}</span>
                  </div>

                  {/* Discount badge */}
                  {product.mrp > product.price && (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                  )}

                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.brand}</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-xs text-gray-400">/{product.unit}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <span className="text-yellow-500">★</span> {product.rating} · {product.supplier}
                    </div>
                    <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
