'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Brain, Send, RotateCcw, Crown, Sparkles, ChevronRight,
  Zap, HardHat, Wrench, FlaskConical, Mountain, Wind, Droplets,
  FileText, BarChart3, AlertTriangle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
  tier?: string;
  queriesRemaining?: number;
}

const QUICK_PROMPTS = [
  { label: '🧮 Beam Design', prompt: 'Design a simply supported RCC beam for 5m span with 25 kN/m load, M20 concrete, Fe415 steel' },
  { label: '🏗️ Foundation', prompt: 'Recommend foundation type for 3-storey building on stiff clay soil with N=12' },
  { label: '🌍 Seismic Zone', prompt: 'What seismic zone is Hyderabad in and what are the design requirements?' },
  { label: '🔬 Mix Design', prompt: 'Design M25 concrete mix as per IS 10262:2019' },
  { label: '💰 Cost Estimate', prompt: 'Estimate construction cost per sqft for a G+2 residential building in Hyderabad' },
  { label: '🔍 Crack Diagnosis', prompt: 'Diagonal cracks at 45 degrees in beam near support — what is the cause and remedy?' },
  { label: '📐 Slab Design', prompt: 'Design a two-way RCC slab of 4m x 5m span, 4 kN/m² live load, M20/Fe415' },
  { label: '🧱 Material Selection', prompt: 'Compare OPC 43, OPC 53, and PPC cement — which is best for foundation?' },
];

const DOMAIN_CHIPS = [
  { icon: HardHat,      label: 'Structural' },
  { icon: Mountain,     label: 'Geotechnical' },
  { icon: Wind,         label: 'Seismic' },
  { icon: FlaskConical, label: 'Mix Design' },
  { icon: Wrench,       label: 'Defect Diagnosis' },
  { icon: BarChart3,    label: 'Cost Estimation' },
  { icon: Droplets,     label: 'Water Resources' },
  { icon: FileText,     label: 'IS Codes' },
];

function isPremium(tier?: string | null): boolean {
  return ['silver', 'gold', 'platinum', 'enterprise'].includes(tier ?? '');
}


export default function AIConsultantPage() {
  return (
    <AuthGuard>
      <SetuChatbot />
    </AuthGuard>
  );
}

function SetuChatbot() {
  const { user, token } = useAuth();
  const tier = user?.membership_tier;
  const premium = isPremium(tier);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'bot',
      content: premium
        ? `## 🏗️ SETU — AI Civil Engineering Consultant\n\nHello${user?.full_name ? `, ${user.full_name}` : ''}! I'm **SETU**, your premium civil engineering expert powered by Nirmaan.\n\nI can help with:\n\n**📐 Structural Design** — Beam, column, slab, footing, retaining wall (IS 456)\n**🪨 Geotechnical** — Soil classification, bearing capacity, foundation selection\n**🌍 Seismic Design** — IS 1893 zone data, base shear, ductile detailing\n**🔬 Mix Design** — IS 10262 concrete proportions (M15–M50)\n**💰 Cost Estimation** — Per-sqft rates, BOQ calculations\n**🔍 Defect Diagnosis** — Cracks, waterproofing failures, structural defects\n**📋 IS Code Reference** — All major Indian standards\n\nAsk me any civil engineering question!`
        : `## 🔒 SETU — Premium Feature\n\nHello${user?.full_name ? `, ${user.full_name}` : ''}! **SETU** is Nirmaan's AI Civil Engineering Consultant — available for Premium subscribers.\n\nUpgrade to access:\n- Expert structural calculations (IS 456)\n- Foundation & geotechnical guidance\n- Seismic design (IS 1893)\n- Concrete mix design (IS 10262)\n- Construction cost estimation\n- Defect diagnosis and repair guidance\n\nUpgrade your plan to unlock unlimited SETU consultations!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 0,
        role: 'bot',
        content: `## 🏗️ SETU — AI Civil Engineering Consultant\n\nSession reset. How can I help you with your civil engineering project?`,
      },
    ]);
    setInput('');
  };

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isLoading) return;
    if (!premium) {
      showToast('Upgrade to Premium to use SETU AI Consultant');
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/ai-consultant/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          content: data.answer,
          tier: data.tier,
          queriesRemaining: data.queries_remaining,
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          content: `⚠️ **Error:** ${message}\n\nPlease try again or check your connection.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SETU — AI Civil Engineering Consultant</h1>
              <p className="text-blue-200 text-xs">Powered by Nirmaan · IS Code Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {premium && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {tier?.charAt(0).toUpperCase()}{tier?.slice(1)}
              </span>
            )}
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Domain chips */}
      {premium && (
        <div className="max-w-4xl mx-auto w-full px-4 py-2 flex gap-2 flex-wrap">
          {DOMAIN_CHIPS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1 bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full border border-white/10"
            >
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-1">
                <Brain className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'bot' && msg.queriesRemaining !== undefined && msg.queriesRemaining !== -1 && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                  {msg.queriesRemaining} queries remaining today
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-1">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />
                <span>SETU is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {premium && messages.length <= 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <p className="text-blue-300 text-xs mb-2 font-medium">Try these engineering queries:</p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => handleSend(qp.prompt)}
                className="bg-white/10 hover:bg-white/20 text-blue-100 text-xs px-3 py-1.5 rounded-full border border-white/10 transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade banner for free users */}
      {!premium && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">SETU requires Premium</p>
                <p className="text-blue-200 text-xs">Starting at ₹999/month for unlimited AI consultations</p>
              </div>
            </div>
            <Link
              href="/premium"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1 transition-all whitespace-nowrap"
            >
              <Crown className="w-4 h-4" /> Upgrade
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                premium
                  ? 'Ask SETU any civil engineering question… (Enter to send, Shift+Enter for new line)'
                  : 'Upgrade to Premium to use SETU AI Consultant'
              }
              disabled={!premium || isLoading}
              rows={2}
              className="flex-1 bg-white/10 text-white placeholder-blue-300/60 border border-white/20 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={!premium || !input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all flex-shrink-0"
            >
              {isLoading ? (
                <Zap className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-blue-400/60 text-xs mt-2 text-center">
            SETU AI — For reference only. Always verify critical designs with a licensed Structural Engineer.
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
}
