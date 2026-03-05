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
  // Granite Blocks
  '16': {
    name: 'Black Granite Block (Polished)', brand: 'Black Galaxy', category: 'Granite', image: '⬛',
    description: 'Premium Black Galaxy granite with mirror-polished finish. Ideal for kitchen countertops, flooring, and wall cladding. Sourced from quarries in Chimakurthy, Andhra Pradesh. Known for its deep black base with golden speckles.',
    specs: { 'Type': 'Polished Slab', 'Thickness': '15-20mm', 'Finish': 'Mirror Polish', 'Hardness': '6-7 Mohs', 'Density': '2.6-2.8 g/cm³', 'Water Absorption': '< 0.1%' },
    suppliers: [
      { id: 's16', name: 'Telangana Granite Works', price: 85, mrp: 110, rating: 4.6, reviews: 74, stock: 1200, delivery: 'Next Day', distance: '5 km', verified: true },
      { id: 's18', name: 'Deccan Stone Exports', price: 92, mrp: 110, rating: 4.4, reviews: 38, stock: 600, delivery: '2-3 Days', distance: '15 km', verified: true },
    ],
    priceHistory: [88, 85, 90, 87, 85, 82, 85, 88, 90, 85, 83, 85],
  },
  '17': {
    name: 'Tan Brown Granite Slab', brand: 'Tan Brown', category: 'Granite', image: '⬛',
    description: 'Popular Tan Brown granite with a rich brown base and dark inclusions. Excellent for exterior cladding, staircase treads, and large floor areas. Highly durable and weather-resistant.',
    specs: { 'Type': 'Slab', 'Thickness': '15-20mm', 'Finish': 'Polished / Leather', 'Hardness': '6 Mohs', 'Density': '2.65 g/cm³', 'Water Absorption': '< 0.15%' },
    suppliers: [
      { id: 's17', name: 'Sri Lakshmi Stones', price: 75, mrp: 95, rating: 4.5, reviews: 63, stock: 800, delivery: '2-3 Days', distance: '8 km', verified: true },
      { id: 's19', name: 'Rock Hill Granites', price: 80, mrp: 95, rating: 4.2, reviews: 31, stock: 400, delivery: '2-3 Days', distance: '18 km', verified: true },
    ],
    priceHistory: [78, 75, 80, 77, 75, 72, 75, 78, 80, 75, 73, 75],
  },
  '18': {
    name: 'Steel Grey Granite (Flamed)', brand: 'Steel Grey', category: 'Granite', image: '⬛',
    description: 'Steel Grey granite with a flamed anti-slip finish. Perfect for outdoor flooring, driveways, pathways, and swimming pool surrounds. The flamed texture provides excellent grip even when wet.',
    specs: { 'Type': 'Flamed Slab', 'Thickness': '20-30mm', 'Finish': 'Flamed (Anti-slip)', 'Hardness': '6-7 Mohs', 'Density': '2.6 g/cm³', 'Water Absorption': '< 0.2%' },
    suppliers: [
      { id: 's18', name: 'Deccan Stone Exports', price: 65, mrp: 85, rating: 4.3, reviews: 48, stock: 600, delivery: '2-3 Days', distance: '15 km', verified: true },
      { id: 's16', name: 'Telangana Granite Works', price: 70, mrp: 85, rating: 4.5, reviews: 29, stock: 350, delivery: 'Next Day', distance: '5 km', verified: true },
    ],
    priceHistory: [68, 65, 70, 67, 65, 62, 65, 68, 70, 65, 63, 65],
  },
  '19': {
    name: 'Absolute Black Granite (Mirror)', brand: 'Absolute Black', category: 'Granite', image: '⬛',
    description: 'Top-grade Absolute Black granite with a flawless mirror-finish surface. The deepest, most uniform black granite available. Premium choice for luxury interiors, reception counters, and high-end flooring.',
    specs: { 'Type': 'Mirror Polished', 'Thickness': '15-20mm', 'Finish': 'Super Mirror', 'Hardness': '7 Mohs', 'Density': '2.8 g/cm³', 'Water Absorption': '< 0.05%' },
    suppliers: [
      { id: 's16', name: 'Telangana Granite Works', price: 120, mrp: 150, rating: 4.8, reviews: 91, stock: 500, delivery: 'Next Day', distance: '5 km', verified: true },
      { id: 's18', name: 'Deccan Stone Exports', price: 130, mrp: 150, rating: 4.6, reviews: 42, stock: 250, delivery: '2-3 Days', distance: '15 km', verified: true },
    ],
    priceHistory: [125, 120, 128, 123, 120, 118, 120, 125, 128, 120, 118, 120],
  },
  '20': {
    name: 'Rajashree Red Granite', brand: 'Rajashree Red', category: 'Granite', image: '⬛',
    description: 'Vibrant red granite with natural grain patterns. Popular for temple flooring, outdoor landscaping, and boundary walls. One of the most affordable granite options with good durability.',
    specs: { 'Type': 'Polished Slab', 'Thickness': '15-25mm', 'Finish': 'Polished / Honed', 'Hardness': '6 Mohs', 'Density': '2.6 g/cm³', 'Water Absorption': '< 0.2%' },
    suppliers: [
      { id: 's17', name: 'Sri Lakshmi Stones', price: 55, mrp: 70, rating: 4.2, reviews: 37, stock: 900, delivery: '2-3 Days', distance: '8 km', verified: true },
      { id: 's19', name: 'Rock Hill Granites', price: 58, mrp: 70, rating: 4.0, reviews: 22, stock: 500, delivery: '2-3 Days', distance: '18 km', verified: true },
    ],
    priceHistory: [58, 55, 60, 57, 55, 52, 55, 58, 60, 55, 53, 55],
  },
  '21': {
    name: 'Kashmir White Granite', brand: 'Kashmir White', category: 'Granite', image: '⬛',
    description: 'Elegant Kashmir White granite with a soft white base, light grey veining, and garnet-red mineral inclusions. A premium choice for interior flooring, kitchen countertops, and bathroom vanities.',
    specs: { 'Type': 'Polished Slab', 'Thickness': '15-20mm', 'Finish': 'High Gloss Polish', 'Hardness': '6-7 Mohs', 'Density': '2.65 g/cm³', 'Water Absorption': '< 0.1%' },
    suppliers: [
      { id: 's18', name: 'Deccan Stone Exports', price: 95, mrp: 125, rating: 4.7, reviews: 82, stock: 350, delivery: '3-5 Days', distance: '15 km', verified: true },
      { id: 's16', name: 'Telangana Granite Works', price: 102, mrp: 125, rating: 4.5, reviews: 40, stock: 200, delivery: '2-3 Days', distance: '5 km', verified: true },
    ],
    priceHistory: [98, 95, 100, 97, 95, 92, 95, 98, 100, 95, 93, 95],
  },
  '22': {
    name: 'Viscon White Granite Block', brand: 'Viscon White', category: 'Granite', image: '⬛',
    description: 'Viscon White granite with flowing grey and white veins. Great alternative to marble at a lower cost. Used for flooring, kitchen platforms, and decorative wall cladding.',
    specs: { 'Type': 'Polished Block', 'Thickness': '15-20mm', 'Finish': 'Polished', 'Hardness': '6 Mohs', 'Density': '2.6 g/cm³', 'Water Absorption': '< 0.15%' },
    suppliers: [
      { id: 's19', name: 'Rock Hill Granites', price: 70, mrp: 90, rating: 4.4, reviews: 55, stock: 450, delivery: '2-3 Days', distance: '18 km', verified: true },
      { id: 's17', name: 'Sri Lakshmi Stones', price: 75, mrp: 90, rating: 4.2, reviews: 28, stock: 300, delivery: '2-3 Days', distance: '8 km', verified: true },
    ],
    priceHistory: [73, 70, 75, 72, 70, 68, 70, 73, 75, 70, 68, 70],
  },
  // Gravel Grades
  '14': {
    name: 'Crushed Stone 20mm', brand: 'Crushed', category: 'Gravel', image: '🪨',
    description: 'Standard 20mm crushed stone aggregate for general concrete mixing, road base, and foundation filling. Conforms to IS 383. Angular shape provides excellent interlocking in concrete.',
    specs: { 'Size': '20mm', 'Type': 'Crushed Stone', 'Shape': 'Angular', 'Standard': 'IS 383', 'Bulk Density': '1500-1600 kg/m³', 'Use': 'RCC / PCC' },
    suppliers: [
      { id: 's14', name: 'Rock Aggregates', price: 1800, mrp: 2100, rating: 4.2, reviews: 56, stock: 200, delivery: 'Same Day', distance: '6 km', verified: true },
      { id: 's20', name: 'Karimnagar Stone Crushers', price: 1850, mrp: 2100, rating: 4.0, reviews: 30, stock: 300, delivery: 'Same Day', distance: '12 km', verified: true },
    ],
    priceHistory: [1850, 1800, 1900, 1850, 1800, 1750, 1800, 1850, 1900, 1800, 1780, 1800],
  },
  '23': {
    name: 'Gravel 10mm (Fine Grade)', brand: 'Fine', category: 'Gravel', image: '🪨',
    description: 'Fine 10mm crushed stone aggregate for plastering work, thin concrete slabs, and fine concrete mixes. Suitable for M15 to M20 grade concrete. Clean and well-graded.',
    specs: { 'Size': '10mm (passing)', 'Type': 'Crushed Aggregate', 'Shape': 'Angular/Sub-angular', 'Standard': 'IS 383', 'Bulk Density': '1450-1550 kg/m³', 'Use': 'Plastering / Fine Concrete' },
    suppliers: [
      { id: 's14', name: 'Rock Aggregates', price: 1500, mrp: 1800, rating: 4.3, reviews: 68, stock: 300, delivery: 'Same Day', distance: '6 km', verified: true },
      { id: 's7', name: 'Crusher Works', price: 1550, mrp: 1800, rating: 4.1, reviews: 35, stock: 250, delivery: 'Same Day', distance: '9 km', verified: true },
    ],
    priceHistory: [1550, 1500, 1600, 1550, 1500, 1450, 1500, 1550, 1600, 1500, 1480, 1500],
  },
  '24': {
    name: 'Gravel 12mm (Standard)', brand: 'Standard', category: 'Gravel', image: '🪨',
    description: '12mm standard grade aggregate used in general construction concrete work and column filling. Good for M20 to M25 grade mixes. Consistent sizing with low dust content.',
    specs: { 'Size': '12mm', 'Type': 'Crushed Aggregate', 'Shape': 'Angular', 'Standard': 'IS 383', 'Bulk Density': '1500 kg/m³', 'Use': 'General RCC' },
    suppliers: [
      { id: 's7', name: 'Crusher Works', price: 1600, mrp: 1900, rating: 4.2, reviews: 45, stock: 400, delivery: 'Same Day', distance: '9 km', verified: true },
      { id: 's14', name: 'Rock Aggregates', price: 1650, mrp: 1900, rating: 4.3, reviews: 28, stock: 350, delivery: 'Same Day', distance: '6 km', verified: true },
    ],
    priceHistory: [1650, 1600, 1700, 1650, 1600, 1550, 1600, 1650, 1700, 1600, 1580, 1600],
  },
  '25': {
    name: 'Gravel 20mm (Medium Grade)', brand: 'Medium', category: 'Gravel', image: '🪨',
    description: 'Medium 20mm aggregate — the most commonly used gravel for all RCC work including slabs, beams, columns, and footings. Conforms to IS 383 Zone II grading.',
    specs: { 'Size': '20mm', 'Type': 'Crushed Aggregate', 'Shape': 'Well Angular', 'Standard': 'IS 383 Zone II', 'Bulk Density': '1500-1600 kg/m³', 'Use': 'All RCC Work' },
    suppliers: [
      { id: 's14', name: 'Rock Aggregates', price: 1800, mrp: 2100, rating: 4.4, reviews: 92, stock: 500, delivery: 'Same Day', distance: '6 km', verified: true },
      { id: 's20', name: 'Karimnagar Stone Crushers', price: 1850, mrp: 2100, rating: 4.2, reviews: 48, stock: 400, delivery: 'Same Day', distance: '12 km', verified: true },
    ],
    priceHistory: [1850, 1800, 1900, 1850, 1800, 1750, 1800, 1850, 1900, 1800, 1780, 1800],
  },
  '26': {
    name: 'Gravel 40mm (Coarse Grade)', brand: 'Coarse', category: 'Gravel', image: '🪨',
    description: 'Large 40mm coarse aggregate for PCC (Plain Cement Concrete), foundation filling, road sub-base, and heavy-duty flooring. Provides excellent load-bearing capacity.',
    specs: { 'Size': '40mm', 'Type': 'Coarse Aggregate', 'Shape': 'Angular', 'Standard': 'IS 383', 'Bulk Density': '1550-1650 kg/m³', 'Use': 'PCC / Foundation' },
    suppliers: [
      { id: 's20', name: 'Karimnagar Stone Crushers', price: 1650, mrp: 1950, rating: 4.1, reviews: 34, stock: 600, delivery: 'Same Day', distance: '12 km', verified: true },
      { id: 's14', name: 'Rock Aggregates', price: 1700, mrp: 1950, rating: 4.2, reviews: 20, stock: 350, delivery: 'Same Day', distance: '6 km', verified: true },
    ],
    priceHistory: [1700, 1650, 1750, 1700, 1650, 1600, 1650, 1700, 1750, 1650, 1630, 1650],
  },
  '27': {
    name: 'Blue Metal 6mm (Chips)', brand: 'Blue Metal', category: 'Gravel', image: '🪨',
    description: '6mm blue metal stone chips for waterproofing, terrace treatment, and decorative landscaping. Also used as a top layer in bituminous road construction.',
    specs: { 'Size': '6mm', 'Type': 'Stone Chips', 'Shape': 'Sub-angular', 'Standard': 'IS 383', 'Bulk Density': '1400-1500 kg/m³', 'Use': 'Waterproofing / Road Top' },
    suppliers: [
      { id: 's14', name: 'Rock Aggregates', price: 1400, mrp: 1700, rating: 4.0, reviews: 29, stock: 250, delivery: 'Same Day', distance: '6 km', verified: true },
      { id: 's7', name: 'Crusher Works', price: 1450, mrp: 1700, rating: 3.9, reviews: 18, stock: 180, delivery: 'Same Day', distance: '9 km', verified: true },
    ],
    priceHistory: [1450, 1400, 1500, 1450, 1400, 1350, 1400, 1450, 1500, 1400, 1380, 1400],
  },
  '28': {
    name: 'Pea Gravel (Rounded)', brand: 'Pea Gravel', category: 'Gravel', image: '🪨',
    description: 'Naturally rounded pea gravel (8-15mm) for decorative landscaping, garden pathways, drainage layers, and backfilling around pipes. Smooth texture and mixed natural colours.',
    specs: { 'Size': '8-15mm', 'Type': 'Rounded Gravel', 'Shape': 'Rounded/Sub-rounded', 'Finish': 'Natural', 'Bulk Density': '1600-1700 kg/m³', 'Use': 'Landscaping / Drainage' },
    suppliers: [
      { id: 's7', name: 'Crusher Works', price: 2200, mrp: 2600, rating: 4.5, reviews: 41, stock: 180, delivery: 'Next Day', distance: '9 km', verified: true },
      { id: 's14', name: 'Rock Aggregates', price: 2300, mrp: 2600, rating: 4.3, reviews: 22, stock: 120, delivery: 'Next Day', distance: '6 km', verified: true },
    ],
    priceHistory: [2300, 2200, 2400, 2300, 2200, 2100, 2200, 2300, 2400, 2200, 2150, 2200],
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
