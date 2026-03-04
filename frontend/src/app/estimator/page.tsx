'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  estimation?: EstimationResult;
}

interface MaterialItem {
  material: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  notes: string;
}

interface EstimationResult {
  materials: MaterialItem[];
  total_cost: number;
  cost_per_sqft: number;
  area_sqft: number;
  structure_type: string;
  quality: string;
}

const quickPrompts = [
  '2BHK house 1200 sqft cost estimate',
  'How much cement for 1000 sqft house?',
  'Steel required for 2 floor building',
  'Compare cement prices in Peddapalli',
  'Foundation materials for 30x40 plot',
  'Tiles needed for 3 bathrooms',
];

const structureTypes = [
  { label: 'Residential House', value: 'residential', icon: '🏠' },
  { label: 'Commercial Building', value: 'commercial', icon: '🏢' },
  { label: 'Apartment Complex', value: 'apartment', icon: '🏬' },
  { label: 'Warehouse/Godown', value: 'warehouse', icon: '🏭' },
  { label: 'Compound Wall', value: 'compound_wall', icon: '🧱' },
  { label: 'Farm House', value: 'farm_house', icon: '🏡' },
];

const materialRates: Record<string, { economy: number; standard: number; premium: number; unit: string }> = {
  'Cement (OPC 53)': { economy: 340, standard: 380, premium: 420, unit: 'bag' },
  'TMT Steel': { economy: 58000, standard: 65000, premium: 72000, unit: 'ton' },
  'River Sand': { economy: 45, standard: 55, premium: 70, unit: 'cft' },
  'M-Sand': { economy: 35, standard: 42, premium: 50, unit: 'cft' },
  'Bricks': { economy: 6, standard: 8, premium: 12, unit: 'piece' },
  'Gravel (20mm)': { economy: 38, standard: 48, premium: 58, unit: 'cft' },
  'Water (tanker)': { economy: 600, standard: 800, premium: 800, unit: 'load' },
};

function estimateMaterials(areaSqft: number, structureType: string, quality: string): EstimationResult {
  const multipliers: Record<string, number> = {
    residential: 1.0,
    commercial: 1.3,
    apartment: 1.15,
    warehouse: 0.75,
    compound_wall: 0.3,
    farm_house: 0.9,
  };
  const mult = multipliers[structureType] || 1.0;
  const q = quality as 'economy' | 'standard' | 'premium';

  const materials: MaterialItem[] = [
    { material: 'Cement (OPC 53 Grade)', quantity: Math.ceil(areaSqft * 0.4 * mult), unit: 'bags', unit_cost: materialRates['Cement (OPC 53)'][q], total_cost: 0, notes: 'UltraTech / ACC / Ambuja' },
    { material: 'TMT Steel (Fe500D)', quantity: parseFloat((areaSqft * 4 * mult / 1000).toFixed(2)), unit: 'tons', unit_cost: materialRates['TMT Steel'][q], total_cost: 0, notes: 'Tata Tiscon / JSW / SAIL' },
    { material: 'River Sand', quantity: Math.ceil(areaSqft * 1.25 * mult), unit: 'cft', unit_cost: materialRates['River Sand'][q], total_cost: 0, notes: 'Fine grade for plastering' },
    { material: 'M-Sand', quantity: Math.ceil(areaSqft * 0.8 * mult), unit: 'cft', unit_cost: materialRates['M-Sand'][q], total_cost: 0, notes: 'Manufactured sand for concrete' },
    { material: 'Bricks', quantity: Math.ceil(areaSqft * 8 * mult), unit: 'pieces', unit_cost: materialRates['Bricks'][q], total_cost: 0, notes: 'Standard red clay bricks' },
    { material: 'Gravel (20mm)', quantity: Math.ceil(areaSqft * 0.6 * mult), unit: 'cft', unit_cost: materialRates['Gravel (20mm)'][q], total_cost: 0, notes: 'Crushed stone aggregate' },
    { material: 'Water', quantity: Math.ceil(areaSqft * mult / 100), unit: 'tanker loads', unit_cost: materialRates['Water (tanker)'][q], total_cost: 0, notes: 'Construction water supply' },
  ];

  materials.forEach((m) => (m.total_cost = Math.round(m.quantity * m.unit_cost)));
  const total_cost = materials.reduce((s, m) => s + m.total_cost, 0);

  return {
    materials,
    total_cost,
    cost_per_sqft: Math.round(total_cost / areaSqft),
    area_sqft: areaSqft,
    structure_type: structureType,
    quality: q,
  };
}

export default function EstimatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        "Namaste! 🙏 I'm the Nirmaan AI Estimator. I can help you estimate construction materials, calculate costs, and find the best prices in your area.\n\nTry asking me:\n• \"Estimate materials for 1200 sqft house\"\n• \"How much cement for 2BHK?\"\n• \"Compare material prices\"\n\nOr use the calculator below for a quick estimate!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [showCalculator, setShowCalculator] = useState(true);
  const [calcArea, setCalcArea] = useState('1200');
  const [calcType, setCalcType] = useState('residential');
  const [calcQuality, setCalcQuality] = useState('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = (text: string) => {
    const userMsg: Message = { id: Date.now(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simple NLP
    const areaMatch = text.match(/(\d{3,5})\s*(sqft|sq\s*ft|square\s*feet|sft)/i);
    const dimMatch = text.match(/(\d+)\s*[xX×]\s*(\d+)/);
    let area = 0;
    if (areaMatch) area = parseInt(areaMatch[1]);
    else if (dimMatch) area = parseInt(dimMatch[1]) * parseInt(dimMatch[2]);

    let sType = 'residential';
    if (/commercial|shop|office/i.test(text)) sType = 'commercial';
    else if (/apartment|flat/i.test(text)) sType = 'apartment';
    else if (/warehouse|godown/i.test(text)) sType = 'warehouse';
    else if (/compound|wall|boundary/i.test(text)) sType = 'compound_wall';

    setTimeout(() => {
      if (area > 0) {
        const est = estimateMaterials(area, sType, calcQuality);
        const botMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Here's the material estimate for your ${area} sqft ${sType.replace('_', ' ')} project:`,
          timestamp: new Date(),
          estimation: est,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (/price|rate|cost/i.test(text) && /cement/i.test(text)) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content:
              '**Current Cement Prices in Peddapalli:**\n\n| Brand | Price/Bag | Rating |\n|-------|-----------|--------|\n| UltraTech OPC 53 | ₹380 | ⭐ 4.5 |\n| ACC Gold | ₹375 | ⭐ 4.3 |\n| Ambuja Plus | ₹370 | ⭐ 4.4 |\n| Zuari Star | ₹355 | ⭐ 4.1 |\n| Dalmia DSP | ₹365 | ⭐ 4.2 |\n\n💡 Tip: Buying 100+ bags? Nirmaan gets you bulk discounts of up to 8%!',
            timestamp: new Date(),
          },
        ]);
      } else if (/price|rate|cost/i.test(text) && /steel/i.test(text)) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content:
              '**Current Steel Prices (TMT Fe500D):**\n\n| Brand | Price/Ton | |\n|-------|-----------|--|\n| Tata Tiscon | ₹65,000 | Best Quality |\n| JSW NeoSteel | ₹63,500 | Popular |\n| SAIL TMT | ₹61,000 | Value |\n| Vizag Steel | ₹62,000 | Regional |\n\n📉 Steel prices have dropped ~3% this month. Good time to buy!',
            timestamp: new Date(),
          },
        ]);
      } else if (/2\s*bhk/i.test(text)) {
        const est = estimateMaterials(1100, 'residential', calcQuality);
        const botMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'A typical 2BHK house is around 1,000-1,200 sqft. Here\'s the estimate for 1,100 sqft:',
          timestamp: new Date(),
          estimation: est,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (/3\s*bhk/i.test(text)) {
        const est = estimateMaterials(1600, 'residential', calcQuality);
        const botMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'A typical 3BHK house is around 1,400-1,800 sqft. Here\'s the estimate for 1,600 sqft:',
          timestamp: new Date(),
          estimation: est,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content:
              "I can help you with:\n\n🧮 **Material Estimation** — Tell me the area (e.g., \"1200 sqft house\")\n💰 **Price Comparison** — Ask about specific materials (e.g., \"cement prices\")\n📊 **Cost Prediction** — Full project cost breakdowns\n🏗️ **Construction Tips** — Best practices and material selection\n\nTry: \"Estimate materials for 1500 sqft residential house\"",
            timestamp: new Date(),
          },
        ]);
      }
    }, 800);
  };

  const handleCalculate = () => {
    const area = parseInt(calcArea);
    if (!area || area < 100) return;
    const est = estimateMaterials(area, calcType, calcQuality);
    const msg: Message = {
      id: Date.now(),
      role: 'assistant',
      content: `📊 **Quick Estimate** for ${area} sqft ${calcType.replace('_', ' ')} (${calcQuality} quality):`,
      timestamp: new Date(),
      estimation: est,
    };
    setMessages((prev) => [...prev, msg]);
    setShowCalculator(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <h1 className="font-bold text-gray-900">Nirmaan AI Estimator</h1>
              <p className="text-xs text-green-600">● Online — Powered by local market data</p>
            </div>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition"
          >
            {showCalculator ? 'Hide' : 'Show'} Calculator
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Quick Calculator */}
        {showCalculator && (
          <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-gray-900 mb-4">⚡ Quick Material Calculator</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Area (sqft)</label>
                <input
                  type="number"
                  value={calcArea}
                  onChange={(e) => setCalcArea(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Structure Type</label>
                <select
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {structureTypes.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.icon} {st.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Quality</label>
                <select
                  value={calcQuality}
                  onChange={(e) => setCalcQuality(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCalculate}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Calculate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-white shadow-sm border'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>

                {msg.estimation && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-4 border">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-500">Total Cost</p>
                        <p className="font-bold text-orange-600">₹{msg.estimation.total_cost.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-500">Cost/sqft</p>
                        <p className="font-bold text-gray-900">₹{msg.estimation.cost_per_sqft}</p>
                      </div>
                      <div className="text-center bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-500">Area</p>
                        <p className="font-bold text-gray-900">{msg.estimation.area_sqft} sqft</p>
                      </div>
                    </div>

                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1.5 text-gray-500 font-medium">Material</th>
                          <th className="text-right py-1.5 text-gray-500 font-medium">Qty</th>
                          <th className="text-right py-1.5 text-gray-500 font-medium">Rate</th>
                          <th className="text-right py-1.5 text-gray-500 font-medium">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {msg.estimation.materials.map((m, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-1.5 text-gray-800">{m.material}</td>
                            <td className="py-1.5 text-right text-gray-600">
                              {m.quantity} {m.unit}
                            </td>
                            <td className="py-1.5 text-right text-gray-600">₹{m.unit_cost.toLocaleString()}</td>
                            <td className="py-1.5 text-right font-medium text-gray-900">
                              ₹{m.total_cost.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 text-xs bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700">
                        🛒 Add All to Cart
                      </button>
                      <button className="flex-1 text-xs border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
                        📥 Download PDF
                      </button>
                    </div>
                  </div>
                )}

                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-orange-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => processMessage(prompt)}
                className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-500 hover:text-orange-600 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) processMessage(input.trim());
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about materials, prices, or estimates..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:bg-gray-300 transition"
            >
              Send
            </button>
          </form>
        </div>

        {/* Market Rates Bar */}
        <div className="bg-white border-t px-4 py-3">
          <p className="text-xs font-medium text-gray-500 mb-2">📊 Today&apos;s Market Rates (Peddapalli)</p>
          <div className="flex gap-4 overflow-x-auto text-xs">
            {Object.entries(materialRates).map(([name, rates]) => (
              <div key={name} className="flex-shrink-0 flex items-center gap-1.5">
                <span className="text-gray-700 font-medium">{name}:</span>
                <span className="text-gray-900">₹{rates.standard}/{rates.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
