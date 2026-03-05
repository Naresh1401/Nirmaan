'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, TrendingUp, TrendingDown, DollarSign, Package, Users, Truck, BarChart3, PieChart, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'; }

type Tab = 'revenue' | 'products' | 'customers' | 'forecast';

export default function AnalyticsPage() {
  const { adminFetch } = useAdmin();
  const [tab, setTab] = useState<Tab>('revenue');
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, prodRes, suppRes, custRes, forecastRes] = await Promise.all([
        adminFetch(`${API_URL}/api/v1/admin/v2/analytics/revenue-trend?days=${period}`),
        adminFetch(`${API_URL}/api/v1/admin/v2/analytics/top-products?limit=10`),
        adminFetch(`${API_URL}/api/v1/admin/v2/analytics/top-suppliers?limit=10`),
        adminFetch(`${API_URL}/api/v1/admin/v2/analytics/customers`),
        adminFetch(`${API_URL}/api/v1/admin/v2/predictions/revenue?days=${period}`),
      ]);
      if (revRes.ok) setRevenueData(await revRes.json());
      if (prodRes.ok) setTopProducts(await prodRes.json());
      if (suppRes.ok) setTopSuppliers(await suppRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (forecastRes.ok) setForecast(await forecastRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [period, adminFetch]);

  useEffect(() => { fetchAll(); }, [period]);

  const tabs = [
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'products', label: 'Products & Suppliers', icon: Package },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'forecast', label: 'Forecast', icon: Activity },
  ] as const;

  const maxRev = revenueData?.trend ? Math.max(...revenueData.trend.map((t: any) => t.revenue), 1) : 1;
  const maxProdRev = topProducts.length ? Math.max(...topProducts.map(p => p.total_revenue || p.revenue || 1)) : 1;
  const maxSuppRev = topSuppliers.length ? Math.max(...topSuppliers.map(s => s.total_revenue || s.revenue || 1)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Intelligence</h2>
          <p className="text-sm text-gray-500">Revenue trends, forecasts, and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last 12 months</option>
          </select>
          <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
      ) : (
        <>
          {/* Revenue Tab */}
          {tab === 'revenue' && (
            <div className="space-y-6">
              {/* KPI Row */}
              {revenueData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Total Revenue" value={formatCurrency(revenueData.total_revenue || 0)} icon={DollarSign} color="green" />
                  <StatCard label="Total Orders" value={String(revenueData.total_orders || 0)} icon={Package} color="blue" />
                  <StatCard label="Avg Order Value" value={formatCurrency(revenueData.avg_order_value || 0)} icon={BarChart3} color="purple" />
                </div>
              )}

              {/* Revenue Trend Bar Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-green-500" /> Revenue Trend</h3>
                {revenueData?.trend?.length ? (
                  <div className="space-y-0">
                    <div className="flex items-end gap-1 h-48">
                      {revenueData.trend.map((t: any, i: number) => (
                        <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t transition-all hover:from-orange-600 hover:to-orange-400 min-h-[2px]"
                            style={{ height: `${(t.revenue / maxRev) * 100}%` }}
                          />
                          <div className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {formatCurrency(t.revenue)}<br />{formatDate(t.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {revenueData.trend.filter((_: any, i: number) => i % Math.ceil(revenueData.trend.length / 8) === 0).map((t: any, i: number) => (
                        <div key={i} className="flex-1 text-center text-[10px] text-gray-400">{formatDate(t.date)}</div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500">No revenue data for this period</p>}
              </div>
            </div>
          )}

          {/* Products & Suppliers Tab */}
          {tab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package size={20} className="text-orange-500" /> Top Products by Revenue</h3>
                {topProducts.length ? (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-xs text-gray-400 font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name || p.product_name}</p>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${((p.total_revenue || p.revenue) / maxProdRev) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(p.total_revenue || p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No product data</p>}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Truck size={20} className="text-blue-500" /> Top Suppliers by Revenue</h3>
                {topSuppliers.length ? (
                  <div className="space-y-3">
                    {topSuppliers.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-xs text-gray-400 font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name || s.supplier_name || s.business_name}</p>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${((s.total_revenue || s.revenue) / maxSuppRev) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(s.total_revenue || s.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No supplier data</p>}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {tab === 'customers' && customers && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Customers" value={String(customers.total_customers || 0)} icon={Users} color="blue" />
                <StatCard label="Repeat Rate" value={`${(customers.repeat_rate * 100 || 0).toFixed(1)}%`} icon={TrendingUp} color="green" />
                <StatCard label="One-Time Buyers" value={`${((1 - (customers.repeat_rate || 0)) * 100).toFixed(1)}%`} icon={TrendingDown} color="orange" />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users size={20} className="text-blue-500" /> Top Customers</h3>
                {customers.top_customers?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#', 'Customer', 'Orders', 'Total Spend'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customers.top_customers.map((c: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name || c.username}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{c.order_count}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(c.total_spend)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-sm text-gray-500">No customer data</p>}
              </div>

              {/* Buyer segmentation visual */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PieChart size={20} className="text-purple-500" /> Customer Segmentation</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9155" fill="none" stroke="#f97316" strokeWidth="3"
                        strokeDasharray={`${(customers.repeat_rate || 0) * 100} ${100 - (customers.repeat_rate || 0) * 100}`}
                        strokeDashoffset="25" strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{((customers.repeat_rate || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm text-gray-700">Repeat Customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200" />
                      <span className="text-sm text-gray-700">One-Time Buyers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Tab */}
          {tab === 'forecast' && (
            <div className="space-y-6">
              {forecast && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Predicted Revenue" value={formatCurrency(forecast.total_predicted || 0)} icon={TrendingUp} color="green" />
                    <StatCard label="Model" value={forecast.model || 'Trend+EMA'} icon={Activity} color="blue" />
                    <StatCard label="Forecast Days" value={period} icon={BarChart3} color="purple" />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={20} className="text-green-500" /> Revenue Forecast</h3>
                    {forecast.predictions?.length ? (
                      <div className="space-y-0">
                        <div className="flex items-end gap-1 h-48">
                          {forecast.predictions.map((p: any, i: number) => {
                            const maxPred = Math.max(...forecast.predictions.map((pp: any) => pp.upper_bound || pp.predicted_value || 1));
                            return (
                              <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                {/* Confidence band */}
                                <div
                                  className="absolute w-full bg-green-50 rounded-t"
                                  style={{
                                    height: `${((p.upper_bound || p.predicted_value) / maxPred) * 100}%`,
                                    bottom: 0,
                                  }}
                                />
                                {/* Predicted bar */}
                                <div
                                  className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t relative z-10 min-h-[2px]"
                                  style={{ height: `${(p.predicted_value / maxPred) * 100}%` }}
                                />
                                <div className="absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                  {formatCurrency(p.predicted_value)}<br />
                                  {p.lower_bound && <span className="text-gray-300">{formatCurrency(p.lower_bound)} – {formatCurrency(p.upper_bound)}</span>}
                                  <br />{formatDate(p.date || p.period_start)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {forecast.predictions.filter((_: any, i: number) => i % Math.ceil(forecast.predictions.length / 8) === 0).map((p: any, i: number) => (
                            <div key={i} className="flex-1 text-center text-[10px] text-gray-400">{formatDate(p.date || p.period_start)}</div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> Predicted</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-200 rounded" /> 95% Confidence</span>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-500">Not enough data for forecast</p>}
                  </div>
                </>
              )}
              {!forecast && <p className="text-center py-20 text-gray-500">No forecast data available</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={18} /></div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
