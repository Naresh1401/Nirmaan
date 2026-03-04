'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Search, SlidersHorizontal, Star, Truck, MapPin, ShoppingCart, Heart, IndianRupee, Factory, ChevronDown, X, Package, ArrowUpDown } from 'lucide-react';

const allProducts = [
  { id: '1', name: 'UltraTech Cement PPC (50kg)', price: 385, mrp: 420, supplier: 'Peddapalli Traders', supplierId: 's1', rating: 4.5, reviews: 128, discount: 8, unit: 'bag', category: 'cement', brand: 'UltraTech', stock: 250, delivery: 'Same Day', image: '🏗️' },
  { id: '2', name: 'ACC Cement OPC 53 (50kg)', price: 375, mrp: 410, supplier: 'Karimnagar Hardware', supplierId: 's2', rating: 4.4, reviews: 95, discount: 9, unit: 'bag', category: 'cement', brand: 'ACC', stock: 180, delivery: 'Same Day', image: '🏗️' },
  { id: '3', name: 'Ambuja Cement PPC (50kg)', price: 390, mrp: 425, supplier: 'Sri Ganesh Traders', supplierId: 's3', rating: 4.3, reviews: 72, discount: 8, unit: 'bag', category: 'cement', brand: 'Ambuja', stock: 320, delivery: 'Next Day', image: '🏗️' },
  { id: '4', name: 'JSW TMT Steel Bar 8mm', price: 58000, mrp: 63000, supplier: 'Sri Steel Works', supplierId: 's4', rating: 4.7, reviews: 89, discount: 8, unit: 'ton', category: 'steel', brand: 'JSW', stock: 45, delivery: 'Next Day', image: '🔩' },
  { id: '5', name: 'TATA Tiscon TMT 12mm', price: 62500, mrp: 68000, supplier: 'Peddapalli Steel', supplierId: 's5', rating: 4.8, reviews: 156, discount: 8, unit: 'ton', category: 'steel', brand: 'TATA', stock: 30, delivery: '2-3 Days', image: '🔩' },
  { id: '6', name: 'River Sand Fine Grade', price: 2800, mrp: 3200, supplier: 'Godavari Sand Depot', supplierId: 's6', rating: 4.3, reviews: 234, discount: 12, unit: 'ton', category: 'sand', brand: 'Natural', stock: 500, delivery: 'Same Day', image: '⏳' },
  { id: '7', name: 'M-Sand (Manufactured)', price: 2200, mrp: 2600, supplier: 'Crusher Works', supplierId: 's7', rating: 4.1, reviews: 67, discount: 15, unit: 'ton', category: 'sand', brand: 'M-Sand', stock: 800, delivery: 'Same Day', image: '⏳' },
  { id: '8', name: 'Red Clay Bricks (1st Class)', price: 6500, mrp: 7500, supplier: 'Kalyan Brick Works', supplierId: 's8', rating: 4.6, reviews: 167, discount: 13, unit: '1000 pcs', category: 'bricks', brand: '1st Class', stock: 50, delivery: 'Same Day', image: '🧱' },
  { id: '9', name: 'Fly Ash Bricks', price: 4500, mrp: 5200, supplier: 'Green Bricks Co', supplierId: 's9', rating: 4.4, reviews: 98, discount: 13, unit: '1000 pcs', category: 'bricks', brand: 'Fly Ash', stock: 100, delivery: 'Next Day', image: '🧱' },
  { id: '10', name: 'Ceramic Floor Tiles 2x2', price: 35, mrp: 45, supplier: 'Tile Palace', supplierId: 's10', rating: 4.5, reviews: 203, discount: 22, unit: 'sqft', category: 'tiles', brand: 'Kajaria', stock: 5000, delivery: '2-3 Days', image: '🔲' },
  { id: '11', name: 'Asian Paints Ace (20L)', price: 2850, mrp: 3200, supplier: 'Color World', supplierId: 's11', rating: 4.6, reviews: 145, discount: 11, unit: 'bucket', category: 'paint', brand: 'Asian Paints', stock: 60, delivery: 'Next Day', image: '🎨' },
  { id: '12', name: 'CPVC Pipes 1 inch (3m)', price: 280, mrp: 350, supplier: 'Pipe House', supplierId: 's12', rating: 4.2, reviews: 78, discount: 20, unit: 'piece', category: 'plumbing', brand: 'Astral', stock: 300, delivery: 'Same Day', image: '🔧' },
  { id: '13', name: 'Havells Wire 1.5mm (90m)', price: 1850, mrp: 2100, supplier: 'Electric Point', supplierId: 's13', rating: 4.7, reviews: 112, discount: 12, unit: 'coil', category: 'electrical', brand: 'Havells', stock: 75, delivery: 'Same Day', image: '⚡' },
  { id: '14', name: 'Crushed Stone 20mm', price: 1800, mrp: 2100, supplier: 'Rock Aggregates', supplierId: 's14', rating: 4.2, reviews: 56, discount: 14, unit: 'ton', category: 'gravel', brand: 'Crushed', stock: 200, delivery: 'Same Day', image: '🪨' },
  { id: '15', name: 'Bosch Drill Machine', price: 3200, mrp: 3800, supplier: 'Tools Mart', supplierId: 's15', rating: 4.8, reviews: 189, discount: 16, unit: 'piece', category: 'tools', brand: 'Bosch', stock: 25, delivery: 'Next Day', image: '🛠️' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'cement', label: 'Cement' },
  { value: 'sand', label: 'Sand' },
  { value: 'steel', label: 'Steel & TMT' },
  { value: 'bricks', label: 'Bricks' },
  { value: 'tiles', label: 'Tiles' },
  { value: 'paint', label: 'Paint' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'tools', label: 'Tools' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [searchQ, setSearchQ] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [ratingFilter, setRatingFilter] = useState(0);

  // Read URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q) setSearchQ(q);
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = allProducts
    .filter(p => {
      if (category && p.category !== category) return false;
      if (searchQ && !p.name.toLowerCase().includes(searchQ.toLowerCase()) && !p.brand.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (ratingFilter > 0 && p.rating < ratingFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0;
    });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Search & Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products, brands..." className="flex-1 bg-transparent outline-none text-gray-700" />
                {searchQ && <button onClick={() => setSearchQ('')}><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 outline-none hidden sm:block">
                {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 outline-none hidden sm:block">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Discount</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden bg-orange-50 text-orange-600 p-2.5 rounded-xl border border-orange-200">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
            {/* Mobile Filters */}
            {showFilters && (
              <div className="sm:hidden mt-3 flex gap-2 flex-wrap">
                <select value={category} onChange={e => setCategory(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            )}
            {/* Active Filters */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-gray-500">{filtered.length} products found</span>
              {category && (
                <span className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  {categoryOptions.find(c => c.value === category)?.label} <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-40 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform">{p.image}</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{p.discount}% OFF</div>
                  <button className="absolute top-3 right-3 bg-white/90 rounded-full p-2 text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-xs text-orange-600 font-semibold mb-1">{p.brand}</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1"><Factory className="w-3 h-3" /> {p.supplier}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-extrabold text-gray-900 flex items-center"><IndianRupee className="w-4 h-4" />{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400 line-through text-xs">₹{p.mrp.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-500">/{p.unit}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-green-600 text-green-600" />
                        <span className="text-xs font-bold text-green-700">{p.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">({p.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <Truck className="w-3 h-3" /> {p.delivery}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Package className="w-3 h-3" /> {p.stock} in stock
                  </div>
                </div>
                <div className="border-t border-gray-50 px-4 py-3 bg-orange-50/50">
                  <button className="w-full text-orange-600 font-semibold text-sm flex items-center justify-center gap-2 hover:gap-3 transition-all">
                    View & Compare Prices <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
