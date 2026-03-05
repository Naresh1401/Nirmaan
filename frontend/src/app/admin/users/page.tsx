'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Search, ChevronLeft, ChevronRight, Eye, UserCheck, UserX, Loader2, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

export default function UsersPage() {
  const { adminFetch } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (activeFilter) params.set('is_active', activeFilter);
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/users?${params}`);
      if (res.ok) { const d = await res.json(); setUsers(d.users); setTotal(d.total); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, roleFilter, activeFilter, adminFetch]);

  useEffect(() => { fetchUsers(); }, [page, roleFilter, activeFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const toggleActive = async (userId: string) => {
    const res = await adminFetch(`${API_URL}/api/v1/admin/v2/users/${userId}/toggle-active`, { method: 'PUT' });
    if (res.ok) fetchUsers();
  };

  const viewDetail = async (userId: string) => {
    setDetailLoading(true);
    const res = await adminFetch(`${API_URL}/api/v1/admin/v2/users/${userId}`);
    if (res.ok) setSelectedUser(await res.json());
    setDetailLoading(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">{total} total users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </form>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
          <option value="delivery_partner">Delivery Partner</option>
          <option value="admin">Admin</option>
        </select>
        <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
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
                  {['Name', 'Phone', 'Role', 'Status', 'Orders', 'Spent', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                        {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{u.phone}</td>
                    <td className="px-4 py-3"><Badge label={u.role} color="bg-blue-100 text-blue-700" /></td>
                    <td className="px-4 py-3">
                      <Badge label={u.is_active ? 'Active' : 'Suspended'} color={u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{u.total_orders}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(u.total_spent)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => viewDetail(u.id)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => toggleActive(u.id)} className={`p-1.5 rounded ${u.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={u.is_active ? 'Suspend' : 'Activate'}>
                          {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            {detailLoading ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedUser.user?.full_name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedUser.user?.phone}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedUser.user?.email || '—'}</span></div>
                  <div><span className="text-gray-500">Role:</span> <Badge label={selectedUser.user?.role} color="bg-blue-100 text-blue-700" /></div>
                  <div><span className="text-gray-500">Status:</span> <Badge label={selectedUser.user?.is_active ? 'Active' : 'Suspended'} color={selectedUser.user?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} /></div>
                  <div><span className="text-gray-500">Orders:</span> <span className="font-medium">{selectedUser.stats?.total_orders}</span></div>
                  <div><span className="text-gray-500">Total Spent:</span> <span className="font-medium">{formatCurrency(selectedUser.stats?.total_spent || 0)}</span></div>
                </div>
                {selectedUser.recent_orders?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Orders</h4>
                    <div className="space-y-2">
                      {selectedUser.recent_orders.slice(0, 5).map((o: any) => (
                        <div key={o.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-xs">
                          <span className="font-mono text-gray-700">{o.order_number}</span>
                          <Badge label={o.status} color="bg-blue-100 text-blue-700" />
                          <span className="font-medium">{formatCurrency(o.total_amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setSelectedUser(null)} className="mt-4 w-full py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
