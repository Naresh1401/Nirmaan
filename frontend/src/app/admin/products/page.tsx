'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCw, Package } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

export default function ProductsPage() {
  const { adminFetch } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [oosFilter, setOosFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.set('search', search);
    if (oosFilter) params.set('out_of_stock', 'true');
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/products?${params}`);
      if (res.ok) { const d = await res.json(); setProducts(d.products); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, oosFilter, adminFetch]);

  useEffect(() => { fetchProducts(); }, [page, oosFilter]);

  const toggleActive = async (pid: string, active: boolean) => {
    await adminFetch(`${API_URL}/api/v1/admin/v2/products/${pid}?is_active=${!active}`, { method: 'PUT' });
    fetchProducts();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-sm text-gray-500">{total} products</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchProducts(); }} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
          </div>
        </form>
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer">
          <input type="checkbox" checked={oosFilter} onChange={e => { setOosFilter(e.target.checked); setPage(1); }} className="rounded" />
          Out of stock only
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Brand', 'Price', 'MRP', 'Stock', 'Unit', 'Supplier', 'Active', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.brand || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{p.mrp ? formatCurrency(p.mrp) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${p.stock_quantity <= 0 ? 'text-red-600' : p.stock_quantity <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{p.supplier_name}</td>
                    <td className="px-4 py-3">
                      <Badge label={p.is_active ? 'Active' : 'Inactive'} color={p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p.id, p.is_active)}
                        className={`text-xs px-2.5 py-1 rounded-lg border ${p.is_active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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
    </div>
  );
}
