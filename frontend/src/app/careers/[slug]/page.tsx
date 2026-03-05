'use client';

import Link from 'next/link';
import { MapPin, Clock, ArrowLeft, Mail, Briefcase, CheckCircle2, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JobData {
  title: string;
  location: string;
  type: string;
  posted: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  compensation: string;
  emailSubject: string;
}

const jobs: Record<string, JobData> = {
  'gen-ai-intern': {
    title: 'Gen AI Intern',
    location: 'Remote',
    type: 'Internship (3-6 months)',
    posted: '3 days ago',
    about:
      'We\'re looking for someone who\'s genuinely curious about AI and wants to work on real products — not just tutorials. At Nirmaan, we\'re building a construction materials marketplace, and there\'s a lot of room to use AI in practical ways: helping customers find the right materials, automating supplier communication, building smarter search, and improving our cost estimator. You\'ll work directly with the founding team and ship things that actual users interact with.',
    responsibilities: [
      'Experiment with LLMs (OpenAI, open-source models) to build features like chatbot support, smart material suggestions, and order assistance',
      'Help improve our AI-powered construction cost estimator',
      'Write Python scripts and integrate AI APIs into our backend (FastAPI)',
      'Research and prototype new AI use cases relevant to construction and logistics',
      'Document what works, what doesn\'t, and why — so the team can learn from your experiments',
    ],
    requirements: [
      'Comfortable with Python — can write clean scripts without hand-holding',
      'Have used at least one LLM API (OpenAI, Anthropic, Hugging Face, etc.) in a project or experiment',
      'Basic understanding of REST APIs and how backend systems work',
      'Can work independently — you don\'t need someone assigning daily tasks',
      'Good written communication (we\'re a remote-first team, so async communication matters)',
    ],
    niceToHave: [
      'Familiar with LangChain, vector databases, or RAG pipelines',
      'Experience with FastAPI or any Python web framework',
      'Interest in construction, supply chain, or B2B marketplaces',
      'Have a portfolio, GitHub, or blog showing your AI work',
    ],
    compensation: 'Paid internship (₹10,000–15,000/month depending on experience). Can convert to a full-time role based on performance. Flexible working hours — we care about output, not hours logged.',
    emailSubject: 'Application – Gen AI Intern',
  },
  'delivery-coordinator': {
    title: 'Delivery Coordinator',
    location: 'Karimnagar / Peddapalli',
    type: 'Full-time',
    posted: '1 week ago',
    about:
      'This is a ground-level operations role. You\'ll be the link between our delivery partners and the customers waiting for their materials. Construction materials are heavy, deliveries can go wrong, and someone needs to make sure things run smoothly — that\'s you. It\'s not a desk job. Some days you\'ll be coordinating from your phone, other days you\'ll need to visit a site to sort out an issue. If you\'re the kind of person who stays calm when things get chaotic, this role will suit you.',
    responsibilities: [
      'Coordinate daily deliveries with drivers and transport partners across Peddapalli and Karimnagar districts',
      'Track dispatch status and update customers on delivery timelines (calls/SMS/WhatsApp)',
      'Handle delays, cancellations, and last-minute route changes',
      'Visit construction sites when there\'s a delivery dispute or quality complaint',
      'Work with the operations team to improve delivery processes over time',
      'Maintain delivery records and report daily status to the team',
    ],
    requirements: [
      'Based in or willing to relocate to Peddapalli / Karimnagar area',
      'Own a bike (two-wheeler) — essential for site visits',
      'Fluent in Telugu (mandatory) and Hindi (preferred)',
      'Comfortable making 30-50 phone calls a day — this is a communication-heavy role',
      'Can handle pressure and last-minute changes without panicking',
      'Smartphone with WhatsApp — most coordination happens there',
    ],
    niceToHave: [
      'Previous experience in logistics, delivery, or field operations',
      'Familiarity with construction materials (cement, steel, sand, bricks)',
      'Experience using any delivery tracking or logistics software',
      'Contacts with local transporters or truck drivers',
    ],
    compensation: '₹12,000–18,000/month depending on experience + travel allowance for site visits. Performance bonuses based on delivery targets.',
    emailSubject: 'Application – Delivery Coordinator',
  },
  'operations-executive': {
    title: 'Operations Executive',
    location: 'Peddapalli',
    type: 'Full-time',
    posted: '2 weeks ago',
    about:
      'You\'ll be at the centre of how Nirmaan works day-to-day. When a customer places an order, someone needs to confirm it with the supplier, negotiate pricing if needed, arrange pickup, and make sure the right materials reach the right site. That\'s this role. You\'ll spend most of your time on the phone — talking to suppliers, resolving pricing discrepancies, and sorting out issues before they become problems. It\'s not glamorous work, but it\'s the backbone of the business.',
    responsibilities: [
      'Process incoming orders — verify items, confirm pricing with suppliers, and coordinate dispatch',
      'Build and maintain relationships with local suppliers (cement dealers, steel distributors, sand suppliers)',
      'Negotiate pricing and payment terms with suppliers on behalf of Nirmaan',
      'Resolve order issues: wrong quantities, damaged materials, delayed shipments',
      'Update order status on the platform and keep customers informed',
      'Help onboard new suppliers — explain how Nirmaan works, set up their listings',
      'Track payments to suppliers and flag any discrepancies',
    ],
    requirements: [
      'Based in Peddapalli or nearby (this is an in-person role)',
      'Can communicate clearly in Telugu and Hindi — English is a plus but not required',
      'Comfortable with phone-based work — you\'ll be making and taking calls all day',
      'Basic computer/smartphone skills — can use WhatsApp, Excel, and learn our internal tools',
      'Reliable and organized — orders can\'t fall through the cracks',
      'Willing to learn the construction materials business from scratch',
    ],
    niceToHave: [
      'Experience in construction, building materials, or hardware supply',
      'Previous work in operations, procurement, or supply chain',
      'Local contacts with suppliers or contractors in Peddapalli / Karimnagar',
      'Experience with any CRM, ERP, or order management tool',
    ],
    compensation: '₹15,000–22,000/month depending on experience. Growth into a team lead or operations manager role as the company scales.',
    emailSubject: 'Application – Operations Executive',
  },
};

export default function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('');

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  if (!slug) return null;

  const job = jobs[slug];

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 max-w-md w-full">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Position Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">This job listing doesn&apos;t exist or may have been removed.</p>
          <Link href="/careers" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-all inline-block">View All Openings</Link>
        </div>
      </div>
    );
  }

  const mailtoLink = `mailto:careers@nirmaan.co?subject=${encodeURIComponent(job.emailSubject)}&body=${encodeURIComponent(`Hi Nirmaan team,\n\nI'm interested in the ${job.title} position.\n\n[Please attach your resume and write a few lines about yourself]\n\nThanks`)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/careers" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all openings
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type}</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Nirmaan</span>
          </div>
          <p className="text-slate-500 text-xs mt-3">Posted {job.posted}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* About the Role */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About This Role</h2>
          <p className="text-gray-600 leading-relaxed">{job.about}</p>
        </section>

        {/* What You'll Do */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">What You&apos;ll Do</h2>
          <ul className="space-y-2.5">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* What We're Looking For */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">What We&apos;re Looking For</h2>
          <ul className="space-y-2.5">
            {job.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Nice to Have */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Nice to Have</h2>
          <ul className="space-y-2.5">
            {job.niceToHave.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-500 text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Compensation */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Compensation</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{job.compensation}</p>
        </section>

        {/* Apply Section */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Apply for this Role</h2>
          <p className="text-gray-600 text-sm mb-4">
            Send us an email at <strong>careers@nirmaan.co</strong> with:
          </p>
          <ul className="text-gray-600 space-y-1.5 text-sm mb-5">
            <li>• Your resume (PDF preferred)</li>
            <li>• A few lines about yourself — what you&apos;ve done, what interests you about this role</li>
            <li>• Links to any relevant work (GitHub, portfolio, LinkedIn) if you have them</li>
          </ul>
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
          >
            <Mail className="w-5 h-5" /> Send Resume to careers@nirmaan.co
          </a>
          <p className="text-gray-400 text-xs mt-3">
            We try to respond within 3-5 business days. No automated screening — a real person reads every email.
          </p>
        </section>

        {/* Other openings */}
        <div className="text-center">
          <Link href="/careers" className="text-orange-600 font-semibold text-sm hover:underline">
            ← View all open positions
          </Link>
        </div>
      </div>
    </div>
  );
}
