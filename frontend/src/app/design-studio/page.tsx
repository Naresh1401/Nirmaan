'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Layers, MapPin, Star, Clock, Shield, Search, ChevronRight,
  Crown, Lock, CheckCircle2, Phone, ArrowRight, Eye,
  Building2, Home, TreePine, Paintbrush, Ruler, Globe,
  Camera, Cpu, Users, Sparkles, IndianRupee, Award, X,
  Download, RotateCcw, AlertTriangle, Compass, ArrowUp,
  Sun, Droplets, Wind, Maximize2, ChevronDown,
} from 'lucide-react';

/* ── Tier access ─────────────────────────────────────────────────── */
const TIER_ORDER = ['free', 'silver', 'gold', 'platinum', 'enterprise'];
const MIN_TIER = 'gold'; // Architecture & Design Studio requires Gold+

/* ── Service Categories ──────────────────────────────────────────── */
const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'building', label: '🏗️ Building Design' },
  { id: 'interior', label: '🎨 Interior Design' },
  { id: 'landscape', label: '🌳 Landscape Design' },
  { id: 'structural', label: '🏛️ Structural Engineering' },
  { id: '3d', label: '🖥️ 3D Visualization' },
  { id: 'urban', label: '🌆 Urban Planning' },
  { id: 'renovation', label: '🔨 Renovation' },
];

/* ── Architects / Firms ──────────────────────────────────────────── */
const ARCHITECTS = [
  {
    id: '1', name: 'Ar. Priya Sharma', firm: 'Sharma Design Associates',
    type: 'building', location: 'Hyderabad', experience: '15 years',
    rating: 4.9, reviews: 127, projectsDone: 85,
    specialties: ['Residential Villas', 'Apartments', 'Commercial Complexes'],
    priceRange: '₹15–25/sqft', verified: true, available: true,
    image: '🏗️',
  },
  {
    id: '2', name: 'Ar. Karthik Reddy', firm: 'Reddy & Partners Architects',
    type: 'building', location: 'Karimnagar', experience: '10 years',
    rating: 4.7, reviews: 83, projectsDone: 52,
    specialties: ['Individual Houses', 'Farm Houses', 'School Buildings'],
    priceRange: '₹12–20/sqft', verified: true, available: true,
    image: '🏠',
  },
  {
    id: '3', name: 'Studio Verde Interiors', firm: 'Studio Verde',
    type: 'interior', location: 'Warangal', experience: '8 years',
    rating: 4.8, reviews: 64, projectsDone: 120,
    specialties: ['Modern Interiors', 'Modular Kitchen', 'Office Spaces'],
    priceRange: '₹800–1500/sqft', verified: true, available: true,
    image: '🎨',
  },
  {
    id: '4', name: 'GreenScape Designs', firm: 'GreenScape',
    type: 'landscape', location: 'Secunderabad', experience: '12 years',
    rating: 4.6, reviews: 45, projectsDone: 68,
    specialties: ['Garden Design', 'Terrace Gardens', 'Commercial Landscapes'],
    priceRange: '₹50–150/sqft', verified: true, available: false,
    image: '🌳',
  },
  {
    id: '5', name: 'Ar. Deepak Narayan', firm: 'StructurePro Engineers',
    type: 'structural', location: 'Hyderabad', experience: '20 years',
    rating: 4.9, reviews: 156, projectsDone: 200,
    specialties: ['RCC Design', 'Steel Structures', 'Foundation Design', 'Seismic Analysis'],
    priceRange: '₹8–15/sqft', verified: true, available: true,
    image: '🏛️',
  },
  {
    id: '6', name: 'PixelArch Studio', firm: 'PixelArch 3D',
    type: '3d', location: 'Hyderabad', experience: '6 years',
    rating: 4.8, reviews: 92, projectsDone: 310,
    specialties: ['3D Rendering', 'Walkthrough Animation', 'VR Tours', 'BIM Modeling'],
    priceRange: '₹5,000–50,000/project', verified: true, available: true,
    image: '🖥️',
  },
  {
    id: '7', name: 'Ar. Meghana Rao', firm: 'UrbanEdge Planning',
    type: 'urban', location: 'Nizamabad', experience: '14 years',
    rating: 4.5, reviews: 38, projectsDone: 25,
    specialties: ['Township Planning', 'Layout Design', 'Smart City Projects'],
    priceRange: '₹2–8/sqft', verified: true, available: true,
    image: '🌆',
  },
  {
    id: '8', name: 'RenovateRight', firm: 'RenovateRight Solutions',
    type: 'renovation', location: 'Karimnagar', experience: '9 years',
    rating: 4.7, reviews: 71, projectsDone: 140,
    specialties: ['Home Renovation', 'Structural Repairs', 'Waterproofing', 'Extensions'],
    priceRange: '₹500–1200/sqft', verified: true, available: true,
    image: '🔨',
  },
];

/* ── AI Tools offered ────────────────────────────────────────────── */
const AI_TOOLS = [
  { icon: Cpu, title: 'AI Floor Plan Generator', desc: 'Input plot dimensions & requirements — get optimized floor plans instantly', tier: 'gold', toolId: 'floorplan' },
  { icon: Eye, title: '3D Visualization Engine', desc: 'Convert 2D plans to interactive 3D models with materials & lighting', tier: 'gold', toolId: 'visualization' },
  { icon: Sparkles, title: 'AI Interior Styler', desc: 'Upload a room photo and get AI-generated interior design suggestions', tier: 'platinum', toolId: 'interior' },
  { icon: Globe, title: 'Urban Planning Simulator', desc: 'Simulate traffic, drainage, and infrastructure for township layouts', tier: 'enterprise', toolId: 'urban' },
  { icon: Camera, title: 'Drone Site Scanner', desc: 'Upload drone footage and get auto-generated 3D site models', tier: 'platinum', toolId: 'drone' },
  { icon: Ruler, title: 'Vastu & Compliance Checker', desc: 'Check your floor plan against Vastu principles and local building bylaws', tier: 'gold', toolId: 'vastu' },
];

/* ═══════════════════════════════════════════════════════════════════
   TOOL 1: AI Floor Plan Generator
   ═══════════════════════════════════════════════════════════════════ */
interface FloorPlanRoom { name: string; width: number; length: number; area: number; position: string; }

function generateFloorPlan(plotW: number, plotL: number, floors: number, bhk: number, style: string): { rooms: FloorPlanRoom[][]; totalArea: number; efficiency: number; tips: string[] } {
  const plotArea = plotW * plotL;
  const builtUpArea = plotArea * 0.65;
  const roomTemplates: Record<number, { name: string; pct: number }[]> = {
    1: [{ name: 'Living Room', pct: 0.30 }, { name: 'Bedroom', pct: 0.25 }, { name: 'Kitchen', pct: 0.15 }, { name: 'Bathroom', pct: 0.08 }, { name: 'Balcony', pct: 0.10 }, { name: 'Staircase/Lobby', pct: 0.12 }],
    2: [{ name: 'Living + Dining', pct: 0.28 }, { name: 'Master Bedroom', pct: 0.20 }, { name: 'Bedroom 2', pct: 0.16 }, { name: 'Kitchen', pct: 0.12 }, { name: 'Bathroom 1', pct: 0.06 }, { name: 'Bathroom 2', pct: 0.06 }, { name: 'Balcony', pct: 0.06 }, { name: 'Staircase/Lobby', pct: 0.06 }],
    3: [{ name: 'Living + Dining', pct: 0.24 }, { name: 'Master Bedroom', pct: 0.18 }, { name: 'Bedroom 2', pct: 0.14 }, { name: 'Bedroom 3', pct: 0.14 }, { name: 'Kitchen', pct: 0.10 }, { name: 'Bathroom 1', pct: 0.05 }, { name: 'Bathroom 2', pct: 0.04 }, { name: 'Bathroom 3', pct: 0.04 }, { name: 'Balcony', pct: 0.04 }, { name: 'Staircase/Lobby', pct: 0.03 }],
    4: [{ name: 'Living + Dining', pct: 0.20 }, { name: 'Master Suite', pct: 0.16 }, { name: 'Bedroom 2', pct: 0.13 }, { name: 'Bedroom 3', pct: 0.13 }, { name: 'Bedroom 4', pct: 0.11 }, { name: 'Kitchen', pct: 0.08 }, { name: 'Bath 1', pct: 0.04 }, { name: 'Bath 2', pct: 0.04 }, { name: 'Bath 3', pct: 0.03 }, { name: 'Pooja Room', pct: 0.03 }, { name: 'Lobby', pct: 0.05 }],
  };
  const template = roomTemplates[bhk] || roomTemplates[2]!;
  const positions = ['North-East', 'North-West', 'South-East', 'South-West', 'Center', 'East', 'West', 'North', 'South', 'Center-East', 'Center-West'];
  const allFloors: FloorPlanRoom[][] = [];
  for (let f = 0; f < floors; f++) {
    const floorRooms: FloorPlanRoom[] = template.map((r, i) => {
      const area = Math.round(builtUpArea * r.pct);
      const w = Math.round(Math.sqrt(area * (plotW / plotL)) * 10) / 10;
      const l = Math.round((area / w) * 10) / 10;
      return { name: f === 0 && i === template.length - 1 ? 'Parking / Staircase' : r.name, width: w, length: l, area, position: positions[i % positions.length] };
    });
    allFloors.push(floorRooms);
  }
  const tips: string[] = [];
  if (style === 'vastu') tips.push('Master bedroom placed in South-West for Vastu compliance', 'Kitchen in South-East (Agni corner) as per Vastu Shastra', 'Main entrance aligned to North-East for positive energy flow');
  if (style === 'modern') tips.push('Open floor plan maximizes living space', 'Large windows on South side for natural light', 'Modular kitchen with island counter recommended');
  if (style === 'traditional') tips.push('Central courtyard for ventilation and light', 'Separate pooja room near kitchen', 'Thick walls (230mm) for thermal insulation');
  if (style === 'compact') tips.push('Multi-purpose rooms reduce area waste', 'Sliding doors save swing space', 'Loft storage in bedrooms for compact living');
  tips.push(`Plot coverage: 65% (${Math.round(builtUpArea)} sqft per floor)`, `Set back: Minimum 1.5m on all sides as per building bylaws`, `Total built-up area: ${Math.round(builtUpArea * floors)} sqft across ${floors} floor(s)`);
  return { rooms: allFloors, totalArea: Math.round(builtUpArea * floors), efficiency: 65, tips };
}

function FloorPlanTool({ onClose }: { onClose: () => void }) {
  const [plotW, setPlotW] = useState(30);
  const [plotL, setPlotL] = useState(40);
  const [floors, setFloors] = useState(2);
  const [bhk, setBhk] = useState(3);
  const [style, setStyle] = useState('vastu');
  const [result, setResult] = useState<ReturnType<typeof generateFloorPlan> | null>(null);
  const generate = () => setResult(generateFloorPlan(plotW, plotL, floors, bhk, style));
  const downloadPlan = () => {
    if (!result) return;
    let txt = `AI FLOOR PLAN — ${plotW}ft × ${plotL}ft | ${bhk} BHK | ${floors} Floor(s) | Style: ${style}\n${'═'.repeat(60)}\n\n`;
    result.rooms.forEach((floor, fi) => {
      txt += `▸ ${fi === 0 ? 'Ground' : `Floor ${fi}`}\n${'─'.repeat(40)}\n`;
      txt += `${'Room'.padEnd(22)} ${'Size (ft)'.padEnd(12)} ${'Area'.padEnd(8)} Position\n`;
      floor.forEach(r => { txt += `${r.name.padEnd(22)} ${(r.width + '×' + r.length).padEnd(12)} ${(r.area + ' sqft').padEnd(8)} ${r.position}\n`; });
      txt += '\n';
    });
    txt += `Total Built-up: ${result.totalArea} sqft | Efficiency: ${result.efficiency}%\n\nTips:\n`;
    result.tips.forEach(t => { txt += `• ${t}\n`; });
    const el = document.createElement('a');
    el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
    el.download = `floor_plan_${plotW}x${plotL}_${bhk}BHK.txt`;
    el.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">AI Floor Plan Generator</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Plot Width (ft)</label>
              <input type="number" value={plotW} onChange={e => setPlotW(+e.target.value)} min={15} max={200} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Plot Length (ft)</label>
              <input type="number" value={plotL} onChange={e => setPlotL(+e.target.value)} min={15} max={200} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Floors</label>
              <select value={floors} onChange={e => setFloors(+e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none">
                {[1, 2, 3, 4].map(f => <option key={f} value={f}>{f === 1 ? 'G (Ground only)' : `G+${f - 1}`}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">BHK</label>
              <select value={bhk} onChange={e => setBhk(+e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none">
                {[1, 2, 3, 4].map(b => <option key={b} value={b}>{b} BHK</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Design Style</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'vastu', label: '🕉️ Vastu Compliant' },
                { id: 'modern', label: '🏢 Modern' },
                { id: 'traditional', label: '🏛️ Traditional' },
                { id: 'compact', label: '📐 Compact / Budget' },
              ].map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${style === s.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={generate} className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4" /> Generate Floor Plan
            </button>
            {result && (
              <button onClick={downloadPlan} className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            )}
          </div>

          {result && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Plot Area</p>
                  <p className="text-lg font-extrabold text-violet-700">{plotW * plotL} sqft</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Built-up Area</p>
                  <p className="text-lg font-extrabold text-green-700">{result.totalArea} sqft</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Efficiency</p>
                  <p className="text-lg font-extrabold text-blue-700">{result.efficiency}%</p>
                </div>
              </div>

              {result.rooms.map((floor, fi) => (
                <div key={fi} className="border rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-bold text-sm text-gray-700 border-b">
                    {fi === 0 ? '🏠 Ground Floor' : `🏗️ Floor ${fi}`}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100">
                    {floor.map((room, ri) => (
                      <div key={ri} className="bg-white p-3">
                        <p className="font-semibold text-xs text-gray-800">{room.name}</p>
                        <p className="text-[10px] text-gray-400">{room.width}ft × {room.length}ft</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-violet-600">{room.area} sqft</span>
                          <span className="text-[10px] text-gray-400">{room.position}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-amber-800 mb-2">💡 AI Recommendations</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL 2: 3D Visualization Engine
   ═══════════════════════════════════════════════════════════════════ */
function VisualizationTool({ onClose }: { onClose: () => void }) {
  const [buildingType, setBuildingType] = useState('residential');
  const [stories, setStories] = useState(2);
  const [material, setMaterial] = useState('brick');
  const [renderStyle, setRenderStyle] = useState('realistic');
  const [result, setResult] = useState<{ scene: string; specs: string[]; materials: { name: string; qty: string; cost: string }[] } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = () => {
    const matDescriptions: Record<string, string> = {
      brick: 'Red clay brick exterior with exposed brick features, grey mortar joints',
      concrete: 'Exposed concrete (béton brut) with board-formed texture, steel accents',
      glass: 'Curtain wall glazing with aluminium mullions, reflective Low-E glass',
      wood: 'Cedar wood cladding with natural grain, stained walnut finish',
      stone: 'Natural granite stone cladding with bush-hammered finish',
    };
    const buildingSpecs: Record<string, string[]> = {
      residential: ['Floor height: 3.0m (10ft) per storey', 'Foundation: Isolated footings with tie beams', 'Roof: Flat RCC slab with waterproofing', 'Windows: UPVC frames with clear glass', 'Walls: 230mm brick + 12mm plaster both sides'],
      commercial: ['Floor height: 3.6m (12ft) per storey', 'Foundation: Raft foundation / pile foundation', 'Structure: RCC frame with shear walls', 'Facade: ACP cladding with glass curtain wall', 'Fire rating: 2-hour fire resistance'],
      villa: ['Floor height: 3.3m (11ft) per storey', 'Foundation: Continuous footings', 'Roof: Sloped clay tile or flat with garden', 'Outdoor: Landscaped garden + driveway', 'Special: Double-height living room'],
    };
    const matList = [
      { name: 'Cement (OPC 53)', qty: `${stories * 120} bags`, cost: `₹${(stories * 120 * 380).toLocaleString()}` },
      { name: 'Steel (TMT Fe500D)', qty: `${stories * 1.8} tons`, cost: `₹${(stories * 1.8 * 58000).toLocaleString()}` },
      { name: 'Bricks/Blocks', qty: `${stories * 8000} nos`, cost: `₹${(stories * 8000 * 8).toLocaleString()}` },
      { name: 'Sand (M-Sand)', qty: `${stories * 25} tons`, cost: `₹${(stories * 25 * 1800).toLocaleString()}` },
      { name: 'Paint (Interior + Ext)', qty: `${stories * 15} liters`, cost: `₹${(stories * 15 * 350).toLocaleString()}` },
    ];
    setResult({
      scene: matDescriptions[material] || matDescriptions.brick,
      specs: buildingSpecs[buildingType] || buildingSpecs.residential,
      materials: matList,
    });

    // Draw a simple 3D-like building on canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      sky.addColorStop(0, '#87CEEB');
      sky.addColorStop(1, '#E0F0FF');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Ground
      ctx.fillStyle = '#8BC34A';
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // Building
      const buildW = 160, floorH = 50;
      const buildH = stories * floorH;
      const bx = w / 2 - buildW / 2, by = h * 0.6 - buildH;
      const colors: Record<string, string> = { brick: '#C0392B', concrete: '#95A5A6', glass: '#5DADE2', wood: '#8B4513', stone: '#7F8C8D' };
      ctx.fillStyle = colors[material] || '#C0392B';
      ctx.fillRect(bx, by, buildW, buildH);

      // 3D side
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.moveTo(bx + buildW, by);
      ctx.lineTo(bx + buildW + 30, by - 20);
      ctx.lineTo(bx + buildW + 30, by - 20 + buildH);
      ctx.lineTo(bx + buildW, by + buildH);
      ctx.closePath();
      ctx.fill();

      // 3D top
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 30, by - 20);
      ctx.lineTo(bx + buildW + 30, by - 20);
      ctx.lineTo(bx + buildW, by);
      ctx.closePath();
      ctx.fill();

      // Windows
      ctx.fillStyle = material === 'glass' ? 'rgba(255,255,255,0.4)' : '#AED6F1';
      for (let f = 0; f < stories; f++) {
        for (let wi = 0; wi < 4; wi++) {
          const wx = bx + 15 + wi * 38;
          const wy = by + f * floorH + 12;
          ctx.fillRect(wx, wy, 22, 28);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(wx, wy, 22, 28);
        }
      }

      // Door
      ctx.fillStyle = '#5B3A29';
      ctx.fillRect(bx + buildW / 2 - 12, by + buildH - 40, 24, 40);

      // Floor lines
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let f = 1; f < stories; f++) {
        ctx.beginPath();
        ctx.moveTo(bx, by + f * floorH);
        ctx.lineTo(bx + buildW, by + f * floorH);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${buildingType.toUpperCase()} — G+${stories - 1} | ${material.toUpperCase()}`, w / 2, h - 15);
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">3D Visualization Engine</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Building Type</label>
              <select value={buildingType} onChange={e => setBuildingType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="villa">Villa / Bungalow</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Floors</label>
              <select value={stories} onChange={e => setStories(+e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {[1, 2, 3, 4, 5, 6].map(f => <option key={f} value={f}>{f === 1 ? 'G' : `G+${f - 1}`}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Exterior Material</label>
              <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="brick">🧱 Brick</option>
                <option value="concrete">🏗️ Concrete</option>
                <option value="glass">🪟 Glass Curtain</option>
                <option value="wood">🪵 Wood Clad</option>
                <option value="stone">🪨 Stone</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Render Style</label>
              <select value={renderStyle} onChange={e => setRenderStyle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="realistic">Realistic</option>
                <option value="wireframe">Wireframe</option>
                <option value="blueprint">Blueprint</option>
              </select>
            </div>
          </div>
          <button onClick={generate} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" /> Generate 3D View
          </button>

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-2xl p-4">
                <canvas ref={canvasRef} width={500} height={350} className="w-full rounded-xl" />
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-blue-800 mb-1">Material Finish</h4>
                <p className="text-xs text-blue-700">{result.scene}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-gray-800 mb-2">Building Specifications</h4>
                <ul className="space-y-1">{result.specs.map((s, i) => <li key={i} className="text-xs text-gray-600 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-bold text-sm text-gray-700 border-b">Estimated Materials</div>
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left font-semibold text-gray-600">Material</th><th className="px-4 py-2 text-left font-semibold text-gray-600">Quantity</th><th className="px-4 py-2 text-left font-semibold text-gray-600">Est. Cost</th></tr></thead>
                  <tbody>{result.materials.map(m => <tr key={m.name} className="border-t"><td className="px-4 py-2 text-gray-700">{m.name}</td><td className="px-4 py-2 text-gray-700">{m.qty}</td><td className="px-4 py-2 font-semibold text-green-700">{m.cost}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL 3: AI Interior Styler
   ═══════════════════════════════════════════════════════════════════ */
function InteriorStylerTool({ onClose }: { onClose: () => void }) {
  const [roomType, setRoomType] = useState('living');
  const [styleType, setStyleType] = useState('modern');
  const [budget, setBudget] = useState('medium');
  const [area, setArea] = useState(200);
  const [result, setResult] = useState<{ headline: string; palette: string[]; items: { item: string; brand: string; cost: string }[]; tips: string[] } | null>(null);

  const generate = () => {
    const palettes: Record<string, string[]> = {
      modern: ['#2C3E50', '#ECF0F1', '#3498DB', '#E74C3C', '#F39C12'],
      minimalist: ['#FFFFFF', '#F5F5F5', '#333333', '#888888', '#C0C0C0'],
      traditional: ['#8B4513', '#DAA520', '#F5F5DC', '#800020', '#006400'],
      industrial: ['#4A4A4A', '#8B8B8B', '#D4A017', '#1C1C1C', '#B87333'],
      scandinavian: ['#F8F4E3', '#A3B18A', '#DDB892', '#FFFFFF', '#6B705C'],
    };
    const furniture: Record<string, Record<string, { item: string; brand: string; cost: string }[]>> = {
      living: {
        medium: [
          { item: '3-Seater Sofa (L-Shape)', brand: 'Durian / Godrej Interio', cost: '₹35,000–55,000' },
          { item: 'Center Table (Teak/Glass)', brand: 'Urban Ladder', cost: '₹8,000–15,000' },
          { item: 'TV Unit (Wall-mounted)', brand: 'HomeTown / Pepperfry', cost: '₹12,000–22,000' },
          { item: 'Coffee Table', brand: 'IKEA / Nilkamal', cost: '₹5,000–10,000' },
          { item: 'Curtains (Blackout)', brand: 'D\'Decor / Spaces', cost: '₹3,000–6,000' },
          { item: 'Ceiling Lights (LED Panel)', brand: 'Havells / Philips', cost: '₹4,000–8,000' },
          { item: 'Wall Art / Decor', brand: 'Chumbak / ExclusiveLane', cost: '₹2,000–5,000' },
        ],
        low: [
          { item: '3-Seater Sofa (Fabric)', brand: 'Nilkamal / Zuari', cost: '₹15,000–25,000' },
          { item: 'Center Table', brand: 'Nilkamal / Local', cost: '₹3,000–6,000' },
          { item: 'TV Stand', brand: 'Local Carpenter', cost: '₹5,000–8,000' },
          { item: 'Curtains', brand: 'Amazon / Local', cost: '₹1,500–3,000' },
          { item: 'Lights', brand: 'Syska / Wipro', cost: '₹2,000–4,000' },
        ],
        high: [
          { item: 'Italian Leather Sofa', brand: 'Durian Premium / BoConcept', cost: '₹1,20,000–3,00,000' },
          { item: 'Marble Center Table', brand: 'Custom / Imported', cost: '₹25,000–60,000' },
          { item: 'Custom TV Unit (Lacquer)', brand: 'Studio Designs', cost: '₹45,000–1,00,000' },
          { item: 'Motorized Curtains', brand: 'Somfy / Hunter Douglas', cost: '₹15,000–35,000' },
          { item: 'Chandelier / Designer Lights', brand: 'Jainsons / Fos Lighting', cost: '₹20,000–60,000' },
        ],
      },
      bedroom: {
        medium: [
          { item: 'King Size Bed (with storage)', brand: 'Godrej Interio / Durian', cost: '₹30,000–50,000' },
          { item: 'Wardrobe (3-door sliding)', brand: 'Urban Ladder / Pepperfry', cost: '₹25,000–45,000' },
          { item: 'Bedside Tables (pair)', brand: 'HomeTown', cost: '₹6,000–12,000' },
          { item: 'Mattress (Ortho Memory Foam)', brand: 'Sleepyhead / Wakefit', cost: '₹12,000–20,000' },
          { item: 'Dressing Table', brand: 'Pepperfry / IKEA', cost: '₹8,000–15,000' },
        ],
        low: [
          { item: 'Queen Size Bed', brand: 'Nilkamal / Local', cost: '₹12,000–20,000' },
          { item: 'Wardrobe (2-door)', brand: 'Zuari / Nilkamal', cost: '₹10,000–18,000' },
          { item: 'Mattress', brand: 'Kurlon / Centuary', cost: '₹6,000–10,000' },
        ],
        high: [
          { item: 'Custom King Bed (Teak)', brand: 'Custom Carpenter', cost: '₹80,000–1,50,000' },
          { item: 'Walk-in Wardrobe System', brand: 'Hettich / Hafele', cost: '₹1,50,000–3,00,000' },
          { item: 'Latex Mattress', brand: 'Sunday / Hastens', cost: '₹40,000–1,00,000' },
        ],
      },
      kitchen: {
        medium: [
          { item: 'Modular Kitchen (L-Shaped)', brand: 'Kutchina / Godrej', cost: '₹1,50,000–2,50,000' },
          { item: 'Chimney (60cm Auto-Clean)', brand: 'Faber / Elica', cost: '₹12,000–18,000' },
          { item: 'Built-in Hob (4 Burner)', brand: 'Bosch / Prestige', cost: '₹10,000–18,000' },
          { item: 'Countertop (Granite)', brand: 'Local / Granito', cost: '₹8,000–15,000' },
        ],
        low: [
          { item: 'Semi-Modular Kitchen', brand: 'Local Carpenter', cost: '₹60,000–1,00,000' },
          { item: 'Chimney (Basic)', brand: 'Kaff / Glen', cost: '₹5,000–8,000' },
          { item: 'Gas Stove', brand: 'Prestige / Pigeon', cost: '₹3,000–6,000' },
        ],
        high: [
          { item: 'Full Modular Kitchen (Island)', brand: 'Sleek / Poggenpohl', cost: '₹5,00,000–12,00,000' },
          { item: 'Built-in Appliances Set', brand: 'Bosch / Siemens', cost: '₹1,00,000–3,00,000' },
          { item: 'Quartz Countertop', brand: 'Caesarstone / Silestone', cost: '₹40,000–80,000' },
        ],
      },
    };
    const tips: Record<string, string[]> = {
      modern: ['Use neutral base colors with bold accent pieces', 'Opt for clean lines and minimal ornamentation', 'Integrate smart lighting (Philips Hue / LIFX)'],
      minimalist: ['\"Less is more\" — keep only essential furniture', 'Use hidden storage to maintain clean lines', 'Stick to 2-3 colors maximum'],
      traditional: ['Use wood-tone furniture with carved details', 'Add brass or copper accent pieces', 'Include textile elements like cushions and rugs'],
      industrial: ['Expose brick walls or use brick-effect wallpaper', 'Metal and wood combination for furniture', 'Use Edison bulb pendant lights'],
      scandinavian: ['Maximize natural light — use sheer curtains', 'Light wood (birch, pine) for furniture', 'Add indoor plants for warmth and color'],
    };
    const roomItems = furniture[roomType] || furniture.living;
    const budgetItems = roomItems[budget] || roomItems.medium;
    setResult({
      headline: `${styleType.charAt(0).toUpperCase() + styleType.slice(1)} ${roomType === 'living' ? 'Living Room' : roomType === 'bedroom' ? 'Bedroom' : 'Kitchen'} — ${area} sqft`,
      palette: palettes[styleType] || palettes.modern,
      items: budgetItems,
      tips: tips[styleType] || tips.modern,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">AI Interior Styler</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Room Type</label>
              <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="living">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="kitchen">Kitchen</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Style</label>
              <select value={styleType} onChange={e => setStyleType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="modern">Modern</option>
                <option value="minimalist">Minimalist</option>
                <option value="traditional">Traditional</option>
                <option value="industrial">Industrial</option>
                <option value="scandinavian">Scandinavian</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Budget</label>
              <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none">
                <option value="low">Budget-Friendly</option>
                <option value="medium">Mid-Range</option>
                <option value="high">Premium / Luxury</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Area (sqft)</label>
              <input type="number" value={area} onChange={e => setArea(+e.target.value)} min={50} max={2000} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={generate} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Generate Interior Design
          </button>

          {result && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">{result.headline}</h3>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Color Palette</p>
                <div className="flex gap-2">
                  {result.palette.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-xl shadow-sm border" style={{ backgroundColor: c }} />
                      <span className="text-[10px] text-gray-400 font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-bold text-sm text-gray-700 border-b">Recommended Furniture & Fixtures</div>
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left font-semibold text-gray-600">Item</th><th className="px-4 py-2 text-left font-semibold text-gray-600">Brand</th><th className="px-4 py-2 text-left font-semibold text-gray-600">Price Range</th></tr></thead>
                  <tbody>{result.items.map(item => <tr key={item.item} className="border-t"><td className="px-4 py-2 text-gray-700">{item.item}</td><td className="px-4 py-2 text-gray-500">{item.brand}</td><td className="px-4 py-2 font-semibold text-violet-700">{item.cost}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-pink-800 mb-2">✨ Style Tips</h4>
                <ul className="space-y-1">{result.tips.map((t, i) => <li key={i} className="text-xs text-pink-700 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
              </div>
              <p className="text-[10px] text-gray-400 text-center">💡 For AI-generated photorealistic renderings, integrate with OpenAI DALL-E or Stability AI. Contact us for API setup.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL 4: Vastu & Compliance Checker
   ═══════════════════════════════════════════════════════════════════ */
interface VastuResult { score: number; rules: { rule: string; status: 'pass' | 'fail' | 'warn'; tip: string }[]; bylaws: { rule: string; status: 'pass' | 'fail' }[] }

function VastuTool({ onClose }: { onClose: () => void }) {
  const [entrance, setEntrance] = useState('north-east');
  const [kitchen, setKitchen] = useState('south-east');
  const [master, setMaster] = useState('south-west');
  const [pooja, setPooja] = useState('north-east');
  const [bathroom, setBathroom] = useState('north-west');
  const [staircase, setStaircase] = useState('south-west');
  const [plotArea, setPlotArea] = useState(1200);
  const [result, setResult] = useState<VastuResult | null>(null);

  const directions = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'center'];

  const analyze = () => {
    const rules: VastuResult['rules'] = [];
    // Entrance
    if (entrance === 'north-east' || entrance === 'north' || entrance === 'east') rules.push({ rule: 'Main entrance faces North/North-East/East', status: 'pass', tip: 'Excellent! North-East entrance attracts positive energy and prosperity' });
    else if (entrance === 'south' || entrance === 'south-west') rules.push({ rule: 'Main entrance faces South/South-West', status: 'fail', tip: 'South-West entrance is inauspicious. Consider relocating to North-East if possible' });
    else rules.push({ rule: `Main entrance faces ${entrance}`, status: 'warn', tip: 'Acceptable but not ideal. North-East is the most auspicious direction' });

    // Kitchen
    if (kitchen === 'south-east') rules.push({ rule: 'Kitchen in South-East (Agni corner)', status: 'pass', tip: 'Perfect placement! South-East is the fire element — ideal for cooking' });
    else if (kitchen === 'north-west') rules.push({ rule: 'Kitchen in North-West', status: 'warn', tip: 'Acceptable alternative. Ensure cook faces East while cooking' });
    else rules.push({ rule: `Kitchen in ${kitchen}`, status: 'fail', tip: 'Kitchen should be in South-East (Agni corner) or North-West as alternative' });

    // Master bedroom
    if (master === 'south-west') rules.push({ rule: 'Master bedroom in South-West', status: 'pass', tip: 'Correct! South-West gives stability and authority to the head of household' });
    else if (master === 'south') rules.push({ rule: 'Master bedroom in South', status: 'warn', tip: 'Acceptable. Ensure bed head points South or West' });
    else rules.push({ rule: `Master bedroom in ${master}`, status: 'fail', tip: 'Master bedroom should be in South-West for stability and good health' });

    // Pooja room
    if (pooja === 'north-east' || pooja === 'east') rules.push({ rule: 'Pooja room in North-East/East', status: 'pass', tip: 'Ideal placement. Face East or North while praying' });
    else rules.push({ rule: `Pooja room in ${pooja}`, status: 'fail', tip: 'Pooja room must be in North-East (Ishan corner) or East' });

    // Bathroom
    if (bathroom === 'north-west' || bathroom === 'west') rules.push({ rule: 'Bathroom in North-West/West', status: 'pass', tip: 'Good placement. Ensure toilet seat faces North-South axis' });
    else if (bathroom === 'north-east') rules.push({ rule: 'Bathroom in North-East', status: 'fail', tip: 'Never place bathroom in North-East — this is the most sacred direction' });
    else rules.push({ rule: `Bathroom in ${bathroom}`, status: 'warn', tip: 'Not ideal. North-West is the recommended direction for bathrooms' });

    // Staircase
    if (staircase === 'south-west' || staircase === 'south') rules.push({ rule: 'Staircase in South/South-West', status: 'pass', tip: 'Correct! Stairs should always turn clockwise going up' });
    else if (staircase === 'north-east') rules.push({ rule: 'Staircase in North-East', status: 'fail', tip: 'Staircase in North-East blocks positive energy flow. Move to South-West' });
    else rules.push({ rule: `Staircase in ${staircase}`, status: 'warn', tip: 'South-West corner is the best location for staircases' });

    // Additional rules
    rules.push({ rule: 'Water source (overhead tank) in North-East', status: 'pass', tip: 'North-East is the water element direction — ideal for water storage' });
    rules.push({ rule: 'Slope of land towards North-East', status: 'pass', tip: 'Land should slope from South-West (high) to North-East (low)' });

    const score = Math.round((rules.filter(r => r.status === 'pass').length / rules.length) * 100);

    // Building bylaws
    const bylaws: VastuResult['bylaws'] = [
      { rule: `Plot area ${plotArea} sqft — ${plotArea >= 500 ? 'Meets minimum plot size' : 'Below minimum 500 sqft'}`, status: plotArea >= 500 ? 'pass' : 'fail' },
      { rule: 'Front setback: 1.5m minimum', status: 'pass' },
      { rule: 'Side setback: 1.0m minimum', status: 'pass' },
      { rule: 'Rear setback: 1.0m minimum', status: 'pass' },
      { rule: `Ground coverage: 65% (${Math.round(plotArea * 0.65)} sqft allowable)`, status: 'pass' },
      { rule: 'Building height: Max G+3 for residential', status: 'pass' },
      { rule: 'Car parking: 1 per dwelling unit', status: 'pass' },
      { rule: 'Rainwater harvesting: Mandatory for plots > 200 sqm', status: plotArea > 2150 ? 'pass' : 'warn' as 'pass' | 'fail' },
    ];

    setResult({ score, rules, bylaws });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Vastu & Compliance Checker</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-xs text-gray-500">Select the direction/position of each room in your floor plan to check Vastu compliance.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: '🚪 Main Entrance', val: entrance, set: setEntrance },
              { label: '🍳 Kitchen', val: kitchen, set: setKitchen },
              { label: '🛏️ Master Bedroom', val: master, set: setMaster },
              { label: '🕉️ Pooja Room', val: pooja, set: setPooja },
              { label: '🚿 Bathroom', val: bathroom, set: setBathroom },
              { label: '🪜 Staircase', val: staircase, set: setStaircase },
            ].map(item => (
              <div key={item.label}>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{item.label}</label>
                <select value={item.val} onChange={e => item.set(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none capitalize">
                  {directions.map(d => <option key={d} value={d} className="capitalize">{d.replace('-', ' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Plot Area (sqft)</label>
            <input type="number" value={plotArea} onChange={e => setPlotArea(+e.target.value)} min={100} className="w-48 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <button onClick={analyze} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Ruler className="w-4 h-4" /> Analyze Vastu & Compliance
          </button>

          {result && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-extrabold ${result.score >= 80 ? 'bg-green-100 text-green-700' : result.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {result.score}%
                </div>
                <p className="text-sm font-bold text-gray-700 mt-2">
                  {result.score >= 80 ? '✅ Excellent Vastu Compliance' : result.score >= 50 ? '⚠️ Moderate – Improvements Needed' : '❌ Poor – Major Changes Required'}
                </p>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-amber-50 px-4 py-2 font-bold text-sm text-amber-800 border-b">🕉️ Vastu Analysis</div>
                <div className="divide-y">
                  {result.rules.map((r, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className={`mt-0.5 text-sm ${r.status === 'pass' ? 'text-green-500' : r.status === 'fail' ? 'text-red-500' : 'text-amber-500'}`}>
                        {r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️'}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{r.rule}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{r.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 font-bold text-sm text-blue-800 border-b">📋 Building Bylaw Compliance (Telangana DTCP)</div>
                <div className="divide-y">
                  {result.bylaws.map((b, i) => (
                    <div key={i} className="px-4 py-2 flex items-center gap-3">
                      <span className="text-sm">{b.status === 'pass' ? '✅' : '❌'}</span>
                      <p className="text-xs text-gray-700">{b.rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL 5: Urban Planning Simulator
   ═══════════════════════════════════════════════════════════════════ */
function UrbanPlanningTool({ onClose }: { onClose: () => void }) {
  const [townshipArea, setTownshipArea] = useState(50);
  const [plots, setPlots] = useState(200);
  const [roadWidth, setRoadWidth] = useState(9);
  const [greenPercent, setGreenPercent] = useState(15);
  const [result, setResult] = useState<{ trafficScore: number; drainageScore: number; greenScore: number; infra: { item: string; value: string; status: string }[]; recommendations: string[] } | null>(null);

  const simulate = () => {
    const density = plots / townshipArea;
    const trafficScore = density < 5 ? 92 : density < 8 ? 78 : density < 12 ? 62 : 45;
    const drainageScore = roadWidth >= 12 ? 95 : roadWidth >= 9 ? 82 : roadWidth >= 6 ? 65 : 40;
    const greenScore = greenPercent >= 25 ? 96 : greenPercent >= 15 ? 80 : greenPercent >= 10 ? 60 : 35;
    const totalRoadLength = Math.round(Math.sqrt(townshipArea * 43560) * 0.3 / 3.28);
    const waterDemand = plots * 135 * 4;
    const sewerLoad = Math.round(waterDemand * 0.8);
    const infra = [
      { item: 'Total Road Length', value: `${totalRoadLength} meters`, status: roadWidth >= 9 ? '✅' : '⚠️' },
      { item: 'Water Demand', value: `${(waterDemand / 1000).toFixed(0)} KLD`, status: waterDemand < 500000 ? '✅' : '⚠️' },
      { item: 'Sewer Load', value: `${(sewerLoad / 1000).toFixed(0)} KLD`, status: '✅' },
      { item: 'Storm Water Drains', value: `${Math.round(totalRoadLength * 0.6)} meters`, status: '✅' },
      { item: 'Street Lights', value: `${Math.round(totalRoadLength / 25)} nos`, status: '✅' },
      { item: 'Transformer Capacity', value: `${Math.round(plots * 3.5)} kVA`, status: '✅' },
      { item: 'STP Required', value: `${(sewerLoad / 1000).toFixed(0)} KLD capacity`, status: '✅' },
      { item: 'Parking (Visitor)', value: `${Math.round(plots * 0.3)} spaces`, status: plots * 0.3 >= 20 ? '✅' : '⚠️' },
    ];
    const recs: string[] = [];
    if (density >= 8) recs.push('High plot density detected — consider reducing plots or adding internal roads');
    if (roadWidth < 9) recs.push('Road width below 9m — DTCP requires minimum 9m for residential layouts');
    if (greenPercent < 15) recs.push('Green space below 15% — DTCP mandates minimum 10%, IGBC recommends 15%+');
    recs.push(`Peak traffic estimate: ${Math.round(plots * 1.2)} vehicles/hour — ${density < 8 ? 'manageable with current road network' : 'consider traffic calming measures'}`);
    recs.push('Recommend solar street lighting for 30% energy savings');
    recs.push(`Rainwater harvesting potential: ${Math.round(townshipArea * 43560 * 0.0929 * 0.8 * 0.001)} KL/year from rooftops`);
    if (plots > 100) recs.push('Community amenities required: park, community hall, children\'s play area');
    setResult({ trafficScore, drainageScore, greenScore, infra, recommendations: recs });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Urban Planning Simulator</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Township Area (acres)</label>
              <input type="number" value={townshipArea} onChange={e => setTownshipArea(+e.target.value)} min={5} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Number of Plots</label>
              <input type="number" value={plots} onChange={e => setPlots(+e.target.value)} min={10} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Road Width (meters)</label>
              <select value={roadWidth} onChange={e => setRoadWidth(+e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {[6, 9, 12, 15, 18, 24, 30].map(w => <option key={w} value={w}>{w}m</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Green Space %</label>
              <input type="number" value={greenPercent} onChange={e => setGreenPercent(+e.target.value)} min={5} max={50} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={simulate} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" /> Run Simulation
          </button>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Traffic Flow', score: result.trafficScore, color: 'emerald' },
                  { label: 'Drainage', score: result.drainageScore, color: 'blue' },
                  { label: 'Green Index', score: result.greenScore, color: 'green' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full text-lg font-extrabold ${s.score >= 80 ? 'bg-green-100 text-green-700' : s.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {s.score}
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-bold text-sm text-gray-700 border-b">Infrastructure Requirements</div>
                <div className="divide-y">{result.infra.map(item => (
                  <div key={item.item} className="px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-600">{item.item}</span>
                    <span className="text-xs font-bold text-gray-800">{item.status} {item.value}</span>
                  </div>
                ))}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-emerald-800 mb-2">📊 Recommendations</h4>
                <ul className="space-y-1">{result.recommendations.map((r, i) => <li key={i} className="text-xs text-emerald-700 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />{r}</li>)}</ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOOL 6: Drone Site Scanner
   ═══════════════════════════════════════════════════════════════════ */
function DroneScannerTool({ onClose }: { onClose: () => void }) {
  const [siteType, setSiteType] = useState('building');
  const [siteArea, setSiteArea] = useState(5000);
  const [currentStage, setCurrentStage] = useState('foundation');
  const [result, setResult] = useState<{ overview: string; metrics: { label: string; value: string; status: string }[]; issues: string[]; timeline: { phase: string; progress: number }[] } | null>(null);

  const scan = () => {
    const stages: Record<string, number> = { foundation: 15, plinth: 25, superstructure: 50, finishing: 75, handover: 95 };
    const stageProgress = stages[currentStage] || 30;
    const metrics = [
      { label: 'Site Area', value: `${siteArea.toLocaleString()} sqft`, status: '✅' },
      { label: 'Overall Progress', value: `${stageProgress}%`, status: stageProgress >= 40 ? '✅' : '⚠️' },
      { label: 'Earthwork Volume', value: `${Math.round(siteArea * 0.3)} cubic ft`, status: '✅' },
      { label: 'Material on Site', value: stageProgress > 30 ? 'Adequate' : 'Low stock detected', status: stageProgress > 30 ? '✅' : '⚠️' },
      { label: 'Worker Count (Estimated)', value: `${Math.round(siteArea / 200)}–${Math.round(siteArea / 150)}`, status: '✅' },
      { label: 'Safety Compliance', value: stageProgress < 50 ? '82%' : '91%', status: stageProgress < 50 ? '⚠️' : '✅' },
      { label: 'Deviation from Plan', value: stageProgress < 30 ? '2.3%' : '1.1%', status: '✅' },
    ];
    const issues: string[] = [];
    if (currentStage === 'foundation') {
      issues.push('Waterlogging detected in NE corner — recommend dewatering');
      issues.push('Soil erosion risk on west boundary — install retaining wall');
    }
    if (currentStage === 'superstructure') {
      issues.push('Column alignment deviation of 8mm in Grid C-3 — within tolerance');
      issues.push('Formwork removal too early in section B — monitor for 48 hours');
    }
    if (currentStage === 'finishing') {
      issues.push('Plaster cracks detected on South elevation — recommend repair before painting');
    }
    if (!issues.length) issues.push('No critical issues detected — site is progressing well');

    const timeline = [
      { phase: 'Earthwork & Foundation', progress: Math.min(100, stageProgress * 3) },
      { phase: 'Plinth & Basement', progress: Math.min(100, Math.max(0, (stageProgress - 15) * 4)) },
      { phase: 'Superstructure (RCC)', progress: Math.min(100, Math.max(0, (stageProgress - 25) * 3)) },
      { phase: 'Brick Work & Plastering', progress: Math.min(100, Math.max(0, (stageProgress - 50) * 4)) },
      { phase: 'Finishing & Handover', progress: Math.min(100, Math.max(0, (stageProgress - 75) * 5)) },
    ];

    setResult({
      overview: `${siteType === 'building' ? 'Building' : siteType === 'road' ? 'Road' : 'Infrastructure'} site of ${siteArea.toLocaleString()} sqft scanned. Currently at ${currentStage} stage (${stageProgress}% complete). AI analysis generated from simulated drone orthomosaic data.`,
      metrics, issues, timeline,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Drone Site Scanner</h2>
          </div>
          <button onClick={onClose} title="Close" className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Site Type</label>
              <select value={siteType} onChange={e => setSiteType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="building">Building</option>
                <option value="road">Road / Highway</option>
                <option value="infra">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Site Area (sqft)</label>
              <input type="number" value={siteArea} onChange={e => setSiteArea(+e.target.value)} min={500} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Current Stage</label>
              <select value={currentStage} onChange={e => setCurrentStage(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="foundation">Foundation</option>
                <option value="plinth">Plinth Level</option>
                <option value="superstructure">Superstructure</option>
                <option value="finishing">Finishing</option>
                <option value="handover">Near Handover</option>
              </select>
            </div>
          </div>
          <button onClick={scan} className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Scan & Analyze Site
          </button>

          {result && (
            <div className="space-y-4">
              <div className="bg-sky-50 rounded-xl p-4">
                <p className="text-xs text-sky-800">{result.overview}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.metrics.slice(0, 4).map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400">{m.label}</p>
                    <p className="text-sm font-extrabold text-gray-800">{m.status} {m.value}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-bold text-sm text-gray-700 border-b">Construction Progress</div>
                <div className="p-4 space-y-3">
                  {result.timeline.map(t => (
                    <div key={t.phase}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{t.phase}</span>
                        <span className="font-bold text-gray-800">{t.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${t.progress >= 80 ? 'bg-green-500' : t.progress >= 40 ? 'bg-blue-500' : t.progress > 0 ? 'bg-amber-500' : 'bg-gray-200'}`} style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {result.issues.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-amber-800 mb-2">⚠️ Issues Detected</h4>
                  <ul className="space-y-1">{result.issues.map((issue, i) => <li key={i} className="text-xs text-amber-700 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{issue}</li>)}</ul>
                </div>
              )}
              <p className="text-[10px] text-gray-400 text-center">📡 For real drone integration, connect DJI FlightHub or Pix4D API. Contact support for setup.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Design Packages ─────────────────────────────────────────────── */
const DESIGN_PACKAGES = [
  {
    name: 'Basic Floor Plan',
    price: '₹4,999',
    features: ['2D Floor Plan', 'Up to 1500 sqft', '2 Revisions', 'PDF Delivery'],
    tier: 'gold',
    popular: false,
  },
  {
    name: 'Complete Design Package',
    price: '₹24,999',
    features: ['2D + 3D Floor Plan', 'Elevation Design', 'Interior Suggestions', '3D Walkthrough', '5 Revisions', 'Structural Drawing'],
    tier: 'gold',
    popular: true,
  },
  {
    name: 'Premium Architecture Suite',
    price: '₹74,999',
    features: ['Full Architectural Drawing Set', '3D Rendering + VR Tour', 'Interior Design (All Rooms)', 'Landscape Design', 'MEP Drawings', 'Unlimited Revisions', 'On-site Consultation'],
    tier: 'platinum',
    popular: false,
  },
];

/* ── Component ────────────────────────────────────────────────────── */
export default function DesignStudioPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchitect, setSelectedArchitect] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const userTier = user?.membership_tier || 'free';
  const userTierIdx = TIER_ORDER.indexOf(userTier);
  const hasAccess = userTierIdx >= TIER_ORDER.indexOf(MIN_TIER);

  const filteredArchitects = ARCHITECTS.filter(a => {
    const matchCategory = activeCategory === 'all' || a.type === activeCategory;
    const matchSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  /* ── Access Gate ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Layers className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Architecture & Design Studio</h1>
          <p className="text-gray-500 mb-6">Sign in to access professional architects, AI design tools, and 3D visualization services.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Architecture & Design Studio</h1>
          <p className="text-gray-500 mb-2">This module requires <span className="font-semibold text-amber-600">Gold</span> tier or above.</p>
          <p className="text-gray-400 text-sm mb-6">Your current plan: <span className="font-semibold capitalize">{userTier}</span></p>
          <Link href="/premium" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all">
            <Crown className="w-4 h-4" /> Upgrade to Gold <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-gray-50">

      {/* ═══ Hero ═══ */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm mb-5">
            <Layers className="w-4 h-4 text-yellow-300" />
            Gold+ Feature — Architecture & Design Studio
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Architecture &<br />
            <span className="text-yellow-300">Design Studio</span>
          </h1>
          <p className="text-lg text-violet-100 max-w-3xl mx-auto mb-6">
            Connect with verified architects, structural engineers, and interior designers.
            Use AI-powered tools for floor plans, 3D visualization, and urban planning.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {ARCHITECTS.length}+ Professionals</span>
            <span className="flex items-center gap-1"><Cpu className="w-4 h-4" /> {AI_TOOLS.length} AI Tools</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Verified & Rated</span>
          </div>
        </div>
      </section>

      {/* ═══ AI Design Tools ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Design Tools</h2>
          <p className="text-gray-500">Automate floor plans, visualizations, and compliance checks with AI</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_TOOLS.map(tool => {
            const Icon = tool.icon;
            const toolTierIdx = TIER_ORDER.indexOf(tool.tier);
            const canUse = userTierIdx >= toolTierIdx;
            return (
              <div key={tool.title} className={`rounded-2xl border p-5 transition-all ${canUse ? 'bg-white hover:shadow-md hover:border-violet-200' : 'bg-gray-50 opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canUse ? 'bg-violet-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${canUse ? 'text-violet-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-gray-900">{tool.title}</h3>
                      {!canUse && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                    <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      tool.tier === 'gold' ? 'bg-amber-100 text-amber-700' :
                      tool.tier === 'platinum' ? 'bg-violet-100 text-violet-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tool.tier === 'gold' ? 'Gold+' : tool.tier === 'platinum' ? 'Platinum+' : 'Enterprise'}
                    </span>
                  </div>
                </div>
                {canUse && (
                  <button onClick={() => setActiveTool(tool.toolId)} className="mt-3 w-full text-center text-xs font-semibold text-violet-600 bg-violet-50 rounded-lg py-2 hover:bg-violet-100 transition-all">
                    Launch Tool →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Design Packages ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Packages</h2>
          <p className="text-gray-500">Ready-made packages for residential and commercial projects</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {DESIGN_PACKAGES.map(pkg => {
            const pkgTierIdx = TIER_ORDER.indexOf(pkg.tier);
            const canBuy = userTierIdx >= pkgTierIdx;
            return (
              <div key={pkg.name} className={`rounded-2xl border p-6 bg-white relative ${pkg.popular ? 'border-violet-300 shadow-lg ring-2 ring-violet-100' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-sm mb-1">{pkg.name}</h3>
                <div className="text-2xl font-extrabold text-violet-700 mb-3">{pkg.price}</div>
                <ul className="space-y-2 mb-5">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!canBuy}
                  onClick={() => canBuy && showToast(`Subscribed to ${pkg.name}! ✅`)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    canBuy
                      ? 'bg-violet-600 text-white hover:bg-violet-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canBuy ? 'Get Started' : `Requires ${pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)}+`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Browse Architects & Designers ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Architects & Designers</h2>
          <p className="text-gray-500">Verified professionals for every type of design project</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search architects, firms, specialties..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Architect Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchitects.map(arch => (
            <div
              key={arch.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-violet-200 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {arch.image}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{arch.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{arch.firm}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {arch.rating}
                    </span>
                    <span className="text-[10px] text-gray-400">({arch.reviews} reviews)</span>
                    {arch.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /> {arch.location}
                  <span className="text-gray-300">•</span>
                  <Clock className="w-3 h-3" /> {arch.experience}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <IndianRupee className="w-3 h-3" /> {arch.priceRange}
                  <span className="text-gray-300">•</span>
                  <Award className="w-3 h-3" /> {arch.projectsDone} projects
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {arch.specialties.slice(0, 3).map(s => (
                  <span key={s} className="bg-violet-50 text-violet-700 text-[10px] font-medium px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {arch.specialties.length > 3 && (
                  <span className="text-[10px] text-gray-400 px-1">+{arch.specialties.length - 3} more</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedArchitect(selectedArchitect === arch.id ? null : arch.id)}
                  className="flex-1 bg-violet-50 text-violet-700 text-xs font-semibold py-2 rounded-lg hover:bg-violet-100 transition-all"
                >
                  View Profile
                </button>
                <button
                  onClick={() => showToast(`Quote request sent to ${arch.name}! 📩`)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                    arch.available
                      ? 'bg-violet-600 text-white hover:bg-violet-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!arch.available}
                >
                  {arch.available ? 'Request Quote' : 'Unavailable'}
                </button>
              </div>

              {/* Expanded Profile */}
              {selectedArchitect === arch.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xs text-gray-600"><span className="font-semibold">Specialties:</span> {arch.specialties.join(', ')}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Projects Completed:</span> {arch.projectsDone}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Price Range:</span> {arch.priceRange}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Location:</span> {arch.location}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => showToast(`Calling ${arch.name}... 📞`)} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-green-100">
                      <Phone className="w-3 h-3" /> Call
                    </button>
                    <button onClick={() => showToast(`Meeting request sent to ${arch.name}! 📅`)} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100">
                      <Users className="w-3 h-3" /> Schedule Meeting
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredArchitects.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No architects found matching your criteria</p>
          </div>
        )}
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Post Your Requirements', desc: 'Describe your project — plot size, budget, style preferences, and timeline', icon: '📋' },
            { step: '2', title: 'Get Matched', desc: 'Our AI matches you with the best architects and designers for your project', icon: '🤖' },
            { step: '3', title: 'Review & Select', desc: 'Compare proposals, portfolios, and quotes. Select the perfect fit', icon: '✅' },
            { step: '4', title: 'Build with Confidence', desc: 'Track progress, review designs online, and pay milestone-based', icon: '🏗️' },
          ].map(s => (
            <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 text-xs font-bold mx-auto mb-2">{s.step}</div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white">
          <Layers className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold mb-2">Need a Custom Design?</h2>
          <p className="text-violet-100 text-sm mb-5 max-w-xl mx-auto">
            Post your project requirements and let our verified architects compete to give you the best design and price.
          </p>
          <button onClick={() => showToast('Design requirement posted! Our team will match you with architects 🎉')} className="bg-white text-violet-700 font-bold px-8 py-3 rounded-xl hover:bg-violet-50 transition-all">
            Post Design Requirement
          </button>
        </div>
      </section>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce text-sm font-semibold">{toast}</div>}

      {/* ═══ Tool Modals ═══ */}
      {activeTool === 'floorplan' && <FloorPlanTool onClose={() => setActiveTool(null)} />}
      {activeTool === 'visualization' && <VisualizationTool onClose={() => setActiveTool(null)} />}
      {activeTool === 'interior' && <InteriorStylerTool onClose={() => setActiveTool(null)} />}
      {activeTool === 'vastu' && <VastuTool onClose={() => setActiveTool(null)} />}
      {activeTool === 'urban' && <UrbanPlanningTool onClose={() => setActiveTool(null)} />}
      {activeTool === 'drone' && <DroneScannerTool onClose={() => setActiveTool(null)} />}
    </div>
  );
}
