'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  MessageCircle, X, Send, Bot, User, Sparkles,
  ArrowRight, ChevronDown, RotateCcw, Minimize2,
  Package, CreditCard, Calculator, Truck, Search
} from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  links?: { label: string; href: string }[];
  products?: { name: string; price: string }[];
}

const QUICK_PROMPTS = [
  { icon: '🏠', label: 'Estimate for 2BHK house', category: 'estimator' },
  { icon: '💰', label: 'How does business credit work?', category: 'credit' },
  { icon: '📦', label: 'What materials do you sell?', category: 'products' },
  { icon: '🚚', label: 'How does delivery work?', category: 'delivery' },
  { icon: '🔍', label: 'Find cheapest cement', category: 'search' },
  { icon: '📋', label: 'Track my order', category: 'orders' },
];

const BOT_RESPONSES: Record<string, { content: string; links?: { label: string; href: string }[]; products?: { name: string; price: string }[] }> = {
  greeting: {
    content: "Namaste! 🙏 I'm Nirmaan AI — your construction materials assistant. I can help you with:\n\n• 📦 Finding materials & comparing prices\n• 💰 Business credit & EMI options\n• 🏗️ Material estimation for your project\n• 🚚 Delivery tracking & scheduling\n• 📋 Order management\n\nWhat can I help you with today?",
  },
  estimator: {
    content: "Great choice! 🏗️ For a standard **2BHK house (1200 sq ft)**, here's a rough estimate:\n\n• **Cement**: ~280 bags — ₹1,07,800\n• **Sand**: ~850 cu.ft — ₹46,750\n• **Steel TMT**: ~2,800 kg — ₹1,68,000\n• **Bricks**: ~12,000 nos — ₹96,000\n• **Aggregate**: ~550 cu.ft — ₹20,900\n\n**Estimated Total: ₹4,39,450**\n\nWant a more detailed breakdown? Try our AI Estimator tool!",
    links: [
      { label: '🧮 Open AI Estimator', href: '/estimator' },
      { label: '📦 Browse Materials', href: '/products' },
    ],
  },
  credit: {
    content: "Nirmaan Business Credit gives you the power to **buy now and pay later**! Here's how it works:\n\n1. **Apply online** — Quick KYC, instant approval\n2. **Get up to ₹5,00,000** credit line\n3. **Flexible repayment** — 30 / 60 / 90 days\n4. **0% interest** for first 30 days!\n5. **Digital invoices** & payment tracking\n\n📊 Your credit score improves with timely payments, unlocking higher limits.",
    links: [
      { label: '💳 Apply for Credit', href: '/credit' },
      { label: '📖 Learn More', href: '/about' },
    ],
  },
  products: {
    content: "We offer a wide range of construction materials! Here are our top categories:\n\n🏗️ **Cement** — UltraTech, ACC, Ambuja, Dalmia (120+ products)\n🔩 **Steel & TMT** — JSW, Tata, SAIL (85+ products)\n⏳ **Sand** — River Sand, M-Sand, P-Sand (45+ products)\n🧱 **Bricks** — Red Clay, Fly Ash, AAC Blocks (60+ products)\n🔲 **Tiles** — Floor, Wall, Vitrified (200+ products)\n🎨 **Paint** — Asian, Berger, Dulux (150+ products)\n🪵 **Wood** — Plywood, Teakwood, MDF (80+ products)",
    links: [
      { label: '🛒 Browse All Products', href: '/products' },
      { label: '🔥 Today\'s Deals', href: '/products?category=cement' },
    ],
    products: [
      { name: 'UltraTech Cement 50kg', price: '₹385/bag' },
      { name: 'JSW TMT 12mm', price: '₹62,500/ton' },
      { name: 'River Sand Fine', price: '₹2,800/ton' },
      { name: 'Red Clay Bricks', price: '₹6,500/1000pcs' },
    ],
  },
  delivery: {
    content: "🚚 **Nirmaan Delivery** — Fast & Reliable!\n\n• **Same-day delivery** for orders before 2 PM\n• **GPS-tracked** — watch your material reach your site\n• **Weight verified** at pickup & delivery\n• **Combined delivery** — order multiple materials, save on delivery!\n• **Free delivery** on orders above ₹10,000\n\n📍 Currently serving: **Hyderabad, Karimnagar, Peddapalli, Warangal** & surrounding areas.",
    links: [
      { label: '🚛 Become a Delivery Partner', href: '/delivery/register' },
      { label: '📦 Start Ordering', href: '/products' },
    ],
  },
  search: {
    content: "Here are the **best cement deals** right now:\n\n🏆 **Lowest Prices This Week:**",
    links: [
      { label: '🔍 Compare All Cement', href: '/products?category=cement' },
      { label: '📊 View Price Trends', href: '/products/1' },
    ],
    products: [
      { name: 'ACC Cement 50kg', price: '₹375/bag (9% off)' },
      { name: 'UltraTech Cement 50kg', price: '₹385/bag (8% off)' },
      { name: 'Ambuja Cement 50kg', price: '₹390/bag (7% off)' },
      { name: 'Dalmia Cement 50kg', price: '₹370/bag (10% off)' },
    ],
  },
  orders: {
    content: "📋 To track your orders, head to the **Orders** page! There you can:\n\n• View all active & past orders\n• Track delivery in real-time with GPS\n• Download invoices & receipts\n• Rate suppliers & delivery partners\n• Request returns or support",
    links: [
      { label: '📋 View My Orders', href: '/orders' },
      { label: '🛒 Place New Order', href: '/products' },
    ],
  },
  fallback: {
    content: "I understand you're looking for help! Here are some things I can assist with:\n\n• **\"Estimate materials\"** — Get cost estimates for your project\n• **\"Find cement/steel/sand\"** — Search for specific materials\n• **\"Credit options\"** — Learn about business credit\n• **\"Track order\"** — Check your delivery status\n• **\"Best prices\"** — Find the cheapest deals\n\nOr you can try one of the quick options below! 👇",
    links: [
      { label: '🧮 AI Estimator', href: '/estimator' },
      { label: '📦 Products', href: '/products' },
      { label: '💳 Credit', href: '/credit' },
    ],
  },
};

function classifyInput(input: string): string {
  const lower = input.toLowerCase();
  if (/estimat|2bhk|3bhk|house|build|slab|foundation|villa|sqft|sq ft|construct|material.*(for|need)/i.test(lower)) return 'estimator';
  if (/credit|loan|emi|pay later|buy now|finance|repay/i.test(lower)) return 'credit';
  if (/product|material|sell|categor|cement|steel|sand|brick|tile|paint|wood|what.*(do|you)|available/i.test(lower)) return 'products';
  if (/deliver|shipping|track.*deliver|dispatch|transport|gps|ship/i.test(lower)) return 'delivery';
  if (/cheap|price|cost|find|search|compare|best|lowest|deal|discount|offer/i.test(lower)) return 'search';
  if (/order|track|status|invoice|receipt|return|my order/i.test(lower)) return 'orders';
  return 'fallback';
}

export default function ChatBot() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Periodic pulse animation on FAB
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setPulseCount(c => c + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
    if (messages.length === 0) {
      // Send greeting
      const greeting = BOT_RESPONSES.greeting;
      setMessages([{
        id: 1,
        role: 'bot',
        content: greeting.content,
        timestamp: new Date(),
        links: greeting.links,
      }]);
    }
  }, [messages.length]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const category = classifyInput(text);
      const response = BOT_RESPONSES[category] || BOT_RESPONSES.fallback;

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: response.content,
        timestamp: new Date(),
        links: response.links,
        products: response.products,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    const greeting = BOT_RESPONSES.greeting;
    setMessages([{
      id: Date.now(),
      role: 'bot',
      content: greeting.content,
      timestamp: new Date(),
      links: greeting.links,
    }]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI Chat"
        >
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
          <div className={`absolute inset-0 rounded-full bg-orange-400 opacity-30 transition-transform duration-1000 ${pulseCount % 2 === 0 ? 'scale-125' : 'scale-100'}`} />

          {/* Main button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-orange-500/40 hover:shadow-xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">1</span>
              </span>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Ask Nirmaan AI
              <span className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-[400px] sm:w-[420px]'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px] max-h-[80vh]'}`}>
            {/* Header */}
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 px-5 py-4 flex items-center justify-between cursor-pointer shrink-0"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Nirmaan AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-orange-100 text-xs">Online — Ask me anything!</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); resetChat(); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Reset chat">
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Minimize">
                  {isMinimized ? <ChevronDown className="w-4 h-4 text-white rotate-180" /> : <Minimize2 className="w-4 h-4 text-white" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Close">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-orange-50/50 to-white">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                        }`}>
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-1' : ''}>
                              {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                part.startsWith('**') && part.endsWith('**')
                                  ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                                  : part
                              )}
                            </p>
                          ))}
                        </div>

                        {/* Product cards in bot message */}
                        {msg.products && msg.products.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {msg.products.map((p, i) => (
                              <Link key={i} href={isAuthenticated ? '/products' : '/login'} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-orange-300 hover:shadow-sm transition-all text-xs group">
                                <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">{p.name}</span>
                                <span className="text-orange-600 font-bold">{p.price}</span>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Action links in bot message */}
                        {msg.links && msg.links.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.links.map((link, i) => (
                              <Link key={i} href={isAuthenticated ? link.href : '/login'} className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors border border-orange-200">
                                {link.label}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 1 && !isTyping && (
                  <div className="px-4 pb-2 shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Questions</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickPrompt(qp.label)}
                          className="text-left text-xs bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl px-3 py-2.5 transition-all hover:shadow-sm group"
                        >
                          <span className="mr-1">{qp.icon}</span>
                          <span className="text-gray-600 group-hover:text-orange-700 transition-colors">{qp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all px-3 py-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask about materials, prices, credit..."
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 py-2"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md transition-all hover:scale-105 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-2">Powered by Nirmaan AI • Responses are AI-generated</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
