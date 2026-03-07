'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  X, Send, User, Sparkles,
  ArrowRight, ChevronDown, RotateCcw, Minimize2,
  Calculator
} from 'lucide-react';
import {
  estimateBuilding,
  estimateRoad, type RoadType,
  estimateBridge, type BridgeType,
  estimateCompoundWall,
  estimateRetainingWall,
  estimateWaterTank,
  estimateSepticTank,
  estimateDrainage,
  compareRoadTypes,
  compareBridgeTypes,
  formatCurrency,
  type EstimationResult,
  type ComparisonResult,
  type MaterialItem,
} from '@/lib/estimator';

// ── Types ──
interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  links?: { label: string; href: string }[];
  products?: { name: string; price: string }[];
  estimation?: EstimationResult;
  comparison?: ComparisonResult;
}

// ── Security: Input sanitizer & data-leak prevention ──
const SENSITIVE_PATTERNS = [
  /\b\d{10,16}\b/g,                   // card numbers, long numeric IDs
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // credit card format
  /\b\d{3}-\d{2}-\d{4}\b/g,           // SSN-like patterns
  /\bcvv\b/gi,                         // CVV
  /\bpassword\b/gi,                    // password mentions
  /\bsecret\b/gi,                      // secret mentions
  /\btoken\b/gi,                       // token mentions
  /\bapi[_\s-]?key\b/gi,              // API key mentions
];

const MAX_INPUT_LENGTH = 500;

function sanitizeInput(text: string): string {
  // Trim and limit length
  let clean = text.trim().slice(0, MAX_INPUT_LENGTH);
  // Strip HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  // Strip potentially dangerous unicode
  clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return clean;
}

function containsSensitiveData(text: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => {
    pattern.lastIndex = 0; // reset regex state
    return pattern.test(text);
  });
}

// ── Quick Prompts ──
const QUICK_PROMPTS = [
  { icon: '🏠', label: 'Estimate for 2BHK house', category: 'estimator' },
  { icon: '🛣️', label: 'Road construction cost for 1km', category: 'road' },
  { icon: '🌉', label: 'Bridge cost for 30m span', category: 'bridge' },
  { icon: '🧱', label: 'Compound wall for 100m plot', category: 'wall' },
  { icon: '💧', label: 'Water tank 10000 liters', category: 'tank' },
  { icon: '📦', label: 'What materials do you sell?', category: 'products' },
  { icon: '🔄', label: 'Compare road types for 2km', category: 'compare-road' },
  { icon: '💰', label: 'How does business credit work?', category: 'credit' },
];

// ── Static responses ──
const BOT_RESPONSES: Record<string, { content: string; links?: { label: string; href: string }[]; products?: { name: string; price: string }[] }> = {
  greeting: {
    content: "Hi! I'm **Nirmaan's Civil Engineering Estimator**. I can calculate costs for:\n\n🏠 **Buildings** — houses, apartments, commercial\n🛣️ **Roads** — gravel, WBM, tar, concrete, highways\n🌉 **Bridges** — culverts, minor, major, flyovers\n🧱 **Walls** — compound walls, retaining walls\n💧 **Tanks** — water tanks, septic tanks\n🔧 **Drainage** — storm drains, sewer lines\n\nI'll tell you **materials needed**, **quantities**, **costs**, and **which option is best for you**.\n\nTry asking things like:\n• \"Estimate for 1500 sqft house\"\n• \"Cost of 2km tar road\"\n• \"Bridge for 40m river crossing\"\n• \"Compare road types for 1km\"",
  },
  credit: {
    content: "Business Credit lets you order materials now and pay later. Here's how it works:\n\n1. **Apply online** — fill in your business details, we do a quick review\n2. **Get a credit line** — approved businesses get a limit based on their profile\n3. **Pay in 30/60/90 days** — pick what works for you\n4. **First 30 days interest-free** on your initial order\n5. Invoices and payment tracking all inside your account\n\nApproval usually takes 24-48 hours.",
    links: [
      { label: 'Apply for Credit', href: '/credit' },
      { label: 'More Details', href: '/about' },
    ],
  },
  products: {
    content: "We have most of the common construction materials. Here's what you'll find:\n\n**Cement** — UltraTech, ACC, Ambuja, Dalmia\n**Steel & TMT** — JSW, Tata, SAIL\n**Sand** — River Sand, M-Sand, P-Sand\n**Granite** — Black Galaxy, Tan Brown, Steel Grey, Kashmir White, Absolute Black, Rajashree Red, Viscon White\n**Gravel** — 6mm chips, 10mm fine, 12mm standard, 20mm medium, 40mm coarse, Pea Gravel\n**Bricks** — Red Clay, Fly Ash, AAC Blocks\n**Tiles** — Floor, Wall, Vitrified\n**Paint** — Asian, Berger, Dulux\n\nPrices vary by supplier and location. Check the products page for current rates.",
    links: [
      { label: 'Browse Products', href: '/products' },
      { label: 'Granite Blocks', href: '/products?category=granite' },
      { label: 'Gravel Grades', href: '/products?category=gravel' },
    ],
    products: [
      { name: 'UltraTech Cement 50kg', price: '₹385/bag' },
      { name: 'Black Granite (Polished)', price: '₹85/sqft' },
      { name: 'Gravel 20mm (Medium)', price: '₹1,800/ton' },
      { name: 'JSW TMT 12mm', price: '₹62,500/ton' },
    ],
  },
  delivery: {
    content: "Here's how delivery works on Nirmaan:\n\n• Orders placed before 2 PM can usually be delivered same-day (depends on supplier stock)\n• GPS tracking — you can see where the truck is once it's dispatched\n• Weight verification at pickup\n• You can combine multiple materials in one delivery to save on transport\n• Free delivery on orders above ₹10,000\n\nWe currently deliver across Peddapalli, Karimnagar, Ramagundam, and Warangal districts.",
    links: [
      { label: 'Deliver with Us', href: '/delivery/register' },
      { label: 'Order Materials', href: '/products' },
    ],
  },
  search: {
    content: "Here are some cement rates from suppliers near you (prices may change):",
    links: [
      { label: 'All Cement Prices', href: '/products?category=cement' },
      { label: 'Price Details', href: '/products/1' },
    ],
    products: [
      { name: 'ACC Cement 50kg', price: '₹375/bag (9% off)' },
      { name: 'UltraTech Cement 50kg', price: '₹385/bag (8% off)' },
      { name: 'Ambuja Cement 50kg', price: '₹390/bag (7% off)' },
      { name: 'Dalmia Cement 50kg', price: '₹370/bag (10% off)' },
    ],
  },
  orders: {
    content: "You can check your orders from the Orders page. There you can:\n\n• See all current and past orders\n• Track delivery with GPS (when the truck is dispatched)\n• Download invoices\n• Rate the supplier and delivery\n• Contact support if something's wrong",
    links: [
      { label: 'My Orders', href: '/orders' },
      { label: 'New Order', href: '/products' },
    ],
  },
  fallback: {
    content: "I can help you estimate costs for any civil engineering project! Try asking about:\n\n🏠 **Buildings** — \"Estimate for 1200 sqft 2BHK\"\n🛣️ **Roads** — \"Cost of 2km bituminous road\" or \"Compare road types\"\n🌉 **Bridges** — \"30m bridge cost\" or \"Flyover for 200m\"\n🧱 **Walls** — \"Compound wall 50m\" or \"Retaining wall 4m high\"\n💧 **Tanks** — \"10000 liter water tank\" or \"Septic tank for 15 people\"\n🔧 **Drainage** — \"Sewer line 500m\" or \"Storm drain cost\"\n\nOr ask about materials, credit, and delivery.",
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Credit', href: '/credit' },
    ],
  },
};

// ── Number extraction helpers ──
function extractNumber(text: string, ...patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractSqft(text: string): number {
  const lower = text.toLowerCase();
  const sqftMatch = lower.match(/(\d+[\d,]*)\s*(?:sq\.?\s*ft|sqft|sft|square\s*feet?)/);
  if (sqftMatch) return parseInt(sqftMatch[1].replace(/,/g, ''));
  if (/1\s*bhk/i.test(lower)) return 600;
  if (/2\s*bhk/i.test(lower)) return 1000;
  if (/3\s*bhk/i.test(lower)) return 1500;
  if (/4\s*bhk/i.test(lower)) return 2200;
  if (/5\s*bhk|villa|bungalow|mansion/i.test(lower)) return 3500;
  if (/duplex/i.test(lower)) return 2000;
  const sqmMatch = lower.match(/(\d+[\d,]*)\s*(?:sq\.?\s*m|sqm|square\s*met)/);
  if (sqmMatch) return Math.round(parseInt(sqmMatch[1].replace(/,/g, '')) * 10.76);
  const numMatch = lower.match(/(\d{3,5})/);
  if (numMatch) return parseInt(numMatch[1]);
  return 1000;
}

function extractFloors(text: string): number {
  const lower = text.toLowerCase();
  const floorMatch = lower.match(/(\d+)\s*(?:floor|storey|story|level)/i);
  if (floorMatch) return parseInt(floorMatch[1]);
  const gMatch = lower.match(/g\s*\+\s*(\d+)/i);
  if (gMatch) return parseInt(gMatch[1]) + 1;
  if (/duplex|two.?stor/i.test(lower)) return 2;
  if (/triplex|three.?stor/i.test(lower)) return 3;
  return 1;
}

function extractLengthKm(text: string): number {
  const lower = text.toLowerCase();
  const kmMatch = lower.match(/(\d+\.?\d*)\s*(?:km|kilo)/i);
  if (kmMatch) return parseFloat(kmMatch[1]);
  const mMatch = lower.match(/(\d+)\s*(?:m|meter|metre)(?:s|\b)/i);
  if (mMatch) return parseInt(mMatch[1]) / 1000;
  return 1;
}

function extractWidthM(text: string, defaultW: number = 7): number {
  const lower = text.toLowerCase();
  const wMatch = lower.match(/(\d+\.?\d*)\s*(?:m|meter|metre)?\s*wide/i);
  if (wMatch) return parseFloat(wMatch[1]);
  const widthMatch = lower.match(/width\s*(?:of\s*)?(\d+\.?\d*)/i);
  if (widthMatch) return parseFloat(widthMatch[1]);
  if (/single\s*lane/i.test(lower)) return 3.75;
  if (/two\s*lane|2.?lane/i.test(lower)) return 7;
  if (/four\s*lane|4.?lane/i.test(lower)) return 14;
  if (/six\s*lane|6.?lane/i.test(lower)) return 21;
  return defaultW;
}

function extractSpanM(text: string): number {
  const lower = text.toLowerCase();
  const mMatch = lower.match(/(\d+\.?\d*)\s*(?:m|meter|metre)/i);
  if (mMatch) return parseFloat(mMatch[1]);
  const ftMatch = lower.match(/(\d+)\s*(?:ft|feet|foot)/i);
  if (ftMatch) return Math.round(parseInt(ftMatch[1]) * 0.3048);
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1]);
  return 20;
}

function extractLiters(text: string): number {
  const lower = text.toLowerCase();
  const klMatch = lower.match(/(\d+\.?\d*)\s*(?:kl|kiloliter|kilolitre)/i);
  if (klMatch) return parseFloat(klMatch[1]) * 1000;
  const literMatch = lower.match(/(\d+[\d,]*)\s*(?:l|liter|litre|ltr)s?/i);
  if (literMatch) return parseInt(literMatch[1].replace(/,/g, ''));
  const gallonMatch = lower.match(/(\d+[\d,]*)\s*(?:gallon)s?/i);
  if (gallonMatch) return parseInt(gallonMatch[1].replace(/,/g, '')) * 3.785;
  return 10000;
}

function extractUsers(text: string): number {
  const lower = text.toLowerCase();
  const userMatch = lower.match(/(\d+)\s*(?:user|person|people|member|family|resident)/i);
  if (userMatch) return parseInt(userMatch[1]);
  const numMatch = lower.match(/for\s+(\d+)/i);
  if (numMatch) return parseInt(numMatch[1]);
  return 10;
}

function extractHeightM(text: string, defaultH: number = 1.8): number {
  const lower = text.toLowerCase();
  const hMatch = lower.match(/(\d+\.?\d*)\s*(?:m|meter|metre)?\s*(?:high|height|tall)/i);
  if (hMatch) return parseFloat(hMatch[1]);
  const ftMatch = lower.match(/(\d+\.?\d*)\s*(?:ft|feet|foot)\s*(?:high|height|tall)/i);
  if (ftMatch) return Math.round(parseFloat(ftMatch[1]) * 0.3048 * 10) / 10;
  return defaultH;
}

// ── Smart classifier ──
type Category = 'building' | 'road' | 'bridge' | 'compound-wall' | 'retaining-wall' | 'water-tank' | 'septic-tank' | 'drainage' | 'compare-road' | 'compare-bridge' | 'credit' | 'products' | 'delivery' | 'search' | 'orders' | 'fallback';

function classifyInput(input: string): Category {
  const lower = input.toLowerCase();

  // Comparison requests
  if (/compare|which.*(?:road|bridge|best)|difference.*(?:road|bridge)|vs|versus/i.test(lower)) {
    if (/road|highway|tar|bituminous|wbm|gravel|concrete.*road|cc.*road/i.test(lower)) return 'compare-road';
    if (/bridge|culvert|flyover/i.test(lower)) return 'compare-bridge';
    if (/road/i.test(lower)) return 'compare-road';
  }

  // Roads
  if (/\broad\b|highway|tar\s*road|bituminous|wbm|macadam|gravel.*road|cc\s*road|concrete\s*road|pavement|asphalt|expressway|freeway/i.test(lower)) return 'road';

  // Bridges
  if (/bridge|culvert|flyover|overpass|viaduct|footbridge|river.*cross|nala.*cross|span.*(?:m|meter|ft)/i.test(lower)) return 'bridge';

  // Walls
  if (/compound.*wall|boundary.*wall|plot.*wall|fencing.*wall/i.test(lower)) return 'compound-wall';
  if (/retaining.*wall|earth.*retain|slope.*wall|gabion/i.test(lower)) return 'retaining-wall';

  // Water tank
  if (/water\s*tank|oht|overhead\s*tank|underground\s*tank|sump|storage\s*tank|reservoir/i.test(lower)) return 'water-tank';

  // Septic tank
  if (/septic|soak\s*pit|sewage\s*tank|waste.*tank/i.test(lower)) return 'septic-tank';

  // Drainage
  if (/drain|sewer|storm.*water|nala|gutter|manhole|sewage.*line|waste.*water.*line/i.test(lower)) return 'drainage';

  // Building/house
  if (/estimat|bhk|house|build|slab|foundation|villa|sqft|sq\s*ft|construct|material.*(for|need)|apartment|commercial|godown|warehouse|floor|storey|duplex|bungalow|office|shop|residence|dwelling/i.test(lower)) return 'building';

  // Other categories
  if (/credit|loan|emi|pay\s*later|buy\s*now|finance|repay/i.test(lower)) return 'credit';
  if (/product|material|sell|categor|cement|steel|sand|brick|tile|paint|wood|granite|gravel|stone|aggregate|what.*(do|you)|available/i.test(lower)) return 'products';
  if (/deliver|shipping|track.*deliver|dispatch|transport|gps|ship/i.test(lower)) return 'delivery';
  if (/cheap|price|cost|find|search|lowest|deal|discount|offer/i.test(lower)) return 'search';
  if (/order|track|status|invoice|receipt|return|my\s*order/i.test(lower)) return 'orders';

  return 'fallback';
}

// ── Road type detector ──
function detectRoadType(text: string): RoadType {
  const lower = text.toLowerCase();
  if (/gravel|moorum|unpaved|kaccha|dirt/i.test(lower)) return 'gravel';
  if (/wbm|water.*bound|macadam/i.test(lower)) return 'wbm';
  if (/concrete|cc\s*road|rigid|cement.*road|pqc/i.test(lower)) return 'concrete';
  if (/highway|express|national|nh|four.*lane|4.*lane|six.*lane/i.test(lower)) return 'highway';
  return 'bituminous';
}

// ── Bridge type detector ──
function detectBridgeType(text: string, span: number): BridgeType {
  const lower = text.toLowerCase();
  if (/culvert|nala|small.*drain|pipe.*cross/i.test(lower)) return 'culvert';
  if (/flyover|overpass|elevated|interchange/i.test(lower)) return 'flyover';
  if (/foot.*bridge|pedestrian|walking/i.test(lower)) return 'footbridge';
  if (/major|large|big|river.*cross/i.test(lower) || span > 60) return 'major';
  if (span <= 6) return 'culvert';
  return 'minor';
}

// ── Process user input and generate estimation ──
function processEstimation(input: string, category: Category): { content: string; estimation?: EstimationResult; comparison?: ComparisonResult; links?: { label: string; href: string }[] } {
  switch (category) {
    case 'building': {
      const sqft = extractSqft(input);
      const floors = extractFloors(input);
      const isCommercial = /commercial|office|shop|warehouse|godown|industrial|factory/i.test(input);
      const est = estimateBuilding(sqft, floors, isCommercial ? 'commercial' : 'residential');
      return {
        content: `Here's the detailed estimate for your **${est.title}**:\n\n${est.description}`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }, { label: 'Apply for Credit', href: '/credit' }],
      };
    }

    case 'road': {
      const lengthKm = extractLengthKm(input);
      const widthM = extractWidthM(input, 7);
      const roadType = detectRoadType(input);
      const est = estimateRoad(lengthKm, widthM, roadType);
      return {
        content: `Here's the detailed estimate for your **${est.title}**:\n\n${est.description}`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }, { label: 'Compare Road Types', href: '#' }],
      };
    }

    case 'bridge': {
      const spanM = extractSpanM(input);
      const widthM = extractWidthM(input, 7.5);
      const bridgeType = detectBridgeType(input, spanM);
      const est = estimateBridge(spanM, widthM, bridgeType);
      return {
        content: `Here's the detailed estimate for your **${est.title}**:\n\n${est.description}`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'compound-wall': {
      const lower = input.toLowerCase();
      const lengthM = extractNumber(lower, /(\d+)\s*(?:m|meter|metre|r\.m)/i) ?? extractNumber(lower, /(\d+)/i) ?? 50;
      const heightM = extractHeightM(input, 1.8);
      const est = estimateCompoundWall(lengthM, heightM);
      return {
        content: `Here's the detailed estimate for your **${est.title}**:`,
        estimation: est,
        links: [{ label: 'Buy Bricks', href: '/products?category=bricks' }, { label: 'Buy Cement', href: '/products?category=cement' }],
      };
    }

    case 'retaining-wall': {
      const lower = input.toLowerCase();
      const lengthM = extractNumber(lower, /(\d+)\s*(?:m|meter|metre|r\.m).*(?:long|length)/i) ?? extractNumber(lower, /(\d+)\s*(?:m|meter|metre)/i) ?? 20;
      const heightM = extractHeightM(input, 3);
      const est = estimateRetainingWall(lengthM, heightM);
      return {
        content: `Here's the detailed estimate for your **${est.title}**:`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'water-tank': {
      const liters = extractLiters(input);
      const isUnderground = /underground|below|ug|sump|under\s*ground/i.test(input);
      const est = estimateWaterTank(liters, isUnderground ? 'underground' : 'overhead');
      return {
        content: `Here's the detailed estimate for your **${est.title}**:`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'septic-tank': {
      const users = extractUsers(input);
      const est = estimateSepticTank(users);
      return {
        content: `Here's the detailed estimate for your **${est.title}**:`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'drainage': {
      const lower = input.toLowerCase();
      const lengthM = extractNumber(lower, /(\d+)\s*(?:m|meter|metre|r\.m)/i) ?? extractNumber(lower, /(\d+)/i) ?? 100;
      const isSewer = /sewer|sewage|waste.*water/i.test(input);
      const est = estimateDrainage(lengthM, isSewer ? 'sewer' : 'storm');
      return {
        content: `Here's the detailed estimate for your **${est.title}**:`,
        estimation: est,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'compare-road': {
      const lengthKm = extractLengthKm(input);
      const widthM = extractWidthM(input, 7);
      const comp = compareRoadTypes(lengthKm, widthM);
      return {
        content: `Here's a **side-by-side comparison** of road types for ${lengthKm}km × ${widthM}m:`,
        comparison: comp,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    case 'compare-bridge': {
      const spanM = extractSpanM(input);
      const widthM = extractWidthM(input, 7.5);
      const comp = compareBridgeTypes(spanM, widthM);
      return {
        content: `Here's a **comparison of bridge options** for a ${spanM}m span:`,
        comparison: comp,
        links: [{ label: 'Buy Materials', href: '/products' }],
      };
    }

    default:
      return { content: '' };
  }
}

// ── Material Table Component ──
function MaterialTable({ materials, totalCost, labourCost, grandTotal }: { materials: MaterialItem[]; totalCost: number; labourCost: number; grandTotal: number }) {
  return (
    <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
              <th className="text-left px-2.5 py-2 font-semibold text-gray-700">Material</th>
              <th className="text-right px-2.5 py-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right px-2.5 py-2 font-semibold text-gray-700">Rate</th>
              <th className="text-right px-2.5 py-2 font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-2.5 py-1.5 text-gray-700 font-medium">{m.material}</td>
                <td className="px-2.5 py-1.5 text-right text-gray-600 whitespace-nowrap">{m.quantity} {m.unit}</td>
                <td className="px-2.5 py-1.5 text-right text-gray-500 whitespace-nowrap">₹{m.rate.toLocaleString('en-IN')}{m.rateUnit}</td>
                <td className="px-2.5 py-1.5 text-right text-gray-800 font-medium whitespace-nowrap">{formatCurrency(m.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={3} className="px-2.5 py-1.5 text-right font-semibold text-gray-600">Material Cost</td>
              <td className="px-2.5 py-1.5 text-right font-bold text-gray-800 whitespace-nowrap">{formatCurrency(totalCost)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-2.5 py-1.5 text-right font-semibold text-gray-600">Labour + Overheads</td>
              <td className="px-2.5 py-1.5 text-right font-bold text-gray-800 whitespace-nowrap">{formatCurrency(labourCost)}</td>
            </tr>
            <tr className="bg-gradient-to-r from-orange-100 to-amber-100 border-t-2 border-orange-300">
              <td colSpan={3} className="px-2.5 py-2 text-right font-bold text-orange-800 text-xs">TOTAL ESTIMATED COST</td>
              <td className="px-2.5 py-2 text-right font-black text-orange-700 text-sm whitespace-nowrap">{formatCurrency(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Comparison Cards Component ──
function ComparisonCards({ comparison }: { comparison: ComparisonResult }) {
  return (
    <div className="mt-2 space-y-2">
      {comparison.options.map((opt, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 p-3 transition-all ${opt.recommended
            ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md'
            : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-800">{opt.name}</span>
              {opt.recommended && (
                <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">RECOMMENDED</span>
              )}
            </div>
            <span className="font-black text-sm text-orange-700">{formatCurrency(opt.cost)}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div>
              <p className="font-semibold text-green-700 mb-0.5">Pros</p>
              {opt.pros.map((p, j) => (
                <p key={j} className="text-gray-600 flex items-start gap-1"><span className="text-green-500 mt-px">✓</span> {p}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-red-600 mb-0.5">Cons</p>
              {opt.cons.map((c, j) => (
                <p key={j} className="text-gray-600 flex items-start gap-1"><span className="text-red-400 mt-px">✗</span> {c}</p>
              ))}
            </div>
          </div>

          <p className="mt-1.5 text-[10px] text-gray-500 italic">Best for: {opt.bestFor}</p>
        </div>
      ))}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-3 py-2.5 text-[11px] text-blue-800">
        <p className="font-bold mb-0.5">🎯 Our Recommendation</p>
        {comparison.recommendation.split(/(\*\*.*?\*\*)/).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )}
      </div>
    </div>
  );
}

// ── Estimation Extras Component ──
function EstimationExtras({ estimation }: { estimation: EstimationResult }) {
  return (
    <div className="mt-2 space-y-1.5">
      {estimation.duration && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-[11px] text-purple-800 flex items-center gap-1.5">
          <span>⏱️</span>
          <span><strong>Estimated Duration:</strong> {estimation.duration}</span>
        </div>
      )}
      {estimation.recommendation && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-2.5 py-2 text-[11px] text-green-800">
          {estimation.recommendation.split(/(\*\*.*?\*\*)/).map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </div>
      )}
      {estimation.tip && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-800 flex items-start gap-1.5">
          <span className="mt-0.5">💡</span>
          <span><strong>Pro Tip:</strong> {estimation.tip}</span>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN CHATBOT COMPONENT
// ══════════════════════════════════════════════════════════════
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => setPulseCount(c => c + 1), 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

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
    const sanitized = sanitizeInput(text);
    if (!sanitized) return;

    // SECURITY: Block messages containing sensitive data patterns
    if (containsSensitiveData(sanitized)) {
      const warningMsg: ChatMessage = {
        id: Date.now(),
        role: 'bot',
        content: '⚠️ **Security Notice**: Please don\'t share sensitive information like passwords, card numbers, or personal IDs in the chat. This chatbot is for construction estimations only.\n\nYour message was blocked for your safety.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMsg]);
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const category = classifyInput(text);
      const estimationCategories: Category[] = ['building', 'road', 'bridge', 'compound-wall', 'retaining-wall', 'water-tank', 'septic-tank', 'drainage', 'compare-road', 'compare-bridge'];

      let botMsg: ChatMessage;

      if (estimationCategories.includes(category)) {
        const result = processEstimation(text, category);
        botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: result.content,
          timestamp: new Date(),
          links: result.links,
          estimation: result.estimation,
          comparison: result.comparison,
        };
      } else {
        const response = BOT_RESPONSES[category] || BOT_RESPONSES.fallback;
        botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: response.content,
          timestamp: new Date(),
          links: response.links,
          products: response.products,
        };
      }

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const resetChat = useCallback(() => {
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
          aria-label="Open Civil Engineering Estimator"
        >
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
          <div className={`absolute inset-0 rounded-full bg-orange-400 opacity-30 transition-transform duration-1000 ${pulseCount % 2 === 0 ? 'scale-125' : 'scale-100'}`} />
          <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-orange-500/40 hover:shadow-xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calculator className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">1</span>
              </span>
            )}
          </div>
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Civil Engineering Estimator
              <span className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-[420px] sm:w-[460px]'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[650px] max-h-[85vh]'}`}>
            {/* Header */}
            <div
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-5 py-4 flex items-center justify-between cursor-pointer shrink-0"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Nirmaan Estimator</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-orange-100 text-xs">Buildings • Roads • Bridges • More</span>
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
                          <Calculator className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
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

                        {/* Estimation table */}
                        {msg.estimation && (
                          <>
                            <MaterialTable
                              materials={msg.estimation.materials}
                              totalCost={msg.estimation.totalCost}
                              labourCost={msg.estimation.labourCost}
                              grandTotal={msg.estimation.grandTotal}
                            />
                            <EstimationExtras estimation={msg.estimation} />
                          </>
                        )}

                        {/* Comparison cards */}
                        {msg.comparison && (
                          <ComparisonCards comparison={msg.comparison} />
                        )}

                        {/* Product cards */}
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

                        {/* Action links */}
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
                        <Calculator className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] text-gray-400">Calculating...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 1 && !isTyping && (
                  <div className="px-4 pb-2 shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Estimations</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickPrompt(qp.label)}
                          className="text-left text-[11px] bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl px-2.5 py-2 transition-all hover:shadow-sm group"
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
                      placeholder="Try: 1500 sqft house, 2km road, 40m bridge..."
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
                  <p className="text-[10px] text-center text-gray-400 mt-2">Estimates are approximate • Actual costs may vary ±10-15%</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
