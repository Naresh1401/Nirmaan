'use client';

import Link from 'next/link';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

const posts = [
  {
    slug: 'cement-prices-telangana-march-2026',
    title: 'Cement Prices in Telangana — March 2026 Update',
    date: 'Mar 1, 2026',
    readTime: '3 min',
    excerpt: 'OPC 53 grade is around ₹380-395 per bag across Karimnagar and Peddapalli this month. PPC is slightly cheaper at ₹360-380. Here\'s what we\'re seeing from suppliers on the platform.',
    category: 'Market Update',
  },
  {
    slug: 'how-to-estimate-cement-for-house',
    title: 'How Much Cement Do You Actually Need for a House?',
    date: 'Feb 18, 2026',
    readTime: '5 min',
    excerpt: 'The thumb rule is about 0.4 bags per sq ft for a standard residential building. But it depends on a lot of things — number of floors, slab thickness, soil type. Here\'s a more practical breakdown.',
    category: 'Guide',
  },
  {
    slug: 'river-sand-vs-msand',
    title: 'River Sand vs M-Sand: Which One Should You Use?',
    date: 'Feb 5, 2026',
    readTime: '4 min',
    excerpt: 'M-Sand is cheaper and more consistent in quality. River sand has better workability for plastering. Most contractors we talk to use a mix — M-Sand for concrete, river sand for plastering and brickwork.',
    category: 'Guide',
  },
  {
    slug: 'why-we-started-nirmaan',
    title: 'Why We Started Nirmaan',
    date: 'Jan 10, 2026',
    readTime: '6 min',
    excerpt: 'I\'ve watched my family deal with construction material suppliers for years. The pricing was always opaque, deliveries unreliable, and there was no way to compare without driving around town. That\'s what pushed us to build this.',
    category: 'Company',
  },
  {
    slug: 'tmt-steel-bar-grades-explained',
    title: 'TMT Steel Bar Grades: Fe415, Fe500, Fe550 — What\'s the Difference?',
    date: 'Dec 20, 2025',
    readTime: '4 min',
    excerpt: 'Fe500 is the most commonly used grade for residential construction in our area. Fe550 is stronger but less ductile — usually overkill for houses. Here\'s when to use what.',
    category: 'Guide',
  },
];

const categoryColors: Record<string, string> = {
  'Market Update': 'bg-blue-50 text-blue-700',
  'Guide': 'bg-green-50 text-green-700',
  'Company': 'bg-orange-50 text-orange-700',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Blog</h1>
          <p className="text-slate-300 text-lg">
            Practical stuff about construction materials — prices, guides, and what we&apos;re learning
            as we build Nirmaan.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime} read
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{post.excerpt}</p>
              <span className="text-orange-600 text-sm font-semibold flex items-center gap-1 cursor-pointer hover:gap-2 transition-all">
                Read more <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm">
            That&apos;s all we&apos;ve written so far. We&apos;ll add more as we go —
            mostly about material prices, construction tips, and updates on what we&apos;re building.
          </p>
        </div>
      </section>
    </div>
  );
}
