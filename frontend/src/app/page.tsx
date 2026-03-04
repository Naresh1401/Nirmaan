import Link from "next/link";
import {
  Search,
  Truck,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Building2,
  Package,
  Users,
  MapPin,
} from "lucide-react";

const CATEGORIES = [
  { name: "Cement", icon: "🧱", slug: "cement", count: "50+ products" },
  { name: "Sand & Gravel", icon: "⛱️", slug: "sand", count: "30+ suppliers" },
  { name: "Steel & TMT", icon: "🔩", slug: "steel", count: "40+ products" },
  { name: "Bricks", icon: "🏗️", slug: "bricks", count: "25+ suppliers" },
  { name: "Tiles", icon: "🔲", slug: "tiles", count: "100+ designs" },
  { name: "Paint", icon: "🎨", slug: "paint", count: "200+ colors" },
  { name: "Plumbing", icon: "🔧", slug: "plumbing", count: "80+ products" },
  { name: "Electrical", icon: "⚡", slug: "electrical", count: "120+ products" },
];

const STATS = [
  { label: "Suppliers", value: "500+", icon: Building2 },
  { label: "Products", value: "10,000+", icon: Package },
  { label: "Customers", value: "15,000+", icon: Users },
  { label: "Cities", value: "6", icon: MapPin },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Build Smarter with{" "}
              <span className="text-yellow-300">Nirmaan</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-orange-100">
              India&apos;s construction materials marketplace. Compare prices from
              verified suppliers, order online, and get reliable delivery to your
              construction site.
            </p>

            {/* Search Bar */}
            <div className="mt-10">
              <div className="flex items-center rounded-xl bg-white p-2 shadow-2xl">
                <MapPin className="ml-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your city (e.g., Peddapalli)"
                  className="flex-1 border-none px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <div className="mx-2 h-8 w-px bg-gray-200" />
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="flex-1 border-none px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <button className="btn-primary rounded-lg">
                  Search
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-orange-100">
              <span>Popular:</span>
              {["UltraTech Cement", "River Sand", "TMT Steel Bars", "Red Bricks"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/products?q=${encodeURIComponent(item)}`}
                    className="rounded-full border border-orange-200/30 px-3 py-1 transition hover:bg-white/10"
                  >
                    {item}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <stat.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
      <section className="bg-surface-secondary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <p className="mt-2 text-gray-600">
              Everything you need to build, all in one place
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group card flex flex-col items-center p-6 text-center transition-all hover:border-brand-300 hover:shadow-md"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-brand-600">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ─────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Nirmaan?
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <TrendingDown className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Best Prices</h3>
              <p className="mt-2 text-sm text-gray-600">
                Compare prices across multiple verified suppliers. Save 10-20%
                on your construction material costs.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Truck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Reliable Delivery</h3>
              <p className="mt-2 text-sm text-gray-600">
                Track your delivery in real-time. Specialized vehicles for every
                material type. On-time guaranteed.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <ShieldCheck className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Verified Suppliers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Every supplier is GST-verified with quality certifications.
                Weight verification on every delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="bg-surface-secondary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Search Materials",
                desc: "Enter your city and search for the materials you need",
              },
              {
                step: "2",
                title: "Compare & Order",
                desc: "Compare prices across suppliers and place your order",
              },
              {
                step: "3",
                title: "Track Delivery",
                desc: "Track your materials in real-time from pickup to delivery",
              },
              {
                step: "4",
                title: "Build with Confidence",
                desc: "Verified weight, quality photos, and rated suppliers",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to Build Smarter?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of builders who trust Nirmaan for their construction
            material needs.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/products" className="btn-primary text-base">
              Start Ordering <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/suppliers/register"
              className="btn-secondary bg-transparent text-white border-gray-600 hover:bg-gray-800 text-base"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
