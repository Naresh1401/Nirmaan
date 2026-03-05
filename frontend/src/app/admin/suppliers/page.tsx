'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

export default function SuppliersPage() {
  const { adminFetch } = useAdmin();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const pageSize = 20;

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (verifiedFilter) params.set('verified', verifiedFilter);
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/suppliers?${params}`);
      if (res.ok) { const d = await res.json(); setSuppliers(d.suppliers); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, verifiedFilter, adminFetch]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/suppliers/pending`);
      if (res.ok) { const d = await res.json(); setPending(d.pending_suppliers); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  useEffect(() => { tab === 'all' ? fetchSuppliers() : fetchPending(); }, [tab, page, verifiedFilter]);

  const verifySupplier = async (id: string, approved: boolean) => {
    await adminFetch(`${API_URL}/api/v1/admin/v2/suppliers/${id}/verify?approved=${approved}`, { method: 'PUT' });
    tab === 'all' ? fetchSuppliers() : fetchPending();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
          <p className="text-sm text-gray-500">{total} suppliers</p>
        </div>
        <button onClick={() => tab === 'all' ? fetchSuppliers() : fetchPending()} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>All Suppliers</button>
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'pending' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          Pending KYC {pending.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px]">{pending.length}</span>}
        </button>
      </div>

      {tab === 'all' && (
        <>
          <div className="flex gap-3">
            <form onSubmit={e => { e.preventDefault(); setPage(1); fetchSuppliers(); }} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business name..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
              </div>
            </form>
            <select value={verifiedFilter} onChange={e => { setVerifiedFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Business Name', 'Owner', 'GST', 'City', 'Verified', 'Products', 'Rating', 'Revenue', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suppliers.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.business_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.owner_name}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.gst_number || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{s.city}</td>
                        <td className="px-4 py-3"><Badge label={s.is_verified ? 'Verified' : 'Pending'} color={s.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} /></td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.product_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.rating ? `${s.rating.toFixed(1)} ★` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">₹{(s.total_revenue || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {!s.is_verified && (
                            <div className="flex gap-1">
                              <button onClick={() => verifySupplier(s.id, true)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle size={16} /></button>
                              <button onClick={() => verifySupplier(s.id, false)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle size={16} /></button>
                            </div>
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
        </>
      )}

      {/* Pending KYC */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
          ) : pending.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
              <p>No pending supplier verifications</p>
            </div>
          ) : (
            pending.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.business_name}</h3>
                    <p className="text-sm text-gray-500">{s.owner_name} • {s.city}, {s.state}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-500">GST:</span> <span className="font-mono">{s.gst_number || '—'}</span></div>
                  <div><span className="text-gray-500">PAN:</span> <span className="font-mono">{s.pan_number || '—'}</span></div>
                </div>
                {/* KYC Checklist */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">KYC Completion</span>
                    <span className="text-xs font-bold text-orange-600">{s.kyc_checklist?.completion_pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${s.kyc_checklist?.completion_pct || 0}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    {s.kyc_checklist && Object.entries(s.kyc_checklist).filter(([k]) => k !== 'completion_pct').map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1">
                        {val ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-400" />}
                        <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verifySupplier(s.id, true)} className="flex-1 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Approve</button>
                  <button onClick={() => verifySupplier(s.id, false)} className="flex-1 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
