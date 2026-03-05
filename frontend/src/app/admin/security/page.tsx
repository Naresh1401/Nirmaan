'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../layout';
import { Loader2, RefreshCw, Shield, AlertTriangle, CheckCircle2, Clock, Server, Database, Activity, ChevronLeft, ChevronRight, Eye, Bell, BellOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatDate(d: string) { return d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

type Tab = 'audit' | 'alerts' | 'health' | 'sessions';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700', info: 'bg-gray-100 text-gray-600',
};

export default function SecurityPage() {
  const { adminFetch } = useAdmin();
  const [tab, setTab] = useState<Tab>('audit');

  // Audit state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // Alerts state
  const [alerts, setAlerts] = useState<any[]>([]);

  // Health state
  const [health, setHealth] = useState<any>(null);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [viewingLog, setViewingLog] = useState<any>(null);

  const pageSize = 25;

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ skip: String((auditPage - 1) * pageSize), limit: String(pageSize) });
    if (actionFilter) params.set('action', actionFilter);
    if (entityFilter) params.set('entity_type', entityFilter);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/audit-logs?${params}`);
      if (res.ok) { const d = await res.json(); setAuditLogs(d.logs || d); setAuditTotal(d.total || (d.logs || d).length); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [auditPage, actionFilter, entityFilter, adminFetch]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/alerts`);
      if (res.ok) setAlerts(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/v2/system/health`);
      if (res.ok) setHealth(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_URL}/api/v1/admin/auth/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    if (tab === 'audit') fetchAuditLogs();
    else if (tab === 'alerts') fetchAlerts();
    else if (tab === 'health') fetchHealth();
    else fetchSessions();
  }, [tab, auditPage, actionFilter, entityFilter]);

  const markAlertRead = async (id: number) => {
    await adminFetch(`${API_URL}/api/v1/admin/v2/alerts/${id}/read`, { method: 'PUT' });
    fetchAlerts();
  };

  const revokeSession = async (id: number) => {
    await adminFetch(`${API_URL}/api/v1/admin/auth/sessions/${id}`, { method: 'DELETE' });
    fetchSessions();
  };

  const totalPages = Math.max(1, Math.ceil(auditTotal / pageSize));

  const tabs = [
    { key: 'audit', label: 'Audit Logs', icon: Shield },
    { key: 'alerts', label: 'System Alerts', icon: AlertTriangle },
    { key: 'health', label: 'System Health', icon: Server },
    { key: 'sessions', label: 'Admin Sessions', icon: Clock },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security & Audit</h2>
          <p className="text-sm text-gray-500">System monitoring, audit trail, and session management</p>
        </div>
        <button
          onClick={() => { if (tab === 'audit') fetchAuditLogs(); else if (tab === 'alerts') fetchAlerts(); else if (tab === 'health') fetchHealth(); else fetchSessions(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
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
            {t.key === 'alerts' && alerts.filter(a => !a.is_read).length > 0 && (
              <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">{alerts.filter(a => !a.is_read).length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
      ) : (
        <>
          {/* Audit Logs */}
          {tab === 'audit' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input placeholder="Filter by action..." value={actionFilter} onChange={e => { setActionFilter(e.target.value); setAuditPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48" />
                <input placeholder="Filter by entity type..." value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setAuditPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Timestamp', 'Admin', 'Action', 'Entity', 'IP Address', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No audit logs found</td></tr>
                      ) : auditLogs.map((l: any) => (
                        <tr key={l.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(l.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{l.admin_username || `Admin #${l.admin_user_id}`}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.action}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{l.entity_type}{l.entity_id ? ` #${l.entity_id}` : ''}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-400">{l.ip_address || '—'}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setViewingLog(l)} className="p-1.5 rounded hover:bg-gray-100"><Eye size={16} className="text-gray-500" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-500">Page {auditPage} of {totalPages} ({auditTotal} logs)</span>
                    <div className="flex gap-1">
                      <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={18} /></button>
                      <button onClick={() => setAuditPage(p => Math.min(totalPages, p + 1))} disabled={auditPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {tab === 'alerts' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                  <CheckCircle2 className="mx-auto mb-3 text-green-500" size={40} />
                  <p>No system alerts</p>
                </div>
              ) : alerts.map(a => (
                <div key={a.id} className={`bg-white rounded-xl border ${a.is_read ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'} p-4 flex items-start gap-4`}>
                  <div className="mt-0.5">
                    {a.is_read ? <BellOff size={18} className="text-gray-400" /> : <Bell size={18} className="text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{a.title}</span>
                      <Badge label={a.severity || 'info'} color={SEVERITY_COLORS[a.severity] || SEVERITY_COLORS.info} />
                      <span className="text-xs text-gray-400">{a.alert_type}</span>
                    </div>
                    <p className="text-sm text-gray-600">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(a.created_at)}</p>
                  </div>
                  {!a.is_read && (
                    <button onClick={() => markAlertRead(a.id)} className="text-xs px-3 py-1.5 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 whitespace-nowrap">Mark Read</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* System Health */}
          {tab === 'health' && health && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <HealthCard label="Status" value={health.status || 'OK'} icon={Activity} ok={health.status === 'healthy' || health.status === 'ok'} />
                <HealthCard label="Database" value={health.database || 'Connected'} icon={Database} ok={health.database !== 'disconnected'} />
                <HealthCard label="Uptime" value={health.uptime || '—'} icon={Clock} ok />
                <HealthCard label="Version" value={health.version || '1.0.0'} icon={Server} ok />
              </div>
              {health.metrics && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(health.metrics).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 capitalize">{k.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-semibold text-gray-900">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {health.checks && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Checks</h3>
                  <div className="space-y-2">
                    {Object.entries(health.checks).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700 capitalize">{k.replace(/_/g, ' ')}</span>
                        <Badge label={String(v)} color={v === 'ok' || v === 'healthy' || v === true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sessions */}
          {tab === 'sessions' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['IP Address', 'User Agent', 'Created', 'Expires', 'Step-Up Verified', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No active sessions</td></tr>
                    ) : sessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{s.ip_address || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{s.user_agent || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(s.created_at)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(s.expires_at)}</td>
                        <td className="px-4 py-3">
                          {s.step_up_verified_at ? <Badge label="Yes" color="bg-green-100 text-green-700" /> : <Badge label="No" color="bg-gray-100 text-gray-600" />}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => revokeSession(s.id)} className="text-xs px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Audit Log Detail Modal */}
      {viewingLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingLog(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Audit Log Detail</h3>
            <div className="space-y-3">
              {[
                ['Action', viewingLog.action],
                ['Admin', viewingLog.admin_username || `#${viewingLog.admin_user_id}`],
                ['Entity', `${viewingLog.entity_type}${viewingLog.entity_id ? ` #${viewingLog.entity_id}` : ''}`],
                ['IP Address', viewingLog.ip_address || '—'],
                ['Reason', viewingLog.reason || '—'],
                ['Timestamp', formatDate(viewingLog.created_at)],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-start justify-between">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              {viewingLog.before_state && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Before State</p>
                  <pre className="text-xs bg-red-50 border border-red-100 rounded-lg p-3 overflow-x-auto">{JSON.stringify(viewingLog.before_state, null, 2)}</pre>
                </div>
              )}
              {viewingLog.after_state && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">After State</p>
                  <pre className="text-xs bg-green-50 border border-green-100 rounded-lg p-3 overflow-x-auto">{JSON.stringify(viewingLog.after_state, null, 2)}</pre>
                </div>
              )}
            </div>
            <button onClick={() => setViewingLog(null)} className="w-full mt-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthCard({ label, value, icon: Icon, ok }: { label: string; value: string; icon: any; ok: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon size={18} className={ok ? 'text-green-500' : 'text-red-500'} />
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <p className="text-lg font-bold text-gray-900 capitalize">{value}</p>
      </div>
    </div>
  );
}
