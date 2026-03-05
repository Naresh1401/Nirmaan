'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, DollarSign, CreditCard } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }

export default function PaymentsPage() {
  const { adminFetch } = useAdmin();
  const [overview, setOverview] = useState<any>(null);
  const [creditData, setCreditData] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, crRes] = await Promise.all([
        adminFetch(`${API_URL}/api/v1/admin/v2/payments/overview?days=${days}`),
        adminFetch(`${API_URL}/api/v1/admin/v2/credit/overview`),
      ]);
      if (poRes.ok) setOverview(await poRes.json());
      if (crRes.ok) setCreditData(await crRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [days, adminFetch]);

  useEffect(() => { fetchData(); }, [days]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments & Settlements</h2>
          <p className="text-sm text-gray-500">Financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(+e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Revenue Card */}
      {overview && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={24} />
            <h3 className="text-lg font-semibold">Total Revenue ({days}d)</h3>
          </div>
          <p className="text-4xl font-bold">{formatCurrency(overview.revenue)}</p>
        </div>
      )}

      {/* Payment Status */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{overview.payment_status?.paid || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{overview.payment_status?.pending || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Refunded</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{overview.payment_status?.refunded || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overview.payment_status?.failed || 0}</p>
          </div>
        </div>
      )}

      {/* Credit System */}
      {creditData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-indigo-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Credit System</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Accounts</p>
              <p className="text-xl font-bold text-gray-900">{creditData.total_accounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-xl font-bold text-green-600">{creditData.approved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Limit</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(creditData.total_credit_limit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Used</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(creditData.total_used)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-xl font-bold text-indigo-600">{creditData.utilization_rate}%</p>
              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(creditData.utilization_rate, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
