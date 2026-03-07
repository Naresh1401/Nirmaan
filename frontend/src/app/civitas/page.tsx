'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Send, User, Brain, Crown, ArrowRight,
  RotateCcw, Lock, Sparkles, Building2,
  Layers, FlaskConical, Compass, Droplets,
  Leaf, Ruler, BookOpen, AlertTriangle,
  HardHat, Microscope, FileText,
  ChevronDown, ChevronUp, Copy, Check,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ═══ Types ═══ */
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
  queriesRemaining?: number;
}

/* ═══ Domains & Quick Prompts ═══ */
const DOMAINS = [
  { icon: Building2, label: 'Structural', color: 'text-blue-600 bg-blue-50 border-blue-200', prompts: ['Design a beam for 6m span', 'Column for 800kN load, 3.5m height', 'Two-way slab 5m span M25'] },
  { icon: Layers, label: 'Geotechnical', color: 'text-amber-700 bg-amber-50 border-amber-200', prompts: ['Foundation for soft clay 100kN/m²', 'Soil bearing capacity analysis', 'Retaining wall 4m in medium soil'] },
  { icon: Compass, label: 'Seismic', color: 'text-red-600 bg-red-50 border-red-200', prompts: ['Seismic zone for Hyderabad', 'Base shear calculation', 'IS 1893 ductile detailing'] },
  { icon: FlaskConical, label: 'Mix Design', color: 'text-purple-600 bg-purple-50 border-purple-200', prompts: ['Mix design for M30 concrete', 'M25 concrete proportions', 'M40 high strength mix'] },
  { icon: Droplets, label: 'Hydraulics', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', prompts: ['Manning equation for channel', 'Water demand calculation', 'Storm drain design'] },
  { icon: Ruler, label: 'Transportation', color: 'text-orange-600 bg-orange-50 border-orange-200', prompts: ['Road pavement layers IRC:37', 'Bridge type for 45m span', 'Rigid vs flexible pavement'] },
  { icon: AlertTriangle, label: 'Forensic', color: 'text-rose-600 bg-rose-50 border-rose-200', prompts: ['Diagnose diagonal cracks in beam', 'Foundation settlement analysis', 'Corrosion repair methods'] },
  { icon: FileText, label: 'BBS / BOQ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', prompts: ['Bar bending schedule for beam', 'Material estimation per 100 sqft', 'Bill of quantities guide'] },
  { icon: HardHat, label: 'Management', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', prompts: ['CPM critical path method', 'Earned value analysis', 'Construction schedule residential'] },
  { icon: Leaf, label: 'Sustainability', color: 'text-green-600 bg-green-50 border-green-200', prompts: ['Embodied carbon of materials', 'IGBC green building rating', 'Sustainable material alternatives'] },
  { icon: Microscope, label: 'Quality / NDT', color: 'text-teal-600 bg-teal-50 border-teal-200', prompts: ['UPV test classification', 'Cube test acceptance criteria', 'Rebound hammer procedure'] },
  { icon: Layers, label: '3D / BIM', color: 'text-violet-600 bg-violet-50 border-violet-200', prompts: ['How to create 3D model of a building?', 'BIM workflow for structural design', 'Revit vs Tekla comparison'] },
  { icon: HardHat, label: 'Software Tools', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', prompts: ['Which software for multi-story analysis?', 'Compare STAAD.Pro vs ETABS', 'Primavera P6 scheduling guide'] },
];

const QUICK_STARTERS = [
  { icon: '📐', text: 'Design a beam for 6m span simply supported' },
  { icon: '🏗️', text: 'Column design for 800kN load' },
  { icon: '🪨', text: 'Foundation recommendation for soft clay soil' },
  { icon: '🔧', text: 'Concrete mix design for M30' },
  { icon: '📋', text: 'Bar bending schedule for beam 230×450mm, 4m span' },
  { icon: '🌍', text: 'Seismic zone and base shear for Hyderabad' },
  { icon: '�️', text: 'How to create a 3D building model?' },
  { icon: '🛠️', text: 'Which software for structural analysis?' },
];

/* ═══ Markdown-like renderer ═══ */
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => {
        const trimmed = line.trimStart();

        // Tables — only render from the first row of a table block
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          // Skip if this row is part of a table that started earlier
          if (i > 0 && lines[i - 1].trim().startsWith('|') && lines[i - 1].trim().endsWith('|')) return null;

          // First row of a table — collect all contiguous pipe-delimited lines
          let tableEnd = i;
          while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|') && lines[tableEnd].trim().endsWith('|')) {
            tableEnd++;
          }
          const tableLines = lines.slice(i, tableEnd);
          const headerCells = tableLines[0].split('|').filter(c => c.trim());
          const isSeparator = (line: string) => /^\|[\s-:|]+\|$/.test(line.trim());
          const dataLines = tableLines.filter((_, idx) => idx > 0 && !isSeparator(tableLines[idx]));

          return (
            <div key={i} className="overflow-x-auto my-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-50 to-purple-50">
                    {headerCells.map((cell, ci) => (
                      <th key={ci} className="border border-violet-200 px-2 py-1.5 text-left font-semibold text-violet-800">{cell.trim()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataLines.map((row, ri) => {
                    const cells = row.split('|').filter(c => c.trim() !== '' || c.includes(' '));
                    return (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        {cells.map((cell, ci) => (
                          <td key={ci} className="border border-gray-200 px-2 py-1 text-gray-700">
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

        // Code blocks
        if (trimmed.startsWith('```')) {
          const blockStart = i + 1;
          let blockEnd = blockStart;
          while (blockEnd < lines.length && !lines[blockEnd].trim().startsWith('```')) {
            blockEnd++;
          }
          if (i > 0 && lines[i - 1]?.trim().startsWith('```')) return null;
          const codeLines = lines.slice(blockStart, blockEnd);
          return (
            <pre key={i} className="bg-gray-900 text-green-300 text-xs rounded-lg px-3 py-2 my-2 overflow-x-auto font-mono leading-relaxed">
              {codeLines.join('\n')}
            </pre>
          );
        }
        // Skip lines inside code block
        if (i > 0) {
          let insideCode = false;
          for (let j = 0; j < i; j++) {
            if (lines[j].trim().startsWith('```')) insideCode = !insideCode;
          }
          if (insideCode) return null;
        }

        // Headers
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold text-gray-900 mt-3 mb-1 flex items-center gap-2">{formatInline(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-lg font-bold text-gray-900 mt-3 mb-1">{formatInline(trimmed.slice(2))}</h1>;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return <p key={i} className="ml-3 text-gray-700 flex items-start gap-1.5 my-0.5"><span className="text-violet-400 mt-0.5">•</span><span>{formatInline(trimmed.slice(2))}</span></p>;
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)?.[1];
          const rest = trimmed.replace(/^\d+\.\s*/, '');
          return <p key={i} className="ml-3 text-gray-700 flex items-start gap-1.5 my-0.5"><span className="text-violet-500 font-bold min-w-[16px]">{num}.</span><span>{formatInline(rest)}</span></p>;
        }

        // Warning lines
        if (trimmed.startsWith('⚠️')) {
          return <p key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-amber-800 text-xs my-1">{formatInline(trimmed)}</p>;
        }

        // Empty line
        if (!trimmed) return <div key={i} className="h-1" />;

        // Regular paragraph
        return <p key={i} className="text-gray-700 my-0.5">{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

/* ═══ Copy Button ═══ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-violet-600 transition-colors p-1 rounded" title="Copy response">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function SetuPage() {
  const { isAuthenticated, user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPremium = !!(user?.membership_tier && user.membership_tier !== 'free');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const sanitized = text.trim().slice(0, 2000);
    if (!sanitized || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (!isAuthenticated || !token) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '🔒 **Please log in** to use SETU AI Consultant.\n\nSign up for a free account to get 5 AI queries/day, or upgrade to Premium for unlimited consultations.',
        timestamp: new Date(),
      }]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/ai-consultant/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: sanitized }),
      });

      if (res.status === 429) {
        const err = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: `⚠️ **Daily Query Limit Reached**\n\n${err.detail}\n\nUpgrade your plan for more AI consultations per day.`,
          timestamp: new Date(),
        }]);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        mode: data.mode,
        queriesRemaining: data.queries_remaining,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">SETU</h1>
                  {isPremium && (
                    <span className="flex items-center gap-1 bg-amber-400/25 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                      <Crown className="w-2.5 h-2.5" /> PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-violet-200 text-xs sm:text-sm">Civil Intelligence & Technical Advisory System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDomains(!showDomains)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Domains</span>
                {showDomains ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {messages.length > 0 && (
                <button onClick={resetChat} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg border border-white/20 transition-all" title="New conversation">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Domain selector panel */}
          {showDomains && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {DOMAINS.map((domain, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedDomain(expandedDomain === i ? null : i)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        expandedDomain === i
                          ? 'bg-white text-violet-800 shadow-lg'
                          : 'bg-white/5 text-white hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      <domain.icon className="w-3.5 h-3.5" />
                      {domain.label}
                    </button>
                    {expandedDomain === i && (
                      <div className="mt-1 space-y-1">
                        {domain.prompts.map((prompt, pi) => (
                          <button
                            key={pi}
                            onClick={() => { sendMessage(prompt); setShowDomains(false); setExpandedDomain(null); }}
                            className="w-full text-left text-[11px] text-violet-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            → {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="max-w-5xl mx-auto px-4 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-violet-200">
                <Brain className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ask SETU Anything</h2>
              <p className="text-gray-500 text-sm mb-8 max-w-lg">
                Structural design, geotechnical analysis, mix design, IS code references,
                cost estimation, failure analysis — your AI civil engineering expert is ready.
              </p>

              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 max-w-md">
                  <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold mb-1">
                    <Lock className="w-4 h-4" /> Login Required
                  </div>
                  <p className="text-amber-700 text-xs">Sign in to start consulting with SETU. Free tier includes 5 queries/day.</p>
                  <Link href="/login" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-800 hover:underline">
                    Sign In <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {isAuthenticated && !isPremium && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-6 max-w-md">
                  <div className="flex items-center gap-2 text-violet-800 text-sm font-semibold mb-1">
                    <Crown className="w-4 h-4 text-amber-500" /> Upgrade for Unlimited Queries
                  </div>
                  <p className="text-violet-700 text-xs">Free tier: 5 queries/day. Premium Silver+ gives 50–unlimited queries.</p>
                  <Link href="/premium" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-violet-700 hover:underline">
                    See Plans <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {QUICK_STARTERS.map((qs, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qs.text)}
                    className="flex items-center gap-3 text-left bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-violet-300 hover:shadow-md hover:bg-violet-50/50 transition-all group"
                  >
                    <span className="text-lg">{qs.icon}</span>
                    <span className="text-sm text-gray-600 group-hover:text-violet-700 transition-colors">{qs.text}</span>
                  </button>
                ))}
              </div>

              {/* Capabilities strip */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['IS 456', 'IS 875', 'IS 1893', 'IS 800', 'IRC:37', 'IS 10262', 'IS 2911', 'NBC 2016'].map(code => (
                  <span key={code} className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0 mt-1 shadow-md">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <RichText text={msg.content} />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && (
                        <CopyButton text={msg.content} />
                      )}
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

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0 shadow-md">
                    <Brain className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">SETU is analyzing…</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="py-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any civil engineering question — beam design, soil analysis, IS codes, cost estimation..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-400">
              <Sparkles className="w-3 h-3 inline mr-1 text-violet-400" />
              SETU AI v2.0 — All calculations per IS/IRC codes. Must be verified by a licensed Professional Engineer.
            </p>
            {!isPremium && isAuthenticated && (
              <Link href="/premium" className="text-[10px] font-semibold text-violet-600 hover:underline flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" /> Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
