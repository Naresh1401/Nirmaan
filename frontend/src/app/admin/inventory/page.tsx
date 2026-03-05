'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { AlertTriangle, Loader2, RefreshCw, Package, TrendingDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700',
};

export default function InventoryPage() {
  const { adminFetch } = useAdmin();
  const [lowStock, setLowStock] = useState<any>(null);
  const [stockouts, setStockouts] = useState<any>(null);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('');
  const [reason, setReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lsRes, soRes] = await Promise.all([
        adminFetch(`${API_URL}/api/v1/admin/v2/inventory/low-stock?threshold=${threshold}`),
        adminFetch(`${API_URL}/api/v1/admin/v2/predictions/stockouts`),
      ]);
      if (lsRes.ok) setLowStock(await lsRes.json());
      if (soRes.ok) setStockouts(await soRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [threshold, adminFetch]);

  useEffect(() => { fetchData(); }, [threshold]);

  const adjustInventory = async () => {
    if (!adjusting || !newQty) return;
    await adminFetch(`${API_URL}/api/v1/admin/v2/inventory/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ product_id: adjusting, new_quantity: parseInt(newQty), reason }),
    });
    setAdjusting(null); setNewQty(''); setReason('');
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-sm text-gray-500">Stock monitoring and predictions</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stockout Predictions Summary */}
      {stockouts && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">At Risk Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stockouts.total_at_risk}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-sm text-red-600">Critical (≤7d)</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stockouts.critical}</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
            <p className="text-sm text-orange-600">High (≤14d)</p>
            <p className="text-2xl font-bold text-orange-700 mt-1">{stockouts.high}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
            <p className="text-sm text-yellow-600">Medium (≤30d)</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stockouts.medium}</p>
          </div>
        </div>
      )}

      {/* Stockout Predictions Table */}
      {stockouts?.products?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-500" /> Stockout Predictions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Current Stock', 'Avg Daily Sales', 'Days Until Stockout', 'Predicted Date', 'Risk', 'Reorder Qty', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockouts.products.map((p: any) => (
                  <tr key={p.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{p.product_name}</p>
                      <p className="text-xs text-gray-400">{p.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.current_stock}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.avg_daily_sales}/day</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.days_until_stockout} days</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.predicted_stockout_date}</td>
                    <td className="px-4 py-3"><Badge label={p.risk_level} color={RISK_COLORS[p.risk_level] || 'bg-gray-100 text-gray-700'} /></td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{p.recommended_reorder_qty}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setAdjusting(p.product_id)} className="text-xs px-2 py-1 text-orange-600 border border-orange-200 rounded hover:bg-orange-50">
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> Low Stock ({lowStock?.count || 0})
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Threshold:</span>
            <select value={threshold} onChange={e => setThreshold(+e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm bg-white">
              {[5, 10, 20, 50].map(v => <option key={v} value={v}>≤ {v}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Brand', 'Stock', 'Supplier', 'Price', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowStock?.low_stock_products?.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.brand || '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">{p.stock_quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.supplier_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setAdjusting(p.id)} className="text-xs px-2 py-1 text-orange-600 border border-orange-200 rounded hover:bg-orange-50">
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjusting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAdjusting(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Inventory</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity</label>
                <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Restock, correction..." />
              </div>
              <div className="flex gap-2">
                <button onClick={adjustInventory} className="flex-1 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Save</button>
                <button onClick={() => setAdjusting(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
