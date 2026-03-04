'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 pointer-events-none select-none opacity-[0.04]">
          <div className="absolute top-12 left-10 text-[200px] font-black text-gray-900 leading-none">निर्माण</div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          <p className="inline-block text-sm font-semibold tracking-widest uppercase text-orange-600 mb-4 bg-orange-100 px-4 py-1.5 rounded-full">
            About Nirmaan
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Building the Future of <br className="hidden md:block" />
            <span className="text-orange-600">Construction Supply</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Nirmaan — from the Sanskrit word meaning <em>creation</em> — is a customer-first platform
            that brings clarity, convenience, and confidence to every stage of construction material procurement in India.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="px-8 py-3.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20"
            >
              Explore Materials
            </Link>
            <Link
              href="/estimator"
              className="px-8 py-3.5 border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition"
            >
              Try AI Estimator
            </Link>
          </div>
        </div>
      </section>


      {/* ── Our Mission ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-600 mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Empowering every builder with the tools they deserve
            </h2>
          </div>
          <div className="space-y-5 text-gray-600 leading-relaxed">
            <p>
              Behind every home, every school, every road in India stands a builder who navigated
              a maze of phone calls, uncertain deliveries, and opaque supplier networks just to get
              the right materials on time.
            </p>
            <p>
              Nirmaan exists to change that story. Our mission is to make construction material
              procurement as simple, transparent, and reliable as ordering anything else online —
              so that builders, contractors, and homeowners can focus on what truly matters:
              <strong className="text-gray-900"> bringing their vision to life.</strong>
            </p>
          </div>
        </div>
      </section>


      {/* ── The Problem We Solve ── */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-600 mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Construction procurement is broken. <br className="hidden md:block" />
              We felt it too.
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              If you&apos;ve ever managed a construction project, these frustrations will feel painfully familiar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📞',
                title: 'Endless Phone Calls',
                text: 'Calling five different suppliers to compare availability, then calling back because nobody picked up. Sound familiar?',
              },
              {
                icon: '🔍',
                title: 'Zero Visibility',
                text: 'Once an order is placed, you\'re left guessing — when will it arrive? Is the right quantity loaded? Nobody seems to know.',
              },
              {
                icon: '🤷',
                title: 'Trust Deficit',
                text: 'How do you know if a new supplier is reliable? Quality inconsistencies, delayed deliveries, and broken promises are too common.',
              },
              {
                icon: '📋',
                title: 'Estimation Guesswork',
                text: 'Without accurate material estimates, builders either over-order and waste money, or under-order and stall the project.',
              },
              {
                icon: '🚚',
                title: 'Delivery Chaos',
                text: 'Coordinating trucks, scheduling unloading, and managing returns is a full-time job on top of an already demanding project.',
              },
              {
                icon: '⏰',
                title: 'Time Lost, Money Spent',
                text: 'Every day of delay at a construction site costs money. Inefficient procurement is the silent budget killer nobody talks about.',
              },
            ].map((problem) => (
              <div
                key={problem.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <span className="text-3xl">{problem.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{problem.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Our Solution ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-widest uppercase text-orange-600 mb-3">Our Solution</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            One platform. Complete clarity.
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Nirmaan connects you with verified suppliers, intelligent estimation tools, and coordinated delivery — all in one place.
          </p>
        </div>

        <div className="space-y-16">
          {[
            {
              step: '01',
              title: 'Discover & Compare',
              description:
                'Browse a curated marketplace of verified local suppliers. See ratings, reviews, and availability side by side — no more calling around.',
              highlights: ['Verified supplier profiles', 'Side-by-side comparison', 'Real customer reviews'],
            },
            {
              step: '02',
              title: 'Estimate with Confidence',
              description:
                'Our AI-powered estimator helps you calculate exactly how much cement, steel, sand, and bricks you need — based on your project\'s area, structure type, and quality preferences.',
              highlights: ['AI material calculator', 'Multiple quality tiers', 'Instant cost breakdowns'],
            },
            {
              step: '03',
              title: 'Order Seamlessly',
              description:
                'Place your order in minutes. Choose your preferred supplier, select a delivery window, and pay the way that works for you — UPI, credit, or cash on delivery.',
              highlights: ['Multiple payment options', 'Flexible delivery scheduling', 'Bulk order support'],
            },
            {
              step: '04',
              title: 'Track Everything',
              description:
                'From the moment your order is confirmed to the minute it reaches your site, you\'ll know exactly where your materials are and when they\'ll arrive.',
              highlights: ['Live delivery tracking', 'SMS & app notifications', 'Delivery partner details'],
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="flex-1">
                <span className="text-5xl font-black text-orange-100">{item.step}</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.description}</p>
                <ul className="mt-4 space-y-2">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl h-56 md:h-64 flex items-center justify-center border border-orange-100">
                  <span className="text-6xl opacity-60">
                    {['🛒', '🤖', '📱', '📍'][i]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── Why Customers Trust Nirmaan ── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-400 mb-3">Trust</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Why thousands of builders choose Nirmaan
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Trust isn&apos;t claimed — it&apos;s earned. Here&apos;s how we earn yours, every single day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🛡️',
                title: 'Verified Suppliers',
                text: 'Every supplier on Nirmaan is vetted for quality, reliability, and business credentials before they can list a single product.',
              },
              {
                icon: '🚚',
                title: 'Reliable Delivery',
                text: 'Our coordinated logistics network ensures your materials arrive when promised — not a day late, not a bag short.',
              },
              {
                icon: '🔍',
                title: 'Full Transparency',
                text: 'See real reviews, compare suppliers openly, and track every order in real time. No hidden surprises, ever.',
              },
              {
                icon: '🎯',
                title: 'Customer-First Design',
                text: 'Every feature we build starts with one question: does this make the customer\'s life easier? If not, we don\'t build it.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-800/60 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Social proof strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-700/50 pt-12 text-center">
            {[
              { stat: '1,800+', label: 'Registered Customers' },
              { stat: '42', label: 'Verified Suppliers' },
              { stat: '3,400+', label: 'Orders Delivered' },
              { stat: '4.5 ★', label: 'Average Rating' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl md:text-4xl font-extrabold text-orange-400">{item.stat}</p>
                <p className="text-sm text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Our Vision ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-10 border border-orange-100">
              <blockquote className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug italic">
                &ldquo;We envision a future where every builder in India — from the homeowner
                constructing their first house to the contractor managing a hundred sites —
                has access to a reliable, transparent, and effortless supply chain.&rdquo;
              </blockquote>
              <p className="mt-6 text-sm font-semibold text-orange-600 tracking-wide uppercase">
                The Nirmaan Team
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-600 mb-3">Our Vision</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Transforming how India builds — one order at a time
            </h2>
            <div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
              <p>
                India&apos;s construction industry is one of the largest in the world, yet it runs on
                fragmented networks, manual processes, and relationships built over phone calls.
                We believe technology can preserve the warmth of those relationships while
                removing the friction that holds everyone back.
              </p>
              <p>
                Our long-term vision goes beyond a marketplace. We&apos;re building an ecosystem
                where smart estimation tools, transparent supplier networks, coordinated
                logistics, and community knowledge come together to make construction
                procurement <strong className="text-gray-900">faster, fairer, and simpler</strong> for
                every stakeholder.
              </p>
              <p>
                We started in Peddapalli, Telangana — and we&apos;re just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── Values ── */}
      <section className="bg-orange-50/50">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-600 mb-3">What Guides Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Core Values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤝',
                title: 'Customer Obsession',
                text: 'Every decision we make begins and ends with the customer. Your success is our success.',
              },
              {
                icon: '🔎',
                title: 'Radical Transparency',
                text: 'We believe you deserve to see everything — supplier credentials, delivery status, community reviews — with nothing hidden.',
              },
              {
                icon: '🌱',
                title: 'Local First',
                text: 'We champion local suppliers and transport partners, strengthening the communities we operate in.',
              },
              {
                icon: '⚡',
                title: 'Simplicity as a Feature',
                text: 'Construction is complex enough. We obsess over making every interaction on Nirmaan feel effortless.',
              },
              {
                icon: '🔬',
                title: 'Continuous Innovation',
                text: 'From AI estimation to real-time tracking, we bring modern digital tools to an industry ready for transformation.',
              },
              {
                icon: '💪',
                title: 'Reliability Above All',
                text: 'When you place an order, you should never have to worry. We hold ourselves — and our partners — to the highest standards.',
              },
            ].map((value) => (
              <div key={value.title} className="flex gap-4">
                <span className="text-2xl mt-1 flex-shrink-0">{value.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{value.title}</h3>
                  <p className="mt-1 text-gray-500 text-sm leading-relaxed">{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA / Closing Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-orange-900">
        <div className="absolute inset-0 pointer-events-none select-none opacity-5">
          <div className="absolute bottom-0 right-0 text-[280px] font-black text-white leading-none -mb-20 -mr-10">🏗️</div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Your next project deserves <br className="hidden md:block" />
            a better way to build.
          </h2>

          <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Join thousands of builders, contractors, and homeowners who have already discovered
            a simpler, more reliable way to source construction materials. Nirmaan is here to
            make sure you never have to build alone.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-500 transition shadow-lg shadow-orange-600/30 text-lg"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              href="/suppliers/register"
              className="px-8 py-3.5 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition text-lg"
            >
              Become a Supplier
            </Link>
          </div>

          <p className="mt-12 text-sm text-gray-500">
            नमस्ते 🙏&ensp;·&ensp;Built with heart in Peddapalli, Telangana&ensp;·&ensp;Serving all of India
          </p>
        </div>
      </section>

    </div>
  );
}
