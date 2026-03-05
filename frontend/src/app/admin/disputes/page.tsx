'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700', investigating: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600',
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700',
};

export default function DisputesPage() {
  const { adminFetch } = useAdmin();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [resType, setResType] = useState('refund');
  const [refundAmt, setRefundAmt] = useState('');
  const [resReason, setResReason] = useState('');
  const pageSize = 20;

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/disputes?${params}`);
      if (res.ok) { const d = await res.json(); setDisputes(d.disputes); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, statusFilter, priorityFilter, adminFetch]);

  useEffect(() => { fetchDisputes(); }, [page, statusFilter, priorityFilter]);

  const resolveDispute = async () => {
    if (!resolving) return;
    await adminFetch(`${API_URL}/api/v1/admin/v2/disputes/${resolving.id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({
        resolution, resolution_type: resType,
        refund_amount: refundAmt ? parseFloat(refundAmt) : null,
        reason: resReason,
      }),
    });
    setResolving(null); setResolution(''); setRefundAmt(''); setResReason('');
    fetchDisputes();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Disputes & Support</h2>
          <p className="text-sm text-gray-500">{total} total disputes</p>
        </div>
        <button onClick={fetchDisputes} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          {['open', 'investigating', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Priority</option>
          {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div> : disputes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
            <p>No disputes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Raised By', 'Type', 'Status', 'Priority', 'Refund', 'Created', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{d.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.raised_by}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.dispute_type}</td>
                    <td className="px-4 py-3"><Badge label={d.status} color={STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-800'} /></td>
                    <td className="px-4 py-3"><Badge label={d.priority} color={PRIORITY_COLORS[d.priority] || 'bg-gray-100 text-gray-800'} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.refund_amount ? formatCurrency(d.refund_amount) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      {d.status !== 'resolved' && d.status !== 'closed' && (
                        <button onClick={() => setResolving(d)} className="text-xs px-3 py-1 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50">Resolve</button>
                      )}
                    </td>
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

      {/* Resolve Modal */}
      {resolving && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResolving(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resolve Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">Order: {resolving.order_number} — {resolving.dispute_type}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Type</label>
                <select value={resType} onChange={e => setResType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="refund">Refund</option>
                  <option value="replacement">Replacement</option>
                  <option value="credit">Credit</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} />
              </div>
              {resType === 'refund' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                  <input type="number" value={refundAmt} onChange={e => setRefundAmt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reason</label>
                <input type="text" value={resReason} onChange={e => setResReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={resolveDispute} className="flex-1 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Resolve</button>
                <button onClick={() => setResolving(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
