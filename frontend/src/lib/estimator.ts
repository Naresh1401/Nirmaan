// =============================================================
// Nirmaan Civil Engineering Estimation Engine
// Covers: Buildings, Roads, Bridges, Retaining Walls,
//         Compound Walls, Water Tanks, Septic Tanks, Drainage
// =============================================================

export interface MaterialItem {
  material: string;
  quantity: string;
  unit: string;
  rate: number;
  rateUnit: string;
  amount: number;
}

export interface EstimationResult {
  title: string;
  description: string;
  materials: MaterialItem[];
  totalCost: number;
  labourCost: number;
  grandTotal: number;
  recommendation?: string;
  tip?: string;
  duration?: string;
}

export interface ComparisonResult {
  title: string;
  options: {
    name: string;
    cost: number;
    pros: string[];
    cons: string[];
    bestFor: string;
    recommended?: boolean;
  }[];
  recommendation: string;
}

// ── Material Rates (Telangana region, 2025-26 market rates) ──
const RATES = {
  cement: 385,           // per 50kg bag
  cementBulk: 7700,      // per ton (bulk)
  steelTMT: 62000,       // per ton
  sand: 2800,            // per ton (river sand)
  mSand: 2200,           // per ton
  gravel20mm: 1800,      // per ton
  gravel40mm: 1650,      // per ton
  gravel10mm: 2000,      // per ton
  gravel6mm: 2200,       // per ton (chips)
  bricksRed: 6500,       // per 1000 nos
  bricksFlyAsh: 4500,    // per 1000 nos
  aacBlocks: 3800,       // per cu.m
  tiles: 35,             // per sqft
  paint: 142,            // per sqft (material + application)
  plumbing: 55,          // per sqft (material)
  electrical: 65,        // per sqft (material)
  waterproofing: 45,     // per sqft
  woodwork: 250,         // per sqft (doors + windows)
  bitumen: 42000,        // per ton
  emulsion: 38000,       // per ton (bitumen emulsion)
  wbmAggregate: 1400,    // per ton (WBM aggregate)
  soilMoorum: 600,       // per ton (earth filling)
  gsbMaterial: 900,      // per ton (Granular Sub-Base)
  wmm: 1200,             // per ton (Wet Mix Macadam)
  concreteM20: 5500,     // per cu.m (ready mix)
  concreteM25: 5900,     // per cu.m
  concreteM30: 6400,     // per cu.m
  concreteM35: 7000,     // per cu.m
  concreteM40: 7800,     // per cu.m
  shuttering: 350,       // per sqft
  preStressStrand: 95000, // per ton
  bearingPad: 25000,     // per piece (elastomeric)
  expansionJoint: 15000, // per running metre
  piling: 4500,          // per running metre
  handrailing: 2800,     // per running metre (MS railing)
  stonemasonry: 4200,    // per cu.m
  rubble: 800,           // per ton
  geotextile: 120,       // per sqm
  pvcPipe: 180,          // per running metre (150mm)
  rccPipe: 450,          // per running metre (300mm)
  manholeUnit: 12000,    // per unit
};

// ── Helper ──
function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

// =============================================================
//  1. BUILDING ESTIMATION
// =============================================================
export function estimateBuilding(sqft: number, floors: number = 1, type: 'residential' | 'commercial' = 'residential'): EstimationResult {
  const totalArea = sqft * floors;
  const isCommercial = type === 'commercial';

  // Steel: residential ~4.5 kg/sqft, commercial ~6 kg/sqft
  const steelKgPerSqft = isCommercial ? 6 : 4.5;
  const steelTons = (totalArea * steelKgPerSqft) / 1000;

  // Cement: residential ~0.4 bags/sqft, commercial ~0.5
  const cementBags = Math.ceil(totalArea * (isCommercial ? 0.5 : 0.4));

  // Sand: ~1.2 cu.ft/sqft → 1 cu.ft ≈ 0.045 ton
  const sandTons = Math.round(totalArea * 1.2 * 0.045 * 10) / 10;

  // Aggregate 20mm: ~0.9 cu.ft/sqft
  const aggTons = Math.round(totalArea * 0.9 * 0.045 * 10) / 10;

  // Bricks: ~8 per sqft (for walls)
  const bricks = Math.ceil(totalArea * 8);

  // Tiles: ~80% of total area
  const tilesArea = Math.round(totalArea * 0.8);

  // Paint: ~3x total area (walls are more than floor)
  const paintArea = Math.round(totalArea * 3);

  const materials: MaterialItem[] = [
    { material: 'Cement (PPC 50kg bags)', quantity: cementBags.toLocaleString(), unit: 'bags', rate: RATES.cement, rateUnit: '/bag', amount: cementBags * RATES.cement },
    { material: 'Steel TMT Bars', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
    { material: 'River Sand', quantity: sandTons.toFixed(1), unit: 'tons', rate: RATES.sand, rateUnit: '/ton', amount: Math.round(sandTons * RATES.sand) },
    { material: 'Aggregate 20mm', quantity: aggTons.toFixed(1), unit: 'tons', rate: RATES.gravel20mm, rateUnit: '/ton', amount: Math.round(aggTons * RATES.gravel20mm) },
    { material: 'Red Clay Bricks', quantity: (bricks / 1000).toFixed(1) + 'K', unit: 'nos', rate: RATES.bricksRed, rateUnit: '/1000', amount: Math.round((bricks / 1000) * RATES.bricksRed) },
    { material: 'Floor Tiles', quantity: tilesArea.toLocaleString(), unit: 'sqft', rate: RATES.tiles, rateUnit: '/sqft', amount: tilesArea * RATES.tiles },
    { material: 'Interior Paint', quantity: paintArea.toLocaleString(), unit: 'sqft', rate: RATES.paint, rateUnit: '/sqft', amount: paintArea * RATES.paint },
    { material: 'Plumbing', quantity: totalArea.toLocaleString(), unit: 'sqft', rate: RATES.plumbing, rateUnit: '/sqft', amount: totalArea * RATES.plumbing },
    { material: 'Electrical', quantity: totalArea.toLocaleString(), unit: 'sqft', rate: RATES.electrical, rateUnit: '/sqft', amount: totalArea * RATES.electrical },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * (isCommercial ? 0.45 : 0.4));
  const grandTotal = totalCost + labourCost;

  const costPerSqft = Math.round(grandTotal / totalArea);
  const bhkLabel = sqft <= 600 ? '1BHK' : sqft <= 1000 ? '2BHK' : sqft <= 1500 ? '3BHK' : sqft <= 2200 ? '4BHK' : 'Villa';

  return {
    title: `${isCommercial ? 'Commercial' : 'Residential'} Building — ${totalArea.toLocaleString()} sqft${floors > 1 ? ` (G+${floors - 1})` : ''}`,
    description: `Estimated cost for a ${floors}-storey ${isCommercial ? 'commercial' : bhkLabel + ' residential'} building with ${sqft.toLocaleString()} sqft per floor.`,
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: `💡 **Best for you**: Use ${isCommercial ? 'M25 grade concrete for structural strength' : 'M20 concrete with fly-ash bricks to save ~15%'}. At **${fmt(costPerSqft)}/sqft** all-in, this is ${costPerSqft < 1800 ? 'budget-friendly — great for first homes' : costPerSqft < 2500 ? 'mid-range — good balance of quality and cost' : 'premium — high-quality finishes included'}.`,
    tip: isCommercial
      ? 'Commercial buildings need IS:875 wind & seismic compliance. Hire a structural engineer.'
      : `For ${bhkLabel}: consider M-Sand instead of river sand to save ~₹${(Math.round(sandTons * 600 / 100) * 100).toLocaleString('en-IN')}.`,
    duration: `${Math.ceil(totalArea / 300)} – ${Math.ceil(totalArea / 200)} months`,
  };
}

// =============================================================
//  2. ROAD ESTIMATION
// =============================================================
export type RoadType = 'gravel' | 'wbm' | 'bituminous' | 'concrete' | 'highway';

export function estimateRoad(lengthKm: number, widthM: number = 7, roadType: RoadType = 'bituminous'): EstimationResult {
  const lengthM = lengthKm * 1000;
  const area = lengthM * widthM; // sqm

  let materials: MaterialItem[] = [];
  let labourPct = 0.3;
  let title = '';
  let description = '';
  let reco = '';
  let tip = '';
  let duration = '';

  switch (roadType) {
    case 'gravel': {
      title = `Gravel/Moorum Road — ${lengthKm}km × ${widthM}m`;
      description = 'Unpaved road with compacted gravel/moorum. Suitable for village roads and farm access.';
      const earthTons = Math.round(area * 0.3 * 1.6); // 300mm layer, 1.6 density
      const gravelTons = Math.round(area * 0.15 * 1.8); // 150mm gravel top
      materials = [
        { material: 'Earth Filling + Grading', quantity: earthTons.toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: earthTons * RATES.soilMoorum },
        { material: 'Gravel/Moorum (top layer)', quantity: gravelTons.toLocaleString(), unit: 'tons', rate: RATES.wbmAggregate, rateUnit: '/ton', amount: gravelTons * RATES.wbmAggregate },
      ];
      labourPct = 0.25;
      reco = '💡 **Best for you**: Gravel roads cost the least but need re-graveling every 2-3 years. Best for **rural/farm access** with low traffic (<100 vehicles/day).';
      tip = 'Add a proper camber (slope) for drainage to extend road life.';
      duration = `${Math.ceil(lengthKm * 15)} – ${Math.ceil(lengthKm * 25)} days`;
      break;
    }

    case 'wbm': {
      title = `WBM Road — ${lengthKm}km × ${widthM}m`;
      description = 'Water Bound Macadam road — compacted stone aggregate with screening material filled in voids.';
      const gsbTons = Math.round(area * 0.2 * 2.0);
      const wbmTons = Math.round(area * 0.25 * 2.2);
      const screeningTons = Math.round(wbmTons * 0.15);
      materials = [
        { material: 'GSB (Granular Sub-Base)', quantity: gsbTons.toLocaleString(), unit: 'tons', rate: RATES.gsbMaterial, rateUnit: '/ton', amount: gsbTons * RATES.gsbMaterial },
        { material: 'WBM Aggregate (40–90mm)', quantity: wbmTons.toLocaleString(), unit: 'tons', rate: RATES.wbmAggregate, rateUnit: '/ton', amount: wbmTons * RATES.wbmAggregate },
        { material: 'Screening Material', quantity: screeningTons.toLocaleString(), unit: 'tons', rate: RATES.gravel6mm, rateUnit: '/ton', amount: screeningTons * RATES.gravel6mm },
      ];
      labourPct = 0.3;
      reco = '💡 **Best for you**: WBM roads are durable and economical for **village & colony roads** with moderate traffic. Cheaper than bituminous but lasts 5-8 years.';
      tip = 'WBM is often used as a base course under bituminous roads too.';
      duration = `${Math.ceil(lengthKm * 20)} – ${Math.ceil(lengthKm * 35)} days`;
      break;
    }

    case 'bituminous': {
      title = `Bituminous (Tar) Road — ${lengthKm}km × ${widthM}m`;
      description = 'Flexible pavement with GSB + WMM base and bituminous surface. Most common road type in India.';
      const gsbTons = Math.round(area * 0.25 * 2.0);
      const wmmTons = Math.round(area * 0.25 * 2.2);
      const dbmTons = Math.round(area * 0.075 * 2.35); // 75mm DBM
      const bcTons = Math.round(area * 0.04 * 2.35); // 40mm BC
      const bitumenTons = Math.round((dbmTons + bcTons) * 0.05 * 10) / 10;
      const tack = Math.round(area * 0.0003); // tack coat tons
      materials = [
        { material: 'GSB (Granular Sub-Base)', quantity: gsbTons.toLocaleString(), unit: 'tons', rate: RATES.gsbMaterial, rateUnit: '/ton', amount: gsbTons * RATES.gsbMaterial },
        { material: 'WMM (Wet Mix Macadam)', quantity: wmmTons.toLocaleString(), unit: 'tons', rate: RATES.wmm, rateUnit: '/ton', amount: wmmTons * RATES.wmm },
        { material: 'DBM Aggregate (20–40mm)', quantity: dbmTons.toLocaleString(), unit: 'tons', rate: RATES.gravel40mm, rateUnit: '/ton', amount: dbmTons * RATES.gravel40mm },
        { material: 'Bituminous Concrete', quantity: bcTons.toLocaleString(), unit: 'tons', rate: RATES.gravel10mm, rateUnit: '/ton', amount: bcTons * RATES.gravel10mm },
        { material: 'Bitumen (VG-30)', quantity: bitumenTons.toFixed(1), unit: 'tons', rate: RATES.bitumen, rateUnit: '/ton', amount: Math.round(bitumenTons * RATES.bitumen) },
        { material: 'Tack Coat Emulsion', quantity: tack.toLocaleString(), unit: 'tons', rate: RATES.emulsion, rateUnit: '/ton', amount: tack * RATES.emulsion },
      ];
      labourPct = 0.3;
      reco = '💡 **Best for you**: Bituminous roads are the **sweet spot** — affordable, smooth, and last 10-15 years. Perfect for **city streets, state roads, and colony roads** with regular traffic.';
      tip = 'Ensure proper drainage on both sides. Poor drainage is the #1 cause of pothole formation.';
      duration = `${Math.ceil(lengthKm * 30)} – ${Math.ceil(lengthKm * 50)} days`;
      break;
    }

    case 'concrete': {
      title = `Concrete (CC) Road — ${lengthKm}km × ${widthM}m`;
      description = 'Rigid pavement with PQC (Pavement Quality Concrete) M40 grade. Very durable, low maintenance.';
      const gsbTons = Math.round(area * 0.2 * 2.0);
      const dlcCum = Math.round(area * 0.1); // 100mm DLC in cu.m
      const pqcCum = Math.round(area * 0.25); // 250mm PQC in cu.m
      const steelTons = Math.round(pqcCum * 0.01 * 10) / 10; // tie bars + dowel bars
      const jointSealant = Math.round(lengthM / 4.5); // joints every 4.5m
      materials = [
        { material: 'GSB (Sub-Base)', quantity: gsbTons.toLocaleString(), unit: 'tons', rate: RATES.gsbMaterial, rateUnit: '/ton', amount: gsbTons * RATES.gsbMaterial },
        { material: 'DLC (Dry Lean Concrete)', quantity: dlcCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM20, rateUnit: '/cu.m', amount: dlcCum * RATES.concreteM20 },
        { material: 'PQC M40 Concrete', quantity: pqcCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM40, rateUnit: '/cu.m', amount: pqcCum * RATES.concreteM40 },
        { material: 'Steel (Dowel + Tie bars)', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
        { material: 'Joint Sealant', quantity: jointSealant.toLocaleString(), unit: 'joints', rate: 150, rateUnit: '/joint', amount: jointSealant * 150 },
      ];
      labourPct = 0.28;
      reco = '💡 **Best for you**: CC roads last **25-30 years** with almost zero maintenance. Higher upfront cost but **cheapest over lifetime**. Best for **heavy traffic zones, bus routes, and industrial areas**.';
      tip = 'Concrete roads need 28-day curing. Plan for traffic diversions during construction.';
      duration = `${Math.ceil(lengthKm * 40)} – ${Math.ceil(lengthKm * 60)} days`;
      break;
    }

    case 'highway': {
      title = `National Highway Standard — ${lengthKm}km × ${widthM}m`;
      description = 'Four-lane divided carriageway with median, shoulders, and full bituminous pavement as per IRC standards.';
      const effectiveWidth = widthM > 10 ? widthM : 14; // min 14m for 4-lane
      const totalArea4L = lengthM * effectiveWidth;
      const gsbTons = Math.round(totalArea4L * 0.3 * 2.0);
      const wmmTons = Math.round(totalArea4L * 0.25 * 2.2);
      const dbmTons = Math.round(totalArea4L * 0.1 * 2.35);
      const bcTons = Math.round(totalArea4L * 0.05 * 2.35);
      const bitumenTons = Math.round((dbmTons + bcTons) * 0.05 * 10) / 10;
      const steelGuardrail = Math.round(lengthM * 2 * 0.015); // both sides, ~15 kg/m
      const medianLength = lengthM;
      materials = [
        { material: 'GSB (300mm)', quantity: gsbTons.toLocaleString(), unit: 'tons', rate: RATES.gsbMaterial, rateUnit: '/ton', amount: gsbTons * RATES.gsbMaterial },
        { material: 'WMM (250mm)', quantity: wmmTons.toLocaleString(), unit: 'tons', rate: RATES.wmm, rateUnit: '/ton', amount: wmmTons * RATES.wmm },
        { material: 'DBM Course', quantity: dbmTons.toLocaleString(), unit: 'tons', rate: RATES.gravel40mm, rateUnit: '/ton', amount: dbmTons * RATES.gravel40mm },
        { material: 'Bituminous Concrete', quantity: bcTons.toLocaleString(), unit: 'tons', rate: RATES.gravel10mm, rateUnit: '/ton', amount: bcTons * RATES.gravel10mm },
        { material: 'Bitumen (VG-30)', quantity: bitumenTons.toFixed(1), unit: 'tons', rate: RATES.bitumen, rateUnit: '/ton', amount: Math.round(bitumenTons * RATES.bitumen) },
        { material: 'Steel Guardrails', quantity: steelGuardrail.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelGuardrail * RATES.steelTMT) },
        { material: 'Median + Markings', quantity: medianLength.toLocaleString(), unit: 'r.m', rate: 1200, rateUnit: '/r.m', amount: medianLength * 1200 },
      ];
      labourPct = 0.25;
      reco = '💡 **Best for you**: Highway-spec roads are built for **10,000+ vehicles/day**. This is the highest spec — use only for arterial/national highways. For internal roads, a **bituminous road** saves 60% cost.';
      tip = 'NH projects need NHAI approval and Environmental Clearance. Allow 6+ months for approvals.';
      duration = `${Math.ceil(lengthKm * 60)} – ${Math.ceil(lengthKm * 90)} days`;
      break;
    }
  }

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * labourPct);
  const grandTotal = totalCost + labourCost;

  return { title, description, materials, totalCost, labourCost, grandTotal, recommendation: reco, tip, duration };
}

// =============================================================
//  3. BRIDGE ESTIMATION
// =============================================================
export type BridgeType = 'culvert' | 'minor' | 'major' | 'footbridge' | 'flyover';

export function estimateBridge(spanM: number, widthM: number = 7.5, bridgeType: BridgeType = 'minor'): EstimationResult {
  let materials: MaterialItem[] = [];
  let labourPct = 0.35;
  let title = '';
  let description = '';
  let reco = '';
  let tip = '';
  let duration = '';

  switch (bridgeType) {
    case 'culvert': {
      title = `Box Culvert — ${spanM}m span × ${widthM}m wide`;
      description = 'RCC box culvert for drainage crossing. Span up to 6m. Used for nala/stream crossings on roads.';
      const concreteCum = Math.round(spanM * widthM * 0.8); // slab + walls + base
      const steelTons = Math.round(concreteCum * 0.08 * 10) / 10;
      const shutteringSqft = Math.round(concreteCum * 12);
      const earthworkTons = Math.round(spanM * widthM * 2 * 1.6);
      materials = [
        { material: 'M25 Concrete', quantity: concreteCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM25, rateUnit: '/cu.m', amount: concreteCum * RATES.concreteM25 },
        { material: 'Steel TMT', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
        { material: 'Shuttering', quantity: shutteringSqft.toLocaleString(), unit: 'sqft', rate: RATES.shuttering, rateUnit: '/sqft', amount: shutteringSqft * RATES.shuttering },
        { material: 'Earthwork + Backfill', quantity: earthworkTons.toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: earthworkTons * RATES.soilMoorum },
        { material: 'Waterproofing', quantity: Math.round(spanM * widthM * 10.76).toLocaleString(), unit: 'sqft', rate: RATES.waterproofing, rateUnit: '/sqft', amount: Math.round(spanM * widthM * 10.76) * RATES.waterproofing },
      ];
      labourPct = 0.35;
      reco = '💡 **Best for you**: Box culverts are the **most economical** solution for stream crossings up to 6m. Quick to build and very durable. For larger spans, go with a minor bridge.';
      tip = 'Design flood discharge capacity as per IRC:SP:13. Undersizing causes road wash-outs.';
      duration = `${Math.max(15, Math.ceil(spanM * 8))} – ${Math.max(25, Math.ceil(spanM * 12))} days`;
      break;
    }

    case 'minor': {
      title = `Minor Bridge — ${spanM}m span × ${widthM}m wide`;
      description = 'RCC T-beam/slab bridge for spans 6-60m. Standard design for river/canal crossings.';
      const nSpans = Math.max(1, Math.ceil(spanM / 12)); // max 12m per span
      const deckCum = Math.round(spanM * widthM * 0.35);
      const pierCum = Math.round(nSpans * 2.5 * 2); // each pier ~2.5 cu.m
      const abutCum = Math.round(2 * 4 * widthM * 0.5);
      const totalConcrete = deckCum + pierCum + abutCum;
      const steelTons = Math.round(totalConcrete * 0.1 * 10) / 10;
      const pilingM = Math.round((nSpans + 1) * 4 * 8); // 4 piles per support, 8m deep
      const bearings = (nSpans + 1) * 2;
      materials = [
        { material: 'M30 Concrete (Deck)', quantity: deckCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM30, rateUnit: '/cu.m', amount: deckCum * RATES.concreteM30 },
        { material: 'M25 Concrete (Piers + Abutments)', quantity: (pierCum + abutCum).toLocaleString(), unit: 'cu.m', rate: RATES.concreteM25, rateUnit: '/cu.m', amount: (pierCum + abutCum) * RATES.concreteM25 },
        { material: 'Steel TMT + Reinforcement', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
        { material: 'Pile Foundation', quantity: pilingM.toLocaleString(), unit: 'r.m', rate: RATES.piling, rateUnit: '/r.m', amount: pilingM * RATES.piling },
        { material: 'Elastomeric Bearings', quantity: bearings.toString(), unit: 'nos', rate: RATES.bearingPad, rateUnit: '/pc', amount: bearings * RATES.bearingPad },
        { material: 'Handrailing (both sides)', quantity: (spanM * 2).toLocaleString(), unit: 'r.m', rate: RATES.handrailing, rateUnit: '/r.m', amount: Math.round(spanM * 2 * RATES.handrailing) },
        { material: 'Shuttering', quantity: Math.round(totalConcrete * 10).toLocaleString(), unit: 'sqft', rate: RATES.shuttering, rateUnit: '/sqft', amount: Math.round(totalConcrete * 10) * RATES.shuttering },
      ];
      labourPct = 0.35;
      reco = `💡 **Best for you**: A ${nSpans}-span T-beam bridge is the **standard choice** for this length. For spans under 10m, a simple slab bridge saves 20%. For 30m+, consider prestressed concrete.`;
      tip = 'Get a soil investigation done first — pile depth depends on bearing capacity.';
      duration = `${Math.ceil(spanM * 3)} – ${Math.ceil(spanM * 5)} days (${Math.ceil(spanM * 5 / 30)} months)`;
      break;
    }

    case 'major': {
      title = `Major Bridge — ${spanM}m span × ${widthM}m wide`;
      description = 'Prestressed concrete girder bridge for spans over 60m. Heavy-duty design for major river crossings.';
      const nSpans = Math.max(2, Math.ceil(spanM / 30)); // 30m per girder
      const deckCum = Math.round(spanM * widthM * 0.45);
      const pierCum = Math.round(nSpans * 15); // large piers
      const abutCum = Math.round(2 * 8 * widthM);
      const totalConcrete = deckCum + pierCum + abutCum;
      const steelTons = Math.round(totalConcrete * 0.12 * 10) / 10;
      const preStressTons = Math.round(nSpans * 1.5 * 10) / 10;
      const pilingM = Math.round((nSpans + 1) * 6 * 15); // 6 piles, 15m deep
      const bearings = (nSpans + 1) * 4;
      const expansionJoints = nSpans + 1;
      materials = [
        { material: 'M40 Concrete (Deck + Girders)', quantity: deckCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM40, rateUnit: '/cu.m', amount: deckCum * RATES.concreteM40 },
        { material: 'M35 Concrete (Piers/Abutments)', quantity: (pierCum + abutCum).toLocaleString(), unit: 'cu.m', rate: RATES.concreteM35, rateUnit: '/cu.m', amount: (pierCum + abutCum) * RATES.concreteM35 },
        { material: 'Steel Reinforcement', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
        { material: 'Prestressing Strands', quantity: preStressTons.toFixed(1), unit: 'tons', rate: RATES.preStressStrand, rateUnit: '/ton', amount: Math.round(preStressTons * RATES.preStressStrand) },
        { material: 'Deep Pile Foundation', quantity: pilingM.toLocaleString(), unit: 'r.m', rate: RATES.piling, rateUnit: '/r.m', amount: pilingM * RATES.piling },
        { material: 'Bearings', quantity: bearings.toString(), unit: 'nos', rate: RATES.bearingPad, rateUnit: '/pc', amount: bearings * RATES.bearingPad },
        { material: 'Expansion Joints', quantity: expansionJoints.toString(), unit: 'nos', rate: RATES.expansionJoint * 10, rateUnit: '/set', amount: expansionJoints * RATES.expansionJoint * 10 },
        { material: 'Handrailing + Crash Barrier', quantity: (spanM * 2).toLocaleString(), unit: 'r.m', rate: 4500, rateUnit: '/r.m', amount: Math.round(spanM * 2 * 4500) },
      ];
      labourPct = 0.3;
      reco = '💡 **Best for you**: Prestressed concrete is the **most cost-effective** for major bridges. Steel truss alternatives cost 30-40% more. For 100m+, consider cable-stayed design.';
      tip = 'Major bridges require detailed Hydrological, Geotechnical, and Structural surveys. Budget 3-5% for design consultancy.';
      duration = `${Math.ceil(spanM / 5)} – ${Math.ceil(spanM / 3)} months`;
      break;
    }

    case 'footbridge': {
      title = `Pedestrian Footbridge — ${spanM}m span × ${widthM}m wide`;
      description = 'Steel + RCC deck footbridge for pedestrian/cycle crossing. Lightweight and elegant.';
      const deckArea = spanM * widthM;
      const steelTons = Math.round(deckArea * 0.06 * 10) / 10; // lighter steel frame
      const concreteCum = Math.round(deckArea * 0.12);
      const railingM = spanM * 2;
      materials = [
        { material: 'Structural Steel (I-beams)', quantity: steelTons.toFixed(1), unit: 'tons', rate: 85000, rateUnit: '/ton', amount: Math.round(steelTons * 85000) },
        { material: 'M25 RCC Deck', quantity: concreteCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM25, rateUnit: '/cu.m', amount: concreteCum * RATES.concreteM25 },
        { material: 'SS/MS Handrailing', quantity: railingM.toLocaleString(), unit: 'r.m', rate: 3500, rateUnit: '/r.m', amount: Math.round(railingM * 3500) },
        { material: 'Foundation', quantity: '2', unit: 'nos', rate: Math.round(concreteCum * 2000), rateUnit: '/foot.', amount: Math.round(concreteCum * 2000 * 2) },
        { material: 'Anti-skid Flooring', quantity: Math.round(deckArea * 10.76).toLocaleString(), unit: 'sqft', rate: 85, rateUnit: '/sqft', amount: Math.round(deckArea * 10.76 * 85) },
      ];
      labourPct = 0.35;
      reco = '💡 **Best for you**: Steel footbridges are **quick to install** (prefabricated) and look modern. For longer spans, a truss design is more economical. Add ramps for accessibility.';
      tip = 'Footbridges near railway/highway crossings need additional safety clearances.';
      duration = `${Math.max(20, Math.ceil(spanM * 2))} – ${Math.max(40, Math.ceil(spanM * 3.5))} days`;
      break;
    }

    case 'flyover': {
      title = `Flyover/Overpass — ${spanM}m length × ${widthM}m wide`;
      description = 'Elevated road structure with approach ramps. Prestressed box-girder or I-girder design.';
      const nSpans = Math.max(2, Math.ceil(spanM / 25));
      const deckCum = Math.round(spanM * widthM * 0.5);
      const pierCum = Math.round(nSpans * 20);
      const rampCum = Math.round(spanM * 0.3 * widthM * 0.3);
      const totalConcrete = deckCum + pierCum + rampCum;
      const steelTons = Math.round(totalConcrete * 0.1 * 10) / 10;
      const preStressTons = Math.round(nSpans * 2 * 10) / 10;
      const pilingM = Math.round((nSpans + 1) * 8 * 12);
      materials = [
        { material: 'M40 Concrete (Superstructure)', quantity: deckCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM40, rateUnit: '/cu.m', amount: deckCum * RATES.concreteM40 },
        { material: 'M35 Concrete (Piers)', quantity: pierCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM35, rateUnit: '/cu.m', amount: pierCum * RATES.concreteM35 },
        { material: 'M30 Concrete (Ramps)', quantity: rampCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM30, rateUnit: '/cu.m', amount: rampCum * RATES.concreteM30 },
        { material: 'Steel Reinforcement', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
        { material: 'Prestressing Strands', quantity: preStressTons.toFixed(1), unit: 'tons', rate: RATES.preStressStrand, rateUnit: '/ton', amount: Math.round(preStressTons * RATES.preStressStrand) },
        { material: 'Deep Pile Foundation', quantity: pilingM.toLocaleString(), unit: 'r.m', rate: RATES.piling, rateUnit: '/r.m', amount: pilingM * RATES.piling },
        { material: 'Crash Barriers + Railing', quantity: (spanM * 2).toLocaleString(), unit: 'r.m', rate: 5000, rateUnit: '/r.m', amount: Math.round(spanM * 2 * 5000) },
        { material: 'Road Markings + Signage', quantity: '1', unit: 'LS', rate: Math.round(spanM * 800), rateUnit: '/LS', amount: Math.round(spanM * 800) },
      ];
      labourPct = 0.28;
      reco = '💡 **Best for you**: Segmental box-girder is the **fastest flyover method** — precast segments lifted into place. For urban areas with traffic constraints, this minimizes disruption.';
      tip = 'Flyovers need traffic impact assessment and utility relocation (water, power lines). Budget 10-15% for these.';
      duration = `${Math.ceil(spanM / 8)} – ${Math.ceil(spanM / 5)} months`;
      break;
    }
  }

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * labourPct);
  const grandTotal = totalCost + labourCost;

  return { title, description, materials, totalCost, labourCost, grandTotal, recommendation: reco, tip, duration };
}

// =============================================================
//  4. OTHER CIVIL WORKS
// =============================================================

// ── Compound Wall ──
export function estimateCompoundWall(lengthM: number, heightM: number = 1.8): EstimationResult {
  const area = lengthM * heightM; // sqm of wall
  const bricks = Math.round(area * 10.76 * 7); // ~7 per sqft
  const cementBags = Math.round(area * 10.76 * 0.1);
  const sandTons = Math.round(area * 10.76 * 0.008 * 10) / 10;
  const steelTons = Math.round(lengthM / 3 * 8 * 0.001 * 10) / 10; // pillars every 3m, 8kg each
  const foundations = Math.round(lengthM * 0.4 * 0.6 * 0.045); // cu.m → tons approx
  const concreteCum = Math.round(lengthM * 0.3 * 0.3 * 100) / 100;

  const materials: MaterialItem[] = [
    { material: 'Red Clay Bricks', quantity: (bricks / 1000).toFixed(1) + 'K', unit: 'nos', rate: RATES.bricksRed, rateUnit: '/1000', amount: Math.round((bricks / 1000) * RATES.bricksRed) },
    { material: 'Cement', quantity: cementBags.toLocaleString(), unit: 'bags', rate: RATES.cement, rateUnit: '/bag', amount: cementBags * RATES.cement },
    { material: 'Sand', quantity: sandTons.toFixed(1), unit: 'tons', rate: RATES.sand, rateUnit: '/ton', amount: Math.round(sandTons * RATES.sand) },
    { material: 'Steel (Pillars + Beam)', quantity: steelTons.toFixed(2), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
    { material: 'Foundation Concrete M20', quantity: Math.max(1, Math.round(lengthM * 0.08)).toLocaleString(), unit: 'cu.m', rate: RATES.concreteM20, rateUnit: '/cu.m', amount: Math.max(1, Math.round(lengthM * 0.08)) * RATES.concreteM20 },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * 0.45);
  const grandTotal = totalCost + labourCost;

  return {
    title: `Compound Wall — ${lengthM}m × ${heightM}m high`,
    description: `Brick masonry compound wall with RCC pillar every 3m and plinth beam.`,
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: '💡 **Best for you**: Fly-ash brick walls save ~25% over clay bricks and are better for the environment. For industrial plots, precast compound walls are fastest.',
    tip: 'Check local municipal rules for max boundary wall height (usually 1.5-2m without permission).',
    duration: `${Math.ceil(lengthM / 8)} – ${Math.ceil(lengthM / 5)} days`,
  };
}

// ── Retaining Wall ──
export function estimateRetainingWall(lengthM: number, heightM: number = 3): EstimationResult {
  const concreteCum = Math.round(lengthM * heightM * 0.5); // base + stem
  const steelTons = Math.round(concreteCum * 0.08 * 10) / 10;
  const earthworkTons = Math.round(lengthM * heightM * 1 * 1.6);
  const drainPipeM = lengthM;
  const geotextileSqm = Math.round(lengthM * heightM);

  const materials: MaterialItem[] = [
    { material: 'M25 Concrete', quantity: concreteCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM25, rateUnit: '/cu.m', amount: concreteCum * RATES.concreteM25 },
    { material: 'Steel TMT', quantity: steelTons.toFixed(1), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
    { material: 'Earthwork Excavation', quantity: earthworkTons.toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: earthworkTons * RATES.soilMoorum },
    { material: 'Weep Hole PVC Pipes', quantity: drainPipeM.toLocaleString(), unit: 'r.m', rate: RATES.pvcPipe, rateUnit: '/r.m', amount: Math.round(drainPipeM * RATES.pvcPipe) },
    { material: 'Geotextile Filter', quantity: geotextileSqm.toLocaleString(), unit: 'sqm', rate: RATES.geotextile, rateUnit: '/sqm', amount: geotextileSqm * RATES.geotextile },
    { material: 'Shuttering', quantity: Math.round(concreteCum * 10).toLocaleString(), unit: 'sqft', rate: RATES.shuttering, rateUnit: '/sqft', amount: Math.round(concreteCum * 10) * RATES.shuttering },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * 0.4);
  const grandTotal = totalCost + labourCost;

  return {
    title: `RCC Retaining Wall — ${lengthM}m × ${heightM}m high`,
    description: 'Cantilever-type RCC retaining wall with toe slab, heel slab, and weep holes.',
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: `💡 **Best for you**: Up to 3m height, a **cantilever wall** is most economical. For 3-6m, consider a **counterfort wall**. Above 6m, **gabion walls** or **reinforced earth** are cheaper.`,
    tip: 'Always provide weep holes and back-drainage. Water pressure is the main cause of retaining wall failure.',
    duration: `${Math.ceil(lengthM / 5)} – ${Math.ceil(lengthM / 3)} days`,
  };
}

// ── Water Tank (Overhead) ──
export function estimateWaterTank(capacityLiters: number, type: 'overhead' | 'underground' = 'overhead'): EstimationResult {
  const capCum = capacityLiters / 1000; // cu.m
  const isOHT = type === 'overhead';
  // Tank dimensions (roughly cubic)
  const side = Math.round(Math.cbrt(capCum) * 10) / 10;

  const wallThick = capCum > 10 ? 0.2 : 0.15;
  const concreteCum = Math.round(capCum * (isOHT ? 0.6 : 0.5));
  const steelTons = Math.round(concreteCum * 0.1 * 100) / 100;
  const stagingConcrete = isOHT ? Math.round(capCum * 0.4) : 0; // columns for OHT
  const wpArea = Math.round(capCum * 5 * 10.76); // internal surface area approx

  const materials: MaterialItem[] = [
    { material: `M30 Concrete (${isOHT ? 'Tank + Staging' : 'Tank'})`, quantity: (concreteCum + stagingConcrete).toLocaleString(), unit: 'cu.m', rate: RATES.concreteM30, rateUnit: '/cu.m', amount: (concreteCum + stagingConcrete) * RATES.concreteM30 },
    { material: 'Steel TMT', quantity: steelTons.toFixed(2), unit: 'tons', rate: RATES.steelTMT, rateUnit: '/ton', amount: Math.round(steelTons * RATES.steelTMT) },
    { material: 'Waterproofing', quantity: wpArea.toLocaleString(), unit: 'sqft', rate: RATES.waterproofing, rateUnit: '/sqft', amount: wpArea * RATES.waterproofing },
    { material: 'Shuttering', quantity: Math.round((concreteCum + stagingConcrete) * 12).toLocaleString(), unit: 'sqft', rate: RATES.shuttering, rateUnit: '/sqft', amount: Math.round((concreteCum + stagingConcrete) * 12) * RATES.shuttering },
    { material: 'Plumbing (Inlet/Outlet/Overflow)', quantity: '1', unit: 'set', rate: Math.round(5000 + capCum * 200), rateUnit: '/set', amount: Math.round(5000 + capCum * 200) },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * 0.4);
  const grandTotal = totalCost + labourCost;

  return {
    title: `${isOHT ? 'Overhead' : 'Underground'} Water Tank — ${(capacityLiters / 1000).toFixed(0)}KL (${capacityLiters.toLocaleString()} liters)`,
    description: `${isOHT ? 'Elevated' : 'Below-ground'} RCC water tank${isOHT ? ' on staging columns' : ' with waterproof lining'}.`,
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: isOHT
      ? `💡 **Best for you**: For tanks up to 10KL, an **Intze-type OHT** is most efficient. For larger capacities, **circular OHT** saves steel. Plastic tanks (Sintex) are cheaper for <5KL domestic use.`
      : `💡 **Best for you**: Underground tanks avoid visual impact and keep water cool. **Rectangular** is easier to build; **circular** uses 15% less material. Add a filtration unit for drinking water.`,
    tip: isOHT ? 'OHT staging needs seismic design in Zone II+ areas.' : 'Ensure proper backfilling around UGT to avoid uplift during empty state.',
    duration: `${Math.max(15, Math.ceil(capCum * 3))} – ${Math.max(25, Math.ceil(capCum * 5))} days`,
  };
}

// ── Septic Tank ──
export function estimateSepticTank(users: number = 10): EstimationResult {
  // IS:2470 standard: 1 cu.m per user + 2 cu.m base
  const capCum = Math.max(3, users * 1 + 2);
  const concreteCum = Math.round(capCum * 0.5 * 10) / 10;
  const bricks = Math.round(capCum * 200);
  const cementBags = Math.round(concreteCum * 8);

  const materials: MaterialItem[] = [
    { material: 'M20 Concrete (Base + Cover)', quantity: concreteCum.toLocaleString(), unit: 'cu.m', rate: RATES.concreteM20, rateUnit: '/cu.m', amount: Math.round(concreteCum * RATES.concreteM20) },
    { material: 'Bricks (Walls)', quantity: (bricks / 1000).toFixed(1) + 'K', unit: 'nos', rate: RATES.bricksRed, rateUnit: '/1000', amount: Math.round((bricks / 1000) * RATES.bricksRed) },
    { material: 'Cement', quantity: cementBags.toLocaleString(), unit: 'bags', rate: RATES.cement, rateUnit: '/bag', amount: cementBags * RATES.cement },
    { material: 'Waterproofing', quantity: Math.round(capCum * 4 * 10.76).toLocaleString(), unit: 'sqft', rate: RATES.waterproofing, rateUnit: '/sqft', amount: Math.round(capCum * 4 * 10.76) * RATES.waterproofing },
    { material: 'Excavation', quantity: Math.round(capCum * 1.3 * 1.6).toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: Math.round(capCum * 1.3 * 1.6) * RATES.soilMoorum },
    { material: 'PVC Pipes (Inlet/Outlet)', quantity: '10', unit: 'r.m', rate: RATES.pvcPipe, rateUnit: '/r.m', amount: 10 * RATES.pvcPipe },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * 0.45);
  const grandTotal = totalCost + labourCost;

  return {
    title: `Septic Tank — ${users} users (${capCum} cu.m capacity)`,
    description: 'Two-chamber septic tank as per IS:2470 with soak pit.',
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: '💡 **Best for you**: For up to 20 users, a standard **two-chamber septic tank + soak pit** is sufficient. For 50+ users, consider a **packaged STP (Sewage Treatment Plant)** — requires less land and meets pollution board norms.',
    tip: 'Maintain 1.5m minimum distance from building foundation. Desludge every 2-3 years.',
    duration: `7 – 12 days`,
  };
}

// ── Drainage / Sewer Line ──
export function estimateDrainage(lengthM: number, type: 'storm' | 'sewer' = 'storm'): EstimationResult {
  const isSewer = type === 'sewer';
  const pipeRate = isSewer ? RATES.rccPipe : RATES.pvcPipe;
  const pipeName = isSewer ? 'RCC NP3 Pipe (300mm)' : 'PVC Pipe (150mm)';
  const manholes = Math.ceil(lengthM / 30); // manhole every 30m
  const excavTons = Math.round(lengthM * 0.6 * 0.8 * 1.6); // trench 0.6m wide, 0.8m deep
  const bedConcrete = Math.round(lengthM * 0.6 * 0.1); // 100mm bed

  const materials: MaterialItem[] = [
    { material: pipeName, quantity: lengthM.toLocaleString(), unit: 'r.m', rate: pipeRate, rateUnit: '/r.m', amount: lengthM * pipeRate },
    { material: 'Manholes', quantity: manholes.toLocaleString(), unit: 'nos', rate: RATES.manholeUnit, rateUnit: '/unit', amount: manholes * RATES.manholeUnit },
    { material: 'Trench Excavation', quantity: excavTons.toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: excavTons * RATES.soilMoorum },
    { material: 'Bed Concrete M15', quantity: bedConcrete.toLocaleString(), unit: 'cu.m', rate: 4800, rateUnit: '/cu.m', amount: bedConcrete * 4800 },
    { material: 'Backfilling', quantity: Math.round(excavTons * 0.7).toLocaleString(), unit: 'tons', rate: RATES.soilMoorum, rateUnit: '/ton', amount: Math.round(excavTons * 0.7) * RATES.soilMoorum },
  ];

  const totalCost = materials.reduce((s, m) => s + m.amount, 0);
  const labourCost = Math.round(totalCost * 0.4);
  const grandTotal = totalCost + labourCost;

  return {
    title: `${isSewer ? 'Sewer' : 'Storm Water Drain'} — ${lengthM}m`,
    description: `${isSewer ? 'Underground sewer line with RCC pipes' : 'Storm water drainage with PVC pipes'} and manholes at regular intervals.`,
    materials,
    totalCost,
    labourCost,
    grandTotal,
    recommendation: isSewer
      ? '💡 **Best for you**: RCC NP3 pipes are the standard for sewer lines. For smaller residential colonies, **DWC (double-wall corrugated) HDPE pipes** are lighter, easier to install, and equally durable.'
      : '💡 **Best for you**: For storm drains, **open trapezoidal channels** cost 40% less than piped drains. Use piped drains only where space is constrained.',
    tip: 'Maintain minimum 1:200 slope for gravity flow. Manholes required at every change of direction.',
    duration: `${Math.ceil(lengthM / 15)} – ${Math.ceil(lengthM / 10)} days`,
  };
}

// =============================================================
//  5. COMPARISON / "WHICH IS BEST FOR YOU?"
// =============================================================

export function compareRoadTypes(lengthKm: number, widthM: number = 7): ComparisonResult {
  const types: RoadType[] = ['gravel', 'wbm', 'bituminous', 'concrete'];
  const names = ['Gravel Road', 'WBM Road', 'Bituminous (Tar) Road', 'Concrete (CC) Road'];

  const options: ComparisonResult['options'] = types.map((t, i) => {
    const est = estimateRoad(lengthKm, widthM, t);
    return {
      name: names[i],
      cost: est.grandTotal,
      pros: [] as string[],
      cons: [] as string[],
      bestFor: '',
    };
  });

  options[0].pros = ['Cheapest option', 'Fast to build', 'Easy local material'];
  options[0].cons = ['Wears out in 2-3 years', 'Dusty in summer', 'Muddy in rain'];
  options[0].bestFor = 'Farm roads, temporary access';

  options[1].pros = ['Moderate cost', 'Lasts 5-8 years', 'Good load bearing'];
  options[1].cons = ['Rough surface', 'Needs resurfacing', 'Dust issues'];
  options[1].bestFor = 'Village roads, colony internal roads';

  options[2].pros = ['Smooth surface', 'Lasts 10-15 years', 'Good for all vehicles', 'Most common in India'];
  options[2].cons = ['Potholes if drainage is poor', 'Needs periodic overlays'];
  options[2].bestFor = 'City roads, state highways, main colony roads';
  options[2].recommended = true;

  options[3].pros = ['Lasts 25-30 years', 'Almost zero maintenance', 'Best lifecycle cost', 'No potholes'];
  options[3].cons = ['Highest upfront cost', 'Needs 28-day curing', 'Noisy for vehicles', 'Hard to repair utilities below'];
  options[3].bestFor = 'Bus routes, heavy traffic zones, industrial areas';

  return {
    title: `Road Type Comparison — ${lengthKm}km × ${widthM}m`,
    options,
    recommendation: `For most scenarios, a **Bituminous road** gives the best balance of cost, durability, and ride quality. Choose **Concrete** if you want lowest 30-year cost, or **WBM** if budget is very tight.`,
  };
}

export function compareBridgeTypes(spanM: number, widthM: number = 7.5): ComparisonResult {
  const applicableTypes: { type: BridgeType; name: string }[] = [];

  if (spanM <= 8) applicableTypes.push({ type: 'culvert', name: 'Box Culvert' });
  if (spanM >= 5 && spanM <= 60) applicableTypes.push({ type: 'minor', name: 'Minor Bridge (RCC)' });
  if (spanM >= 30) applicableTypes.push({ type: 'major', name: 'Major Bridge (Prestressed)' });
  applicableTypes.push({ type: 'footbridge', name: 'Pedestrian Footbridge' });

  const options: ComparisonResult['options'] = applicableTypes.map(({ type, name }) => {
    const est = estimateBridge(spanM, widthM, type);
    return {
      name,
      cost: est.grandTotal,
      pros: [] as string[],
      cons: [] as string[],
      bestFor: '',
      recommended: false,
    };
  });

  // Set pros/cons based on type
  options.forEach(o => {
    if (o.name.includes('Culvert')) {
      o.pros = ['Cheapest', 'Fastest to build', 'Simple design'];
      o.cons = ['Limited to 6m span', 'Low clearance'];
      o.bestFor = 'Small stream/nala crossings';
      if (spanM <= 6) o.recommended = true;
    } else if (o.name.includes('Minor')) {
      o.pros = ['Proven technology', 'Good for vehicles', 'Standard IRC design'];
      o.cons = ['Needs pile foundation', 'Longer construction'];
      o.bestFor = 'River/canal crossings for road traffic';
      if (spanM > 6 && spanM <= 60) o.recommended = true;
    } else if (o.name.includes('Major')) {
      o.pros = ['Handles very long spans', 'Heavy traffic capable', 'Long lifespan'];
      o.cons = ['Expensive', 'Complex construction', 'Needs specialist contractor'];
      o.bestFor = 'Major river crossings, highway projects';
      if (spanM > 60) o.recommended = true;
    } else if (o.name.includes('Pedestrian')) {
      o.pros = ['Lightweight', 'Quick installation', 'Low cost'];
      o.cons = ['Pedestrian only', 'No vehicle load'];
      o.bestFor = 'Pedestrian crossings, railway overpasses';
    }
  });

  return {
    title: `Bridge Type Comparison — ${spanM}m span`,
    options,
    recommendation: spanM <= 6
      ? 'A **Box Culvert** is the clear best choice for this span — cheapest and fastest.'
      : spanM <= 60
        ? 'A **Minor Bridge (RCC T-beam)** is recommended — proven design, reasonable cost.'
        : 'A **Prestressed Concrete Major Bridge** is needed for this span — plan for specialist contractors.',
  };
}
