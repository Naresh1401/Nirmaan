'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Crown, Loader2, BookOpen, AlertTriangle, ChevronRight, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { usePremium } from '@/context/PremiumContext';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  references?: string[];
  recommendations?: string[];
  safetyNotes?: string[];
  nextSteps?: string[];
  estimatedCost?: Record<string, string>;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'Design a foundation for 3-story building on black cotton soil',
  'RCC beam design for 6m span with IS 456',
  'Earthquake resistant design for Zone III',
  'Compare pile vs raft foundation for 2400 sqft',
  'Construction schedule for G+2 residential',
  'Soil bearing capacity for different soil types',
  'Steel reinforcement detailing for a column',
  'Waterproofing specification for basement',
];

const TIER_LABELS: Record<string, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export default function PremiumChatBot() {
  const { isPremium, membershipTier, loyaltyPoints } = usePremium();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          text:
            `Welcome to **NirmaaN Premium Consultant** 👑\n\n` +
            `I'm your AI Civil Engineering Consultant. I can help you with:\n` +
            `• Foundation & soil analysis\n` +
            `• RCC design (beams, columns, slabs) per IS 456\n` +
            `• Earthquake resistant design (IS 1893)\n` +
            `• Load calculations (IS 875)\n` +
            `• Waterproofing specifications\n` +
            `• Construction scheduling (CPM/PERT)\n` +
            `• Material cost estimation\n\n` +
            `Pick a quick prompt below or type your question.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const data = await api.consultAI(text.trim());
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response,
        references: data.references,
        recommendations: data.recommendations,
        safetyNotes: data.safety_notes,
        nextSteps: data.next_steps,
        estimatedCost: data.estimated_cost,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to get response. Please try again.')
          : 'Failed to get response. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) return null;

  const tierLabel = TIER_LABELS[membershipTier] || membershipTier;

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold px-4 py-3 rounded-2xl shadow-2xl hover:from-amber-400 hover:to-yellow-400 transition-all group"
          aria-label="Open Premium Consultant"
        >
          <Crown className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Premium Consultant</span>
          <Sparkles className="w-4 h-4 opacity-70" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl transition-all ${
            minimized ? 'h-16 w-72' : 'w-[360px] sm:w-[420px] h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-amber-500/20 rounded-t-2xl">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-lg">
              <Crown className="w-5 h-5 text-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">NirmaaN Premium Consultant</p>
              <p className="text-xs text-amber-400 truncate">
                👑 {tierLabel} · {loyaltyPoints?.available_points ?? 0} pts
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label={minimized ? 'Maximize' : 'Minimize'}
              >
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="max-w-[95%] space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-tl-none p-3 text-sm text-slate-200 whitespace-pre-wrap">
                          {msg.text}
                        </div>
                        {msg.references && msg.references.length > 0 && (
                          <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs font-semibold text-amber-400">IS Code References</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {msg.references.map((ref) => (
                                <span key={ref} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-2.5">
                            <p className="text-xs font-semibold text-blue-400 mb-1.5">Recommendations</p>
                            {msg.recommendations.map((r, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300 mb-1">
                                <ChevronRight className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.safetyNotes && msg.safetyNotes.length > 0 && (
                          <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-xs font-semibold text-red-400">Safety Notes</span>
                            </div>
                            {msg.safetyNotes.map((n, i) => (
                              <p key={i} className="text-xs text-red-300 mb-0.5">{n}</p>
                            ))}
                          </div>
                        )}
                        {msg.estimatedCost && Object.keys(msg.estimatedCost).length > 0 && (
                          <div className="bg-green-950/40 border border-green-500/20 rounded-xl p-2.5">
                            <p className="text-xs font-semibold text-green-400 mb-1.5">Cost Estimates</p>
                            {Object.entries(msg.estimatedCost)
                              .filter(([k]) => k !== 'disclaimer')
                              .map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs text-slate-300 mb-0.5">
                                  <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}</span>
                                  <span className="text-green-300 text-right ml-2">{v}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="max-w-[85%] bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 rounded-xl rounded-tr-none px-3 py-2 text-sm font-medium">
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Analysing your query…
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 border-t border-slate-700/50">
                  <p className="text-[10px] text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Quick Prompts</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {QUICK_PROMPTS.slice(0, 4).map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-[10px] bg-slate-700/80 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 px-2 py-1 rounded-lg transition-colors text-left"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
                    placeholder="Ask your civil engineering question…"
                    className="flex-1 bg-slate-800 border border-slate-600 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || loading}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-900 rounded-xl px-3 py-2.5 transition-all"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 mt-1.5 text-center">Powered by NirmaaN Premium · Consult a licensed engineer for final designs</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
