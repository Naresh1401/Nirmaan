'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './layout';
import {
  Users, ShoppingCart, Package, Truck, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Loader2, Clock, CheckCircle, XCircle, Eye, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Helpers ─────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function StatCard({ icon: Icon, label, value, sub, trend, color = 'orange' }: {
  icon: typeof Users; label: string; value: string | number; sub?: string;
  trend?: { value: number; label: string }; color?: string;
}) {
  const colorMap: Record<string, string> = {
    orange: 'from-orange-500 to-red-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    cyan: 'from-cyan-500 to-teal-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.orange} text-white`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-gray-400 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: any }) {
  const severityColors: Record<string, string> = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50',
    info: 'border-green-200 bg-green-50',
  };
  const dotColors: Record<string, string> = {
    high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500', info: 'bg-green-500',
  };

  return (
    <div className={`rounded-lg border p-4 ${severityColors[rec.severity] || 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${dotColors[rec.severity] || 'bg-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{rec.description}</p>
          {rec.action_url && (
            <Link href={rec.action_url} className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-orange-600 hover:text-orange-700">
              {rec.action} <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { adminFetch, hasPermission } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, recRes] = await Promise.all([
        adminFetch(`${API_URL}/api/v1/admin/v2/dashboard`),
        adminFetch(`${API_URL}/api/v1/admin/v2/recommendations`),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (recRes.ok) {
        const r = await recRes.json();
        setRecs(r.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        <AlertTriangle className="mx-auto mb-3" size={40} />
        <p>Failed to load dashboard data</p>
        <button onClick={fetchData} className="mt-3 text-orange-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time platform metrics</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Revenue (30d)" value={formatCurrency(data.revenue?.last_30d || 0)} sub={`GMV: ${formatCurrency(data.revenue?.total_gmv || 0)}`} color="green" />
        <StatCard icon={ShoppingCart} label="Orders (30d)" value={data.orders?.last_30d || 0} sub={`Total: ${data.orders?.total || 0}`} color="blue" />
        <StatCard icon={Users} label="Total Users" value={data.users?.total || 0} sub={`Active: ${data.users?.active || 0}`} color="purple" />
        <StatCard icon={Package} label="Active Products" value={data.products?.active || 0} sub={`Total: ${data.products?.total || 0}`} color="orange" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Revenue (24h)" value={formatCurrency(data.revenue?.last_24h || 0)} color="cyan" />
        <StatCard icon={Clock} label="Orders (24h)" value={data.orders?.last_24h || 0} color="blue" />
        <StatCard icon={Truck} label="Delivery Partners" value={`${data.delivery_partners?.available || 0} / ${data.delivery_partners?.total || 0}`} sub="Available / Total" color="green" />
        <StatCard icon={AlertTriangle} label="Inventory Alerts" value={(data.products?.out_of_stock || 0) + (data.products?.low_stock || 0)} sub={`OOS: ${data.products?.out_of_stock || 0} | Low: ${data.products?.low_stock || 0}`} color="rose" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {data.orders?.by_status && Object.entries(data.orders.by_status).map(([status, count]) => {
              const total = data.orders.total || 1;
              const pct = Math.round(((count as number) / total) * 100);
              const colors: Record<string, string> = {
                pending: 'bg-yellow-500', confirmed: 'bg-blue-500',
                processing: 'bg-indigo-500', in_transit: 'bg-cyan-500',
                delivered: 'bg-green-500', cancelled: 'bg-red-500',
                refunded: 'bg-gray-400',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-gray-900 font-medium">{count as number} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {data.users?.by_role && Object.entries(data.users.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600 capitalize">{role.replace(/_/g, ' ')}</span>
                <span className="text-sm font-semibold text-gray-900">{count as number}</span>
              </div>
            ))}
            <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
              <span>New (7d)</span>
              <span className="font-medium text-green-600">+{data.users?.new_last_7d || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verified Suppliers</span>
              <span className="text-sm font-semibold text-green-600">
                {data.suppliers?.verified || 0} / {data.suppliers?.total || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Suppliers</span>
              <span className="text-sm font-semibold text-yellow-600">{data.suppliers?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payments Paid</span>
              <span className="text-sm font-semibold text-green-600">{data.payments?.paid || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payments Pending</span>
              <span className="text-sm font-semibold text-yellow-600">{data.payments?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Disputes</span>
              <span className="text-sm font-semibold text-red-600">{data.disputes?.open || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue?.avg_order_value || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recs.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
