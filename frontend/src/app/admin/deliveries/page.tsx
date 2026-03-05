'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, Truck, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label.replace(/_/g, ' ')}</span>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800', in_transit: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
};

export default function DeliveriesPage() {
  const { adminFetch } = useAdmin();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [delayData, setDelayData] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'deliveries' | 'partners' | 'delays'>('deliveries');
  const pageSize = 20;

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/deliveries?${params}`);
      if (res.ok) { const d = await res.json(); setDeliveries(d.deliveries); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, statusFilter, adminFetch]);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/delivery-partners`);
      if (res.ok) { const d = await res.json(); setPartners(d.partners); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  const fetchDelays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/predictions/delivery-delays`);
      if (res.ok) setDelayData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    if (tab === 'deliveries') fetchDeliveries();
    else if (tab === 'partners') fetchPartners();
    else fetchDelays();
  }, [tab, page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Deliveries</h2>
        <button onClick={() => tab === 'deliveries' ? fetchDeliveries() : tab === 'partners' ? fetchPartners() : fetchDelays()} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['deliveries', 'partners', 'delays'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            {t === 'delays' ? 'Delay Risk' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'deliveries' && (
        <>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="">All Status</option>
            {['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Order #', 'Partner', 'Status', 'Distance', 'Fee', 'ETA', 'Actual', 'Created'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveries.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{d.order_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.partner_name}</td>
                        <td className="px-4 py-3"><Badge label={d.status} color={STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-800'} /></td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.distance_km ? `${d.distance_km} km` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.delivery_fee ? `₹${d.delivery_fee}` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.estimated_delivery)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.actual_delivery)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={18} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'partners' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Phone', 'Vehicle', 'Available', 'Verified', 'Rating', 'Deliveries', 'Completion %', 'City'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.vehicle_type} ({p.vehicle_number})</td>
                      <td className="px-4 py-3"><Badge label={p.is_available ? 'Online' : 'Offline'} color={p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} /></td>
                      <td className="px-4 py-3"><Badge label={p.is_verified ? 'Yes' : 'No'} color={p.is_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} /></td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.rating ? `${p.rating.toFixed(1)} ★` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.total_deliveries}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.completion_rate ? `${p.completion_rate}%` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'delays' && delayData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{delayData.total_analyzed}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">{delayData.on_time_rate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Avg Delay</p>
              <p className="text-2xl font-bold text-orange-600">{delayData.avg_delay_hours}h</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Delayed</p>
              <p className="text-2xl font-bold text-red-600">{delayData.delayed_deliveries}</p>
            </div>
          </div>

          {delayData.at_risk_pending?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" /> At-Risk Pending Deliveries
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {delayData.at_risk_pending.map((d: any) => (
                  <div key={d.delivery_id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">Order: {d.order_id.slice(0, 8)}...</p>
                      <p className="text-xs text-gray-500">Status: {d.status}</p>
                    </div>
                    <div className="text-right">
                      <Badge label={d.risk_level} color={d.risk_level === 'overdue' ? 'bg-red-100 text-red-700' : d.risk_level === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'} />
                      <p className="text-xs text-gray-500 mt-1">{d.remaining_hours}h remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
