'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search, Truck, ShieldCheck, TrendingDown, ArrowRight,
  Package, MapPin, Star, ChevronRight,
  Percent, Zap, Shield, CreditCard, BarChart3, Calculator,
  Phone, Award, CheckCircle2, Heart,
  ShoppingCart, Sparkles, IndianRupee, Factory
} from 'lucide-react';
import { useState } from 'react';

const categories = [
  { name: 'Cement', icon: '🏗️', slug: 'cement', count: '120+ Products', color: 'from-gray-700 to-gray-900' },
  { name: 'Sand', icon: '⏳', slug: 'sand', count: '45+ Products', color: 'from-amber-600 to-amber-800' },
  { name: 'Steel & TMT', icon: '🔩', slug: 'steel', count: '85+ Products', color: 'from-slate-600 to-slate-800' },
  { name: 'Bricks', icon: '🧱', slug: 'bricks', count: '60+ Products', color: 'from-red-600 to-red-800' },
  { name: 'Tiles', icon: '🔲', slug: 'tiles', count: '200+ Products', color: 'from-blue-600 to-blue-800' },
  { name: 'Paint', icon: '🎨', slug: 'paint', count: '150+ Products', color: 'from-purple-600 to-purple-800' },
  { name: 'Plumbing', icon: '🔧', slug: 'plumbing', count: '90+ Products', color: 'from-cyan-600 to-cyan-800' },
  { name: 'Electrical', icon: '⚡', slug: 'electrical', count: '110+ Products', color: 'from-yellow-600 to-yellow-800' },
  { name: 'Gravel', icon: '🪨', slug: 'gravel', count: '30+ Products', color: 'from-stone-600 to-stone-800' },
  { name: 'Tools', icon: '🛠️', slug: 'tools', count: '75+ Products', color: 'from-emerald-600 to-emerald-800' },
];

const trendingProducts = [
  { id: '1', name: 'UltraTech Cement (50kg)', price: 385, mrp: 420, supplier: 'Peddapalli Traders', rating: 4.5, reviews: 128, discount: 8, unit: 'bag' },
  { id: '4', name: 'JSW TMT Steel Bar (12mm)', price: 62500, mrp: 68000, supplier: 'Sri Steel Works', rating: 4.7, reviews: 89, discount: 8, unit: 'ton' },
  { id: '6', name: 'River Sand (Fine)', price: 2800, mrp: 3200, supplier: 'Godavari Sand Depot', rating: 4.3, reviews: 234, discount: 12, unit: 'ton' },
  { id: '8', name: 'Red Clay Bricks (1000pcs)', price: 6500, mrp: 7500, supplier: 'Kalyan Brick Works', rating: 4.6, reviews: 167, discount: 13, unit: 'lot' },
  { id: '2', name: 'ACC Cement (50kg)', price: 375, mrp: 410, supplier: 'Karimnagar Hardware', rating: 4.4, reviews: 95, discount: 9, unit: 'bag' },
  { id: '14', name: 'Crushed Stone 20mm', price: 1800, mrp: 2100, supplier: 'Rock Aggregates', rating: 4.2, reviews: 56, discount: 14, unit: 'ton' },
];

const deals = [
  { title: 'Bulk Cement Deal', desc: 'Order 100+ bags & save ₹15/bag', bg: 'from-orange-500 to-red-600', icon: '🏗️', savings: '₹1,500', category: 'cement' },
  { title: 'Steel Season Sale', desc: 'TMT bars at factory-direct prices', bg: 'from-blue-500 to-indigo-600', icon: '🔩', savings: '₹5,500/ton', category: 'steel' },
  { title: 'Sand + Gravel Combo', desc: 'Order together & save on delivery', bg: 'from-amber-500 to-orange-600', icon: '⏳', savings: '₹800', category: 'sand' },
  { title: 'First Order Bonus', desc: 'Flat ₹500 off on your first order', bg: 'from-green-500 to-emerald-600', icon: '🎁', savings: '₹500', category: '' },
];

const testimonials = [
  { name: 'Rajesh Kumar', role: 'Civil Contractor, Peddapalli', text: 'Nirmaan saved me 18% on my last project. Price comparison is a game-changer. I can see all supplier rates in one place.', rating: 5 },
  { name: 'Suresh Reddy', role: 'Builder, Karimnagar', text: 'Delivery tracking gives me exact ETAs. No more waiting around at the site for material trucks. Highly recommended!', rating: 5 },
  { name: 'Priya Housing Ltd.', role: 'Real Estate Developer', text: 'Bulk ordering with supplier splitting is brilliant. We order 500 tons of material monthly through Nirmaan seamlessly.', rating: 4 },
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
                <span>Serving 15,000+ builders across Telangana</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Build Smarter.<br /><span className="text-yellow-200">Save More.</span>
              </h1>
              <p className="text-xl text-orange-100 mb-8 max-w-lg">
                India&apos;s first construction materials marketplace. Compare prices from 500+ verified suppliers. Get materials delivered to your site.
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
                  { label: 'Suppliers', value: '500+', icon: Factory },
                  { label: 'Products', value: '10,000+', icon: Package },
                  { label: 'Deliveries', value: '25,000+', icon: Truck },
                  { label: 'Cities', value: '6', icon: MapPin },
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
          <span>New: Business Credit now available! Get up to ₹5,00,000 credit limit for your construction projects</span>
          <Link href={isAuthenticated ? '/credit' : '/login'} className="underline hover:text-yellow-200 flex items-center gap-1">Apply Now <ArrowRight className="w-3 h-3" /></Link>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2><p className="text-gray-500 mt-1">Everything you need to build, under one roof</p></div>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Builders Choose Nirmaan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We solve every major pain point in construction material procurement</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Price Transparency', desc: 'Compare real-time prices from multiple suppliers. View 30-day price history & trends. Never overpay again.', color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/products' },
              { icon: Package, title: 'Inventory Visibility', desc: 'See real-time stock levels across all suppliers. No more wasted trips to out-of-stock dealers.', color: 'text-green-400', bg: 'bg-green-400/10', href: '/products' },
              { icon: Truck, title: 'Reliable Delivery', desc: 'GPS-tracked deliveries with exact ETAs. Combined delivery for multiple materials to save cost.', color: 'text-orange-400', bg: 'bg-orange-400/10', href: '/delivery/register' },
              { icon: Calculator, title: 'Smart Estimator', desc: 'AI-powered material calculator. Enter your project size, get exact material requirements instantly.', color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/estimator' },
              { icon: CreditCard, title: 'Business Credit', desc: 'Get up to ₹5L credit line. Buy now, pay in 30/60/90 days. Digital invoices & payment tracking.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/credit' },
              { icon: Shield, title: 'Quality Assured', desc: 'All suppliers verified. Material certifications verified. Weight verification at pickup & delivery.', color: 'text-red-400', bg: 'bg-red-400/10', href: '/suppliers' },
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Order in 4 Simple Steps</h2>
          <p className="text-gray-500">From search to delivery — it just works</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Search & Compare', desc: 'Browse materials, compare prices across suppliers, check ratings & reviews', icon: Search, color: 'bg-orange-500', href: '/products' },
            { step: '02', title: 'Add to Cart & Order', desc: 'Select quantity, choose delivery slot, apply bulk discounts automatically', icon: ShoppingCart, color: 'bg-blue-500', href: '/cart' },
            { step: '03', title: 'Track in Real-Time', desc: 'GPS-tracked delivery from warehouse to your construction site', icon: MapPin, color: 'bg-green-500', href: '/orders' },
            { step: '04', title: 'Verify & Accept', desc: 'Check weight, quality verification, rate your experience', icon: CheckCircle2, color: 'bg-purple-500', href: '/orders' },
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

      {/* TESTIMONIALS */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Trusted by Builders</h2>
            <p className="text-gray-500">Real feedback from contractors using Nirmaan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-5 h-5 fill-orange-400 text-orange-400" />))}</div>
                <p className="text-gray-700 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">{t.name[0]}</div>
                  <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPLIER CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">Are You a Supplier?</h2>
            <p className="text-blue-100 text-lg mb-6">Join 500+ suppliers on Nirmaan. Get discovered by thousands of contractors. Zero listing fees for the first 3 months.</p>
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
              { label: 'Avg Monthly Revenue', value: '₹2.5L+' },
              { label: 'New Customers/Month', value: '30+' },
              { label: 'Platform Commission', value: '2-5%' },
              { label: 'Payment Settlement', value: 'T+1 Day' },
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Build Smarter?</h2>
          <p className="text-orange-100 text-xl mb-8 max-w-2xl mx-auto">Join 15,000+ builders who save time and money on every construction project with Nirmaan.</p>
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
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> 1800-NIRMAAN</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Peddapalli, Telangana</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Since 2024</span>
          </div>
        </div>
      </section>
    </div>
  );
}
