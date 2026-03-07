'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Bot, Send, Calculator, Package, Info, RotateCcw, Sparkles, ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
  products?: { name: string; qty: string; unit: string; rate: number; total: number }[];
  totalCost?: number;
}

const quickPrompts = [
  { label: '🏠 2BHK House', prompt: 'Estimate materials for building a 2BHK house, 1200 sq ft' },
  { label: '🏢 Commercial 3000sqft', prompt: 'Estimate materials for a commercial building, 3000 sq ft, 2 floors' },
  { label: '🧱 Compound Wall', prompt: 'Estimate materials for a compound wall, 100 feet long, 6 feet high' },
  { label: '🏗️ Slab 500sqft', prompt: 'Estimate materials for an RCC slab, 500 sq ft area' },
  { label: '🪨 Foundation', prompt: 'Estimate materials for house foundation, 1000 sq ft plot' },
  { label: '🏘️ 3BHK Villa', prompt: 'Estimate all materials for a 3BHK villa, 2000 sq ft, G+1' },
];

const materialRates: Record<string, { unit: string; rate: number }> = {
  'Cement (OPC 53 Grade)': { unit: 'bags', rate: 385 },
  'River Sand (Fine)': { unit: 'cu.ft', rate: 55 },
  'M-Sand (Manufactured)': { unit: 'cu.ft', rate: 42 },
  'Crushed Stone Aggregate 20mm': { unit: 'cu.ft', rate: 38 },
  'TMT Steel Bar 8mm': { unit: 'kg', rate: 62 },
  'TMT Steel Bar 12mm': { unit: 'kg', rate: 60 },
  'TMT Steel Bar 16mm': { unit: 'kg', rate: 58 },
  'Red Clay Bricks (1st Class)': { unit: 'nos', rate: 8 },
  'AAC Blocks 600x200x150mm': { unit: 'nos', rate: 52 },
  'Fly Ash Bricks': { unit: 'nos', rate: 6 },
  'Water': { unit: 'liters', rate: 0.15 },
};

function estimateMaterials(prompt: string): { products: { name: string; qty: string; unit: string; rate: number; total: number }[], totalCost: number, summary: string } {
  const lower = prompt.toLowerCase();
  let sqft = 1200;
  const sqftMatch = lower.match(/(\d+)\s*(?:sq\s*ft|sqft|square\s*feet)/);
  if (sqftMatch) sqft = parseInt(sqftMatch[1]);

  let multiplier = 1;
  if (lower.includes('2 floor') || lower.includes('g+1') || lower.includes('duplex')) multiplier = 1.8;
  if (lower.includes('3 floor') || lower.includes('g+2')) multiplier = 2.6;
  if (lower.includes('commercial')) multiplier *= 1.3;

  const isWall = lower.includes('wall') || lower.includes('compound');
  const isSlab = lower.includes('slab');
  const isFoundation = lower.includes('foundation');

  let products: { name: string; qty: string; unit: string; rate: number; total: number }[] = [];

  if (isWall) {
    const lengthMatch = lower.match(/(\d+)\s*(?:feet|ft|foot)/);
    const len = lengthMatch ? parseInt(lengthMatch[1]) : 100;
    products = [
      { name: 'Cement (OPC 53 Grade)', qty: `${Math.ceil(len * 0.8)}`, unit: 'bags', rate: 385, total: Math.ceil(len * 0.8) * 385 },
      { name: 'River Sand (Fine)', qty: `${Math.ceil(len * 3)}`, unit: 'cu.ft', rate: 55, total: Math.ceil(len * 3) * 55 },
      { name: 'Red Clay Bricks (1st Class)', qty: `${Math.ceil(len * 50)}`, unit: 'nos', rate: 8, total: Math.ceil(len * 50) * 8 },
      { name: 'Crushed Stone Aggregate 20mm', qty: `${Math.ceil(len * 1.5)}`, unit: 'cu.ft', rate: 38, total: Math.ceil(len * 1.5) * 38 },
      { name: 'TMT Steel Bar 8mm', qty: `${Math.ceil(len * 2)}`, unit: 'kg', rate: 62, total: Math.ceil(len * 2) * 62 },
    ];
  } else if (isSlab) {
    products = [
      { name: 'Cement (OPC 53 Grade)', qty: `${Math.ceil(sqft * 0.4)}`, unit: 'bags', rate: 385, total: Math.ceil(sqft * 0.4) * 385 },
      { name: 'River Sand (Fine)', qty: `${Math.ceil(sqft * 1.25)}`, unit: 'cu.ft', rate: 55, total: Math.ceil(sqft * 1.25) * 55 },
      { name: 'Crushed Stone Aggregate 20mm', qty: `${Math.ceil(sqft * 1.8)}`, unit: 'cu.ft', rate: 38, total: Math.ceil(sqft * 1.8) * 38 },
      { name: 'TMT Steel Bar 12mm', qty: `${Math.ceil(sqft * 4)}`, unit: 'kg', rate: 60, total: Math.ceil(sqft * 4) * 60 },
      { name: 'TMT Steel Bar 8mm', qty: `${Math.ceil(sqft * 1.5)}`, unit: 'kg', rate: 62, total: Math.ceil(sqft * 1.5) * 62 },
    ];
  } else if (isFoundation) {
    products = [
      { name: 'Cement (OPC 53 Grade)', qty: `${Math.ceil(sqft * 0.5)}`, unit: 'bags', rate: 385, total: Math.ceil(sqft * 0.5) * 385 },
      { name: 'River Sand (Fine)', qty: `${Math.ceil(sqft * 2)}`, unit: 'cu.ft', rate: 55, total: Math.ceil(sqft * 2) * 55 },
      { name: 'Crushed Stone Aggregate 20mm', qty: `${Math.ceil(sqft * 3)}`, unit: 'cu.ft', rate: 38, total: Math.ceil(sqft * 3) * 38 },
      { name: 'TMT Steel Bar 12mm', qty: `${Math.ceil(sqft * 3)}`, unit: 'kg', rate: 60, total: Math.ceil(sqft * 3) * 60 },
      { name: 'TMT Steel Bar 16mm', qty: `${Math.ceil(sqft * 1.5)}`, unit: 'kg', rate: 58, total: Math.ceil(sqft * 1.5) * 58 },
    ];
  } else {
    // Full house
    const adj = sqft * multiplier;
    products = [
      { name: 'Cement (OPC 53 Grade)', qty: `${Math.ceil(adj * 0.4)}`, unit: 'bags', rate: 385, total: Math.ceil(adj * 0.4) * 385 },
      { name: 'River Sand (Fine)', qty: `${Math.ceil(adj * 1.5)}`, unit: 'cu.ft', rate: 55, total: Math.ceil(adj * 1.5) * 55 },
      { name: 'M-Sand (Manufactured)', qty: `${Math.ceil(adj * 1)}`, unit: 'cu.ft', rate: 42, total: Math.ceil(adj * 1) * 42 },
      { name: 'Crushed Stone Aggregate 20mm', qty: `${Math.ceil(adj * 2)}`, unit: 'cu.ft', rate: 38, total: Math.ceil(adj * 2) * 38 },
      { name: 'TMT Steel Bar 8mm', qty: `${Math.ceil(adj * 2.5)}`, unit: 'kg', rate: 62, total: Math.ceil(adj * 2.5) * 62 },
      { name: 'TMT Steel Bar 12mm', qty: `${Math.ceil(adj * 2)}`, unit: 'kg', rate: 60, total: Math.ceil(adj * 2) * 60 },
      { name: 'TMT Steel Bar 16mm', qty: `${Math.ceil(adj * 0.8)}`, unit: 'kg', rate: 58, total: Math.ceil(adj * 0.8) * 58 },
      { name: 'Red Clay Bricks (1st Class)', qty: `${Math.ceil(adj * 8)}`, unit: 'nos', rate: 8, total: Math.ceil(adj * 8) * 8 },
      { name: 'Water', qty: `${Math.ceil(adj * 20)}`, unit: 'liters', rate: 0.15, total: Math.ceil(adj * 20) * 0.15 },
    ];
  }

  const totalCost = products.reduce((sum, p) => sum + p.total, 0);
  const summary = isWall
    ? `Here's the estimated materials for your compound wall. Prices are based on current Telangana market rates.`
    : isSlab
    ? `Here's the estimated materials for your ${sqft} sq.ft RCC slab. Using M20 grade concrete mix design.`
    : isFoundation
    ? `Here's the estimated materials for foundation of a ${sqft} sq.ft plot. Based on standard strip foundation design.`
    : `Here's the estimated materials for your ${sqft} sq.ft construction${multiplier > 1 ? ' (multi-floor)' : ''}. Based on standard construction practices and current Telangana market rates.`;

  return { products, totalCost, summary };
}

export default function EstimatorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', content: `Hello${user?.full_name ? `, ${user.full_name}` : ''}! 👋 I'm your AI Construction Material Estimator.\n\nTell me about your construction project and I'll estimate the materials you need with current market prices. You can describe:\n\n• A house (e.g., "2BHK, 1200 sq ft")\n• A slab or foundation\n• A compound wall\n• Any other structure\n\nOr try one of the quick prompts below!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = { id: messages.length, role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const { products, totalCost, summary } = estimateMaterials(msg);
      const botMsg: Message = {
        id: messages.length + 1,
        role: 'bot',
        content: summary,
        products,
        totalCost,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleReset = () => {
    setMessages([{ id: 0, role: 'bot', content: `Let's start fresh! Tell me about your construction project and I'll estimate the materials needed.` }]);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 py-6 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2.5"><Bot className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Material Estimator</h1>
                <p className="text-violet-200 text-sm">Powered by Nirmaan AI · Telangana Market Rates</p>
              </div>
            </div>
            <button onClick={handleReset} className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Reset</button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-2xl rounded-br-md px-5 py-3'
                  : 'bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-5 py-4'}`}>
                  {msg.role === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-bold text-violet-600">Nirmaan AI</span>
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-line ${msg.role === 'user' ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-100 text-gray-600">
                            <th className="text-left px-3 py-2 font-semibold">Material</th>
                            <th className="text-right px-3 py-2 font-semibold">Qty</th>
                            <th className="text-right px-3 py-2 font-semibold">Rate</th>
                            <th className="text-right px-3 py-2 font-semibold">Total</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {msg.products.map((p, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{p.qty} {p.unit}</td>
                                <td className="px-3 py-2 text-right text-gray-600">₹{p.rate}</td>
                                <td className="px-3 py-2 text-right font-bold text-gray-900">₹{p.total.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="bg-violet-50 px-3 py-3 flex items-center justify-between">
                          <span className="font-bold text-violet-700">Estimated Total Cost</span>
                          <span className="text-lg font-extrabold text-violet-700">₹{msg.totalCost!.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => showToast('All materials added to cart! 🛒')} className="bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">🛒 Add All to Cart</button>
                        <button onClick={() => { const el = document.createElement('a'); el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(msg.products!.map(p => `${p.name} | ${p.qty} ${p.unit} | ₹${p.rate} | ₹${p.total}`).join('\n') + '\nTotal: ₹' + msg.totalCost!.toLocaleString('en-IN'))); el.setAttribute('download', 'estimate.txt'); el.click(); showToast('Estimate downloaded! 📄'); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition-all">📄 Download PDF</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600">Nirmaan AI</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="max-w-5xl w-full mx-auto px-4 pb-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">Quick Estimates:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, i) => (
                <button key={i} onClick={() => handleSend(qp.prompt)} className="bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 text-sm px-4 py-2 rounded-full transition-all font-medium">{qp.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-5xl mx-auto flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your construction project (e.g., 2BHK house, 1500 sq ft)..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="bg-violet-500 hover:bg-violet-600 disabled:bg-gray-300 text-white rounded-xl px-5 py-3 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce text-sm font-semibold">{toast}</div>}
    </AuthGuard>
  );
}
