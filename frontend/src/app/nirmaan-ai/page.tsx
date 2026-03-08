'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Send, User, Crown, Sparkles, RotateCcw,
  Copy, Check, Lock, ArrowRight,
  ShoppingCart, Truck, CreditCard, Building2,
  HardHat, Leaf, ChevronDown, ChevronUp,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ═══ Types ═══ */
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  queriesRemaining?: number;
}

/* ═══ Quick prompts by domain ═══ */
const DOMAINS = [
  {
    icon: ShoppingCart,
    label: 'Materials & Prices',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    prompts: [
      'Current cement prices in Telangana',
      'What grades of TMT steel are available?',
      'Compare AAC blocks vs red bricks',
    ],
  },
  {
    icon: Building2,
    label: 'Cost Estimation',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    prompts: [
      'Materials needed for 1500 sqft house',
      'Construction cost for 2000 sqft, 2 floors',
      'Budget for a 30×40 site',
    ],
  },
  {
    icon: Truck,
    label: 'Orders & Delivery',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    prompts: [
      'How to place an order on Nirmaan',
      'Delivery charges and timeline',
      'Same-day delivery availability',
    ],
  },
  {
    icon: CreditCard,
    label: 'Nirmaan Credit',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    prompts: [
      'How does Nirmaan Credit work?',
      'Eligibility for construction credit',
      'Loyalty points and rewards',
    ],
  },
  {
    icon: HardHat,
    label: 'Engineering',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    prompts: [
      'Foundation type for soft clay soil',
      'Structural design guide for beams',
      'Seismic zone for Karimnagar',
    ],
  },
  {
    icon: Leaf,
    label: 'Sustainability',
    color: 'text-green-600 bg-green-50 border-green-200',
    prompts: [
      'Green material alternatives for construction',
      'How to reduce construction carbon footprint',
      'IGBC green building certification',
    ],
  },
];

const QUICK_STARTERS = [
  { icon: '🏗️', text: 'What materials do I need for a 1500 sqft house?' },
  { icon: '💰', text: 'Construction cost for 2000 sqft, standard quality' },
  { icon: '📦', text: 'Current prices for cement and steel' },
  { icon: '🛒', text: 'How to place an order on Nirmaan' },
  { icon: '💳', text: 'Tell me about Nirmaan Credit' },
  { icon: '⚖️', text: 'Compare OPC vs PPC cement' },
  { icon: '🪨', text: 'Foundation recommendation for black cotton soil' },
  { icon: '🌱', text: 'Sustainable material options for my house' },
];

/* ═══ Markdown renderer ═══ */
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => {
        const trimmed = line.trimStart();

        // Table rendering
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (i > 0 && lines[i - 1].trim().startsWith('|') && lines[i - 1].trim().endsWith('|')) return null;
          let tableEnd = i;
          while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|') && lines[tableEnd].trim().endsWith('|')) tableEnd++;
          const tableLines = lines.slice(i, tableEnd);
          const headerCells = tableLines[0].split('|').filter(c => c.trim());
          const isSep = (l: string) => /^\|[\s-:|]+\|$/.test(l.trim());
          const dataLines = tableLines.filter((_, idx) => idx > 0 && !isSep(tableLines[idx]));
          return (
            <div key={i} className="overflow-x-auto my-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50 to-amber-50">
                    {headerCells.map((cell, ci) => (
                      <th key={ci} className="border border-orange-200 px-2 py-1.5 text-left font-semibold text-orange-800">{cell.trim()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataLines.map((row, ri) => {
                    const cells = row.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
                    return (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        {cells.map((cell, ci) => (
                          <td key={ci} className="border border-gray-200 px-2 py-1 text-gray-700 text-xs">
                            {cell.trim().split(/(\*\*.*?\*\*)/).map((part, pi) =>
                              part.startsWith('**') && part.endsWith('**')
                                ? <strong key={pi} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
                                : <span key={pi}>{part}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Headings
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold text-gray-900 mt-3 mb-1.5">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-lg font-bold text-gray-900 mt-3 mb-2">{trimmed.slice(2)}</h1>;
        }

        // Horizontal rule
        if (trimmed === '---') return <hr key={i} className="border-gray-200 my-2" />;

        // Code block
        if (trimmed.startsWith('```')) {
          let end = i + 1;
          while (end < lines.length && !lines[end].trim().startsWith('```')) end++;
          const codeLines = lines.slice(i + 1, end);
          return (
            <pre key={i} className="bg-gray-900 text-green-300 rounded-lg p-3 text-xs overflow-x-auto my-2 font-mono leading-relaxed">
              {codeLines.join('\n')}
            </pre>
          );
        }
        if (i > 0 && lines[i - 1].trim().startsWith('```') && !trimmed.startsWith('```')) return null;
        if (trimmed.startsWith('```')) return null;

        // List items
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
          const checked = trimmed.startsWith('- [x] ');
          const content = trimmed.slice(6);
          return (
            <div key={i} className="flex items-start gap-2 my-0.5 ml-3">
              <span className={`mt-0.5 text-xs ${checked ? 'text-green-600' : 'text-gray-400'}`}>{checked ? '✅' : '☐'}</span>
              <span className="text-sm text-gray-700">{content}</span>
            </div>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.slice(2);
          return (
            <div key={i} className="flex items-start gap-2 my-0.5 ml-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
              <span className="text-sm text-gray-700">
                {content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/).map((part, pi) => {
                  if (part.startsWith('**') && part.endsWith('**'))
                    return <strong key={pi} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                  const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                  if (linkMatch)
                    return <Link key={pi} href={linkMatch[2]} className="text-orange-600 hover:underline font-medium">{linkMatch[1]}</Link>;
                  return <span key={pi}>{part}</span>;
                })}
              </span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2 my-0.5 ml-2">
              <span className="mt-0.5 text-xs font-bold text-orange-600 shrink-0 w-4">{numMatch[1]}.</span>
              <span className="text-sm text-gray-700">
                {numMatch[2].split(/(\*\*.*?\*\*)/).map((part, pi) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={pi} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                    : <span key={pi}>{part}</span>
                )}
              </span>
            </div>
          );
        }

        // Bold / inline links
        if (trimmed) {
          return (
            <p key={i} className="text-sm text-gray-700 leading-relaxed my-0.5">
              {trimmed.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`|\*.*?\*)/).map((part, pi) => {
                if (part.startsWith('**') && part.endsWith('**'))
                  return <strong key={pi} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                if (part.startsWith('`') && part.endsWith('`'))
                  return <code key={pi} className="bg-gray-100 text-orange-700 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
                const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                if (linkMatch)
                  return <Link key={pi} href={linkMatch[2]} className="text-orange-600 hover:underline font-medium">{linkMatch[1]}</Link>;
                if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**'))
                  return <em key={pi} className="italic text-gray-500">{part.slice(1, -1)}</em>;
                return <span key={pi}>{part}</span>;
              })}
            </p>
          );
        }
        return <div key={i} className="h-1.5" />;
      })}
    </div>
  );
}

/* ═══ Copy button ═══ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Copy response">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ═══ Domain accordion ═══ */
function DomainCard({ domain, onSelect }: { domain: typeof DOMAINS[0]; onSelect: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const Icon = domain.icon;
  return (
    <div className={`border rounded-xl overflow-hidden ${domain.color.split(' ').slice(1).join(' ')} transition-all`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${domain.color.split(' ')[0]}`} />
          <span className="text-xs font-semibold text-gray-700">{domain.label}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-3 pb-2 flex flex-col gap-1.5 border-t border-current/10">
          {domain.prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSelect(p)}
              className="text-left text-xs text-gray-600 hover:text-gray-900 py-1 hover:underline transition-colors"
            >
              → {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function NirmaanAIPage() {
  const { user, isAuthenticated, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPremium = !!(user?.membership_tier && user.membership_tier !== 'free');

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (isPremium && messages.length === 0) {
      setMessages([{
        id: 1,
        role: 'assistant',
        content: (
          `🤖 **Nirmaan AI** — *Welcome!*\n\n` +
          `## 🙏 Namaste! I'm **Nirmaan AI** — your construction companion.\n\n` +
          `I'm here to make your construction journey easier, smarter, and more cost-effective.\n\n` +
          `**I can help you with:**\n\n` +
          `🏗️ **Materials & Prices** — Cement, steel, sand, bricks, tiles, pipes and more\n\n` +
          `💰 **Cost Estimation** — Budgets for houses, commercial buildings, roads\n\n` +
          `🛒 **Platform Help** — Ordering, delivery tracking, suppliers, Nirmaan Credit\n\n` +
          `📐 **Engineering Guidance** — Structural rules, foundation types, IS codes\n\n` +
          `🌱 **Sustainability** — Green materials, carbon reduction, certifications\n\n` +
          `Ask me anything — try one of the quick starts below or type your own question!`
        ),
        timestamp: new Date(),
        suggestions: [
          'Materials needed for 1500 sqft house',
          'Current cement and steel prices',
          'How to order on Nirmaan',
          'Foundation for soft clay',
        ],
      }]);
    }
  }, [isPremium, messages.length]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !token) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/nirmaan-ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        const content = res.status === 429
          ? `⚠️ **Daily query limit reached** for your ${user?.membership_tier || 'current'} plan.\n\nUpgrade to a higher tier for more daily AI queries.\n\n[Upgrade Plan](/premium)`
          : res.status === 403
            ? `🔒 **Nirmaan AI requires a Premium subscription.**\n\nUpgrade at [/premium](/premium) to unlock unlimited AI assistance.`
            : `⚠️ Something went wrong: ${err.detail || 'Please try again.'}`;

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content,
          timestamp: new Date(),
        }]);
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        suggestions: data.suggestions,
        queriesRemaining: data.queries_remaining,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ Unable to reach Nirmaan AI. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.membership_tier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /* ── Not logged in ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nirmaan AI</h1>
          <p className="text-gray-500 mb-6">Sign in to access your intelligent construction assistant</p>
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            Sign In
          </Link>
          <Link href="/register" className="block mt-3 text-sm text-orange-600 hover:underline">
            New to Nirmaan? Create account →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Free user — upgrade prompt ── */
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Nirmaan AI</h1>
            <p className="text-gray-500">Premium-exclusive intelligent construction assistant</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 mb-6 border border-orange-100">
            <p className="font-semibold text-gray-800 mb-3">🚀 Unlock Nirmaan AI with Premium:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'Ask any construction question — materials, prices, design',
                'Get material quantity & budget estimates instantly',
                'Real-time market prices for cement, steel, sand & more',
                'Structural design guidance per IS codes',
                'Platform help — orders, delivery, credit, suppliers',
                'Access SETU Engineering Consultant (/civitas)',
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/premium"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <Crown className="w-5 h-5 text-amber-200" />
              Upgrade to Premium — from ₹999/mo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/estimator"
              className="flex items-center justify-center gap-2 w-full border-2 border-orange-200 text-orange-700 font-semibold py-3 rounded-xl hover:bg-orange-50 transition-all"
            >
              Use Free Estimator Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Premium user — full chatbot ── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

      {/* ── Sidebar ── */}
      <aside className="lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Nirmaan AI</h1>
              <p className="text-orange-100 text-xs">Construction Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 w-fit">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-white text-xs font-medium capitalize">
              {user?.membership_tier || 'premium'} Plan
            </span>
          </div>
        </div>

        {/* Quick starters (collapsed on mobile) */}
        <div className="p-4 border-b border-gray-100 hidden lg:block">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Starters</p>
          <div className="space-y-1.5">
            {QUICK_STARTERS.map((qs, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qs.text)}
                className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 hover:border-orange-200 border border-transparent text-xs text-gray-600 hover:text-gray-900 transition-all"
              >
                <span className="shrink-0">{qs.icon}</span>
                <span>{qs.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Domain categories */}
        <div className="p-4 flex-1 overflow-y-auto hidden lg:block">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Browse Topics</p>
          <div className="space-y-2">
            {DOMAINS.map((domain, i) => (
              <DomainCard key={i} domain={domain} onSelect={sendMessage} />
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="p-4 border-t border-gray-100 hidden lg:block">
          <Link
            href="/civitas"
            className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-800 font-medium hover:underline transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            SETU Engineering Consultant →
          </Link>
          <Link
            href="/estimator"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-medium mt-1.5 hover:underline transition-colors"
          >
            <span>📐</span>
            AI Material Estimator →
          </Link>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:h-screen overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Nirmaan AI</p>
              <p className="text-xs text-gray-400">
                {messages.length > 0
                  ? `${messages.filter(m => m.role === 'user').length} question${messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} asked`
                  : 'Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Chat
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gradient-to-b from-orange-50/30 to-white">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">🤖</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Nirmaan AI</h2>
              <p className="text-gray-500 text-sm mb-6">Your intelligent construction companion</p>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {QUICK_STARTERS.slice(0, 4).map((qs, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qs.text)}
                    className="text-left flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-xs text-gray-600 hover:text-gray-900"
                  >
                    <span>{qs.icon}</span>
                    <span>{qs.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <span className="text-base">🤖</span>
                </div>
              )}

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end max-w-[75%]' : 'items-start max-w-[80%] w-full'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md w-full'
                }`}>
                  {msg.role === 'assistant' ? (
                    <RichText text={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* Suggestions */}
                {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100 hover:border-orange-300 transition-all font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'assistant' && <CopyButton text={msg.content} />}
                  {msg.queriesRemaining !== undefined && msg.queriesRemaining >= 0 && (
                    <span className="text-[10px] text-gray-400">
                      {msg.queriesRemaining} queries left today
                    </span>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-md">
                <span className="text-base animate-pulse">🤖</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-400">Nirmaan AI is thinking…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="py-4 px-4 border-t border-gray-200 bg-white/90 backdrop-blur-sm shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about materials, prices, orders, construction costs, engineering…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none transition-all"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-400">
              <span className="text-orange-400 mr-1">🤖</span>
              Nirmaan AI v1.0 — Responses are indicative. Verify critical designs with a licensed engineer.
            </p>
            <Link href="/civitas" className="text-[10px] font-semibold text-violet-600 hover:underline flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> SETU Engineering AI
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
