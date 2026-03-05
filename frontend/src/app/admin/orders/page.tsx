'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Search, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label.replace(/_/g, ' ')}</span>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800', in_transit: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800', paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800', partially_paid: 'bg-orange-100 text-orange-800',
};

export default function OrdersPage() {
  const { adminFetch } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentFilter) params.set('payment_status', paymentFilter);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/orders?${params}`);
      if (res.ok) { const d = await res.json(); setOrders(d.orders); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, statusFilter, paymentFilter, adminFetch]);

  useEffect(() => { fetchOrders(); }, [page, statusFilter, paymentFilter]);

  const viewDetail = async (orderId: string) => {
    setDetailLoading(true);
    const res = await adminFetch(`${API_URL}/api/v1/admin/v2/orders/${orderId}`);
    if (res.ok) setSelected(await res.json());
    setDetailLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await adminFetch(`${API_URL}/api/v1/admin/v2/orders/${orderId}/status?new_status=${newStatus}`, { method: 'PUT' });
    fetchOrders();
    if (selected) viewDetail(orderId);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchOrders(); }} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
          </div>
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          {['pending', 'confirmed', 'processing', 'in_transit', 'delivered', 'cancelled', 'refunded'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Payment</option>
          {['pending', 'paid', 'partially_paid', 'refunded', 'failed'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Status', 'Payment', 'Amount', 'Items', 'City', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewDetail(o.id)}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3"><Badge label={o.status} color={STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-800'} /></td>
                    <td className="px-4 py-3"><Badge label={o.payment_status} color={STATUS_COLORS[o.payment_status] || 'bg-gray-100 text-gray-800'} /></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{o.item_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{o.delivery_city}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3"><Eye size={16} className="text-gray-400" /></td>
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

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            {detailLoading ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{selected.order?.order_number}</h3>
                  <Badge label={selected.order?.status} color={STATUS_COLORS[selected.order?.status] || 'bg-gray-100 text-gray-800'} />
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium">{selected.customer?.name} • {selected.customer?.phone}</p>
                  <p className="text-xs text-gray-500">{selected.order?.delivery_address}, {selected.order?.delivery_city}</p>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="text-sm font-semibold">{formatCurrency(selected.order?.subtotal || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="text-sm font-semibold">{formatCurrency(selected.order?.delivery_fee || 0)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-orange-600">Total</p>
                    <p className="text-sm font-bold text-orange-600">{formatCurrency(selected.order?.total_amount || 0)}</p>
                  </div>
                </div>

                {/* Items */}
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                <div className="space-y-2 mb-4">
                  {selected.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.supplier_name} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                <div className="space-y-2 mb-4">
                  {selected.timeline?.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={t.status === 'completed' ? 'text-gray-900' : 'text-gray-400'}>{t.event}</span>
                      <span className="text-xs text-gray-400 ml-auto">{t.timestamp ? formatDate(t.timestamp) : '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery */}
                {selected.delivery && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-900">Delivery: {selected.delivery.partner_name || 'Unassigned'}</p>
                    <p className="text-xs text-blue-700">{selected.delivery.status} • {selected.delivery.vehicle_type}</p>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['confirmed', 'processing', 'in_transit', 'delivered', 'cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.order.id, s)} disabled={selected.order?.status === s}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${selected.order?.status === s ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-orange-50 hover:border-orange-300'}`}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <button onClick={() => setSelected(null)} className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
