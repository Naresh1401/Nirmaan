'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search, Truck, ShieldCheck, TrendingDown, ArrowRight,
  Package, MapPin, Star, ChevronRight,
  Percent, Zap, Shield, CreditCard, BarChart3, Calculator,
  Award, CheckCircle2, Heart, Check,
  ShoppingCart, Sparkles, IndianRupee, Factory
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const categories = [
  { name: 'Cement', icon: '🏗️', slug: 'cement', count: '15 brands', color: 'from-gray-700 to-gray-900' },
  { name: 'Sand', icon: '⏳', slug: 'sand', count: 'River & M-Sand', color: 'from-amber-600 to-amber-800' },
  { name: 'Steel & TMT', icon: '🔩', slug: 'steel', count: '8mm–25mm bars', color: 'from-slate-600 to-slate-800' },
  { name: 'Bricks', icon: '🧱', slug: 'bricks', count: 'Clay & Fly Ash', color: 'from-red-600 to-red-800' },
  { name: 'Tiles', icon: '🔲', slug: 'tiles', count: 'Floor & Wall', color: 'from-blue-600 to-blue-800' },
  { name: 'Paint', icon: '🎨', slug: 'paint', count: 'Interior & Exterior', color: 'from-purple-600 to-purple-800' },
  { name: 'Plumbing', icon: '🔧', slug: 'plumbing', count: 'Pipes & Fittings', color: 'from-cyan-600 to-cyan-800' },
  { name: 'Electrical', icon: '⚡', slug: 'electrical', count: 'Wires & Switches', color: 'from-yellow-600 to-yellow-800' },
  { name: 'Granite', icon: '⬛', slug: 'granite', count: 'Blocks & Slabs', color: 'from-neutral-700 to-neutral-900' },
  { name: 'Gravel', icon: '🪨', slug: 'gravel', count: '6mm–40mm Grades', color: 'from-stone-600 to-stone-800' },
  { name: 'Tools', icon: '🛠️', slug: 'tools', count: 'Hand & Power', color: 'from-emerald-600 to-emerald-800' },
];

const trendingProducts = [
  { id: '1', name: 'UltraTech Cement (50kg)', price: 385, mrp: 420, supplier: 'Peddapalli Traders', rating: 4.5, reviews: 128, discount: 8, unit: 'bag' },
  { id: '4', name: 'JSW TMT Steel Bar (12mm)', price: 62500, mrp: 68000, supplier: 'Sri Steel Works', rating: 4.7, reviews: 89, discount: 8, unit: 'ton' },
  { id: '6', name: 'River Sand (Fine)', price: 2800, mrp: 3200, supplier: 'Godavari Sand Depot', rating: 4.3, reviews: 234, discount: 12, unit: 'ton' },
  { id: '8', name: 'Red Clay Bricks (1000pcs)', price: 6500, mrp: 7500, supplier: 'Kalyan Brick Works', rating: 4.6, reviews: 167, discount: 13, unit: 'lot' },
  { id: '2', name: 'ACC Cement (50kg)', price: 375, mrp: 410, supplier: 'Karimnagar Hardware', rating: 4.4, reviews: 95, discount: 9, unit: 'bag' },
  { id: '14', name: 'Crushed Stone 20mm', price: 1800, mrp: 2100, supplier: 'Rock Aggregates', rating: 4.2, reviews: 56, discount: 14, unit: 'ton' },
  { id: '16', name: 'Black Granite (Polished)', price: 85, mrp: 110, supplier: 'Telangana Granite Works', rating: 4.6, reviews: 74, discount: 23, unit: 'sqft' },
  { id: '25', name: 'Gravel 20mm (Medium Grade)', price: 1800, mrp: 2100, supplier: 'Rock Aggregates', rating: 4.4, reviews: 92, discount: 14, unit: 'ton' },
];

const deals = [
  { title: 'Bulk Cement Deal', desc: 'Order 100+ bags & save ₹15/bag', bg: 'from-orange-500 to-red-600', icon: '🏗️', savings: '₹1,500', category: 'cement' },
  { title: 'Steel Season Sale', desc: 'TMT bars at factory-direct prices', bg: 'from-blue-500 to-indigo-600', icon: '🔩', savings: '₹5,500/ton', category: 'steel' },
  { title: 'Sand + Gravel Combo', desc: 'Order together & save on delivery', bg: 'from-amber-500 to-orange-600', icon: '⏳', savings: '₹800', category: 'sand' },
  { title: 'First Order Bonus', desc: 'Flat ₹500 off on your first order', bg: 'from-green-500 to-emerald-600', icon: '🎁', savings: '₹500', category: '' },
];

const testimonials = [
  { name: 'Rajesh K.', role: 'Contractor, Peddapalli', text: 'Comparing rates across different suppliers used to take me a full day. Now I can see everything in one place and just order. Saved decent money on cement for my last project.', rating: 4 },
  { name: 'Suresh R.', role: 'Builder, Karimnagar', text: 'The delivery tracking is what I use most. I know exactly when the truck is coming so I can plan my labour accordingly. Much better than calling the supplier 5 times.', rating: 5 },
  { name: 'Mahesh B.', role: 'Home Builder, Ramagundam', text: 'Built my own house through this. The material estimator helped me figure out quantities, and the credit option gave me some breathing room on payments. Still learning the app but it works.', rating: 4 },
  { name: 'Venkatesh P.', role: 'Civil Engineer, Warangal', text: 'We ordered 40 tons of gravel and 200 bags of cement for a commercial site. Nirmaan\'s prices were genuinely lower than what our regular dealer offered. Delivery was on time both days.', rating: 5 },
  { name: 'Lakshmi D.', role: 'Interior Designer, Hanamkonda', text: 'I use Nirmaan mainly for granite and tiles. The Kashmir White granite I ordered came in perfect condition. Being able to compare across 3-4 suppliers from my phone saves a lot of running around.', rating: 4 },
  { name: 'Srinivas G.', role: 'Contractor, Godavarikhani', text: 'Started using this 6 months back. The credit line they gave us after a few orders really helps with cash flow. I don\'t have to pay everything upfront for materials anymore.', rating: 5 },
  { name: 'Ramana T.', role: 'Builder, Mancherial', text: 'Good for bulk sand and gravel orders. The tipper arrives when they say it will. Only thing I wish is they had more suppliers for steel in my area.', rating: 4 },
  { name: 'Anil M.', role: 'Site Supervisor, Peddapalli', text: 'My contractor asked me to start ordering through Nirmaan. The invoice is clean, delivery is trackable, and I don\'t have to chase suppliers for receipts. Makes my job simpler.', rating: 5 },
  { name: 'Prasad K.', role: 'Mason, Karimnagar', text: 'I ordered fly ash bricks for a small extension job. Price was fair and they delivered same day. The app is easy enough to use even for someone like me who isn\'t very tech-savvy.', rating: 4 },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Peddapalli');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Now delivering across Peddapalli &amp; Karimnagar districts</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Construction Materials,<br /><span className="text-yellow-200">Delivered Right.</span>
              </h1>
              <p className="text-xl text-orange-100 mb-8 max-w-lg">
                Compare prices from local verified suppliers. Order cement, steel, sand and more — delivered straight to your construction site.
              </p>
              <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="bg-transparent text-gray-700 font-medium outline-none text-sm">
                    <option>Peddapalli</option>
                    <option>Karimnagar</option>
                    <option>Ramagundam</option>
                    <option>Warangal</option>
                    <option>Hyderabad</option>
                  </select>
                </div>
                <div className="flex items-center flex-1 gap-2 px-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search cement, sand, steel, bricks..." className="flex-1 outline-none text-gray-700 placeholder-gray-400 py-2" />
                </div>
                <Link href={isAuthenticated ? `/products?q=${searchQuery}&city=${selectedCity}` : '/login'} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Search
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: 'Suppliers', value: '50+', icon: Factory },
                  { label: 'Materials', value: '800+', icon: Package },
                  { label: 'Deliveries', value: '1,200+', icon: Truck },
                  { label: 'Districts', value: '5', icon: MapPin },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-white/90">
                    <s.icon className="w-5 h-5 text-yellow-200" />
                    <div><p className="font-bold text-lg">{s.value}</p><p className="text-xs text-orange-200">{s.label}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: TrendingDown, title: 'Best Prices', desc: 'Compare across suppliers', href: '/products' },
                { icon: Truck, title: 'Fast Delivery', desc: 'Same-day to your site', href: '/orders' },
                { icon: ShieldCheck, title: 'Quality Verified', desc: 'Certified materials', href: '/suppliers' },
                { icon: CreditCard, title: 'Business Credit', desc: 'Buy now, pay later', href: '/credit' },
              ].map(f => (
                <Link key={f.title} href={isAuthenticated ? f.href : '/login'} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                  <f.icon className="w-10 h-10 text-yellow-200 mb-3" />
                  <h3 className="text-white font-bold text-lg">{f.title}</h3>
                  <p className="text-orange-100 text-sm mt-1">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 text-sm font-medium">
          <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Business Credit now available — apply for a credit line and pay for materials in 30/60/90 days</span>
          <Link href={isAuthenticated ? '/credit' : '/login'} className="underline hover:text-yellow-200 flex items-center gap-1">Apply Now <ArrowRight className="w-3 h-3" /></Link>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2><p className="text-gray-500 mt-1">Browse materials from suppliers near you</p></div>
          <Link href={isAuthenticated ? '/products' : '/login'} className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 text-sm">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link key={cat.slug} href={isAuthenticated ? `/products?category=${cat.slug}` : '/login'} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className={`bg-gradient-to-br ${cat.color} h-32 flex items-center justify-center`}>
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.count}</p>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-3 h-3 text-orange-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DEALS */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-100 rounded-full p-2"><Percent className="w-6 h-6 text-red-600" /></div>
            <div><h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Today&apos;s Deals</h2><p className="text-gray-500 text-sm">Limited-time offers on bulk orders</p></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((d, i) => (
              <Link key={i} href={isAuthenticated ? `/products${d.category ? `?category=${d.category}` : ''}` : '/login'} className={`bg-gradient-to-br ${d.bg} rounded-2xl p-6 text-white hover:scale-[1.02] transition-transform shadow-lg`}>
                <span className="text-4xl mb-3 block">{d.icon}</span>
                <h3 className="font-bold text-lg">{d.title}</h3>
                <p className="text-white/80 text-sm mt-1">{d.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">Save {d.savings}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-full p-2"><TrendingDown className="w-6 h-6 text-orange-600" /></div>
            <div><h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Prices Near You</h2><p className="text-gray-500 text-sm">Lowest rates from verified suppliers in {selectedCity}</p></div>
          </div>
          <Link href={isAuthenticated ? '/products' : '/login'} className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 text-sm">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendingProducts.map((p, i) => (
            <Link key={i} href={isAuthenticated ? `/products/${p.id}` : '/login'} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">{p.discount}% OFF</div>
                  <button className="text-gray-300 hover:text-red-500 transition-colors"><Heart className="w-5 h-5" /></button>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{p.name}</h3>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1"><Factory className="w-3 h-3" /> {p.supplier}</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-extrabold text-gray-900 flex items-center"><IndianRupee className="w-5 h-5" />{p.price.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 line-through text-sm">₹{p.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500">/{p.unit}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-orange-400 text-orange-400" /><span className="text-sm font-semibold text-gray-700">{p.rating}</span></div>
                  <span className="text-xs text-gray-400">({p.reviews} reviews)</span>
                  <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium"><Truck className="w-3 h-3" /> Same-day</div>
                </div>
              </div>
              <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedCity}</span>
                <span className="text-orange-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  {isAuthenticated ? 'View Details' : 'Login to Order'} <ShoppingCart className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY NIRMAAN */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Use Nirmaan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A few things we&apos;re building to make material buying simpler</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Compare Prices', desc: 'See rates from multiple suppliers side by side. Check what others are paying in your area before you order.', color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/products' },
              { icon: Package, title: 'Check Availability', desc: 'Know what\'s in stock before placing an order. We update availability from suppliers regularly.', color: 'text-green-400', bg: 'bg-green-400/10', href: '/products' },
              { icon: Truck, title: 'Tracked Delivery', desc: 'Track your material truck with GPS. Get updates when it\'s picked up, on the way, and at your site.', color: 'text-orange-400', bg: 'bg-orange-400/10', href: '/delivery/register' },
              { icon: Calculator, title: 'Material Estimator', desc: 'Enter your room/house dimensions and get a rough bill of quantities. Useful for planning before you order.', color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/estimator' },
              { icon: CreditCard, title: 'Business Credit', desc: 'Eligible businesses can get a credit line and pay for materials later. Apply online, approval in 24-48 hours.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/credit' },
              { icon: Shield, title: 'Verified Suppliers', desc: 'We check GST registration, go through past reviews, and verify the supplier before listing them on the platform.', color: 'text-red-400', bg: 'bg-red-400/10', href: '/suppliers' },
            ].map(f => (
              <Link key={f.title} href={isAuthenticated ? f.href : '/login'} className={`${f.bg} border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer group`}>
                <f.icon className={`w-10 h-10 ${f.color} mb-4`} />
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-orange-300 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3 text-slate-500 group-hover:text-orange-400 transition-colors">Learn more <ArrowRight className="w-3 h-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500">Place an order in a few minutes, track it till delivery</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Search Materials', desc: 'Pick what you need — cement, steel, sand, bricks. Compare prices from different suppliers.', icon: Search, color: 'bg-orange-500', href: '/products' },
            { step: '02', title: 'Place Your Order', desc: 'Add to cart, pick a delivery time that works, and choose how you want to pay.', icon: ShoppingCart, color: 'bg-blue-500', href: '/cart' },
            { step: '03', title: 'Track Delivery', desc: 'Follow your truck on the map. You\'ll get updates as it moves towards your site.', icon: MapPin, color: 'bg-green-500', href: '/orders' },
            { step: '04', title: 'Receive & Verify', desc: 'Check the material at your site. Confirm delivery and rate the supplier.', icon: CheckCircle2, color: 'bg-purple-500', href: '/orders' },
          ].map(s => (
            <Link key={s.step} href={isAuthenticated ? s.href : '/login'} className="relative group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all h-full">
                <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-gray-300 mb-2">STEP {s.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — Floating Marquee */}
      <section className="bg-orange-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">What Our Users Say</h2>
            <p className="text-gray-500">Feedback from contractors and builders in Telangana</p>
          </div>
        </div>
        {/* Row 1 — scrolls left */}
        <div className="relative mb-5">
          <div className="flex gap-5 animate-marquee-left hover:[animation-play-state:paused]">
            {[...testimonials.slice(0, 5), ...testimonials.slice(0, 5)].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 min-w-[340px] max-w-[340px] flex-shrink-0">
                <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 fill-orange-400 text-orange-400" />))}{Array.from({ length: 5 - t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 text-gray-200" />))}</div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">{t.name[0]}</div>
                  <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 — scrolls right */}
        <div className="relative">
          <div className="flex gap-5 animate-marquee-right hover:[animation-play-state:paused]">
            {[...testimonials.slice(4), ...testimonials.slice(4)].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 min-w-[340px] max-w-[340px] flex-shrink-0">
                <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 fill-orange-400 text-orange-400" />))}{Array.from({ length: 5 - t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 text-gray-200" />))}</div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">{t.name[0]}</div>
                  <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM PROMOTION BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-amber-900/30 to-slate-800 border border-amber-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  👑 NEW — NirmaaN Premium
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Build More. Save More.<br />
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Premium is Here.</span>
                </h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg">
                  Unlock up to 15% off all orders, free delivery, AI civil engineering consultant,
                  3x loyalty points, and a dedicated account manager.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {['Up to 15% discount', 'Free delivery', 'AI Consultant', 'Loyalty rewards', '500 welcome points'].map(b => (
                    <span key={b} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> {b}
                    </span>
                  ))}
                </div>
                <Link href="/premium" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-xl text-lg">
                  👑 Explore Premium Plans
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-5 w-full lg:w-64 flex-shrink-0">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-3">Starting at just</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white font-extrabold text-4xl">₹499</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <p className="text-slate-400 text-xs mb-4">Save up to ₹7,989 with yearly plan</p>
                <div className="space-y-2">
                  {[
                    { tier: '🥈 Silver', price: '₹499/mo' },
                    { tier: '🥇 Gold', price: '₹999/mo' },
                    { tier: '💎 Platinum', price: '₹2,499/mo' },
                  ].map(p => (
                    <div key={p.tier} className="flex justify-between text-xs text-slate-300">
                      <span>{p.tier}</span>
                      <span className="text-amber-400 font-semibold">{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPLIER CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">Are You a Supplier?</h2>
            <p className="text-blue-100 text-lg mb-6">List your materials on Nirmaan and reach contractors across Telangana. Currently onboarding suppliers — no listing fees while we grow.</p>
            <div className="flex flex-wrap gap-4 mb-6">
              {['Digital Storefront', 'Order Management', 'Payment Tracking', 'Business Analytics'].map(f => (
                <span key={f} className="bg-white/20 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {f}</span>
              ))}
            </div>
            <Link href={isAuthenticated ? '/suppliers/register' : '/register'} className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Start Selling <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-white w-full lg:w-80">
            <h3 className="font-bold text-xl mb-4">Supplier Benefits</h3>
            {[
              { label: 'Avg Order Size', value: '₹35K' },
              { label: 'Active Buyers', value: 'Growing' },
              { label: 'Commission', value: '2-5%' },
              { label: 'Settlement', value: 'T+1 Day' },
            ].map(b => (
              <div key={b.label} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <span className="text-blue-100 text-sm">{b.label}</span><span className="font-bold text-lg">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-orange-500 to-red-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Try Nirmaan for Your Next Order</h2>
          <p className="text-orange-100 text-xl mb-8 max-w-2xl mx-auto">Create a free account, browse materials, and see if the prices work for you. No commitments.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link href="/register" className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-orange-50 transition-colors text-lg flex items-center justify-center gap-2 shadow-xl">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg">Login</Link>
              </>
            ) : (
              <Link href="/products" className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-orange-50 transition-colors text-lg flex items-center justify-center gap-2 shadow-xl">
                Start Ordering <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 text-white/80 text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Peddapalli, Telangana</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Started 2024</span>
          </div>
        </div>
      </section>
    </div>
  );
}
