'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, ShoppingCart, Package, Truck, DollarSign,
  Shield, BarChart3, Settings, LogOut, AlertTriangle, ChevronLeft,
  ChevronRight, Bell, Menu, X, Star, MessageSquare, Box,
  TrendingUp, Activity, FileText
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Admin Auth Context ──────────────────────────────────

interface AdminUser {
  id: string;
  full_name: string;
  email?: string;
  admin_role: string;
  permissions: string[];
}

interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  hasPermission: (scope: string) => boolean;
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('nirmaan_admin_token');
    const storedAdmin = localStorage.getItem('nirmaan_admin_user');
    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken);
        setAdmin(JSON.parse(storedAdmin));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, adminData: AdminUser) => {
    localStorage.setItem('nirmaan_admin_token', newToken);
    localStorage.setItem('nirmaan_admin_user', JSON.stringify(adminData));
    setToken(newToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('nirmaan_admin_token');
    localStorage.removeItem('nirmaan_admin_user');
    setToken(null);
    setAdmin(null);
    router.push('/admin/login');
  };

  const hasPermission = (scope: string): boolean => {
    if (!admin) return false;
    if (admin.admin_role === 'super_admin') return true;
    return admin.permissions.includes(scope);
  };

  const adminFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      logout();
    }
    return response;
  };

  return (
    <AdminContext.Provider value={{ admin, token, loading, login, logout, hasPermission, adminFetch }}>
      {children}
    </AdminContext.Provider>
  );
}

// ── Sidebar Navigation ──────────────────────────────────

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: 'analytics:view' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', permission: 'orders:view' },
  { href: '/admin/users', icon: Users, label: 'Users', permission: 'users:view' },
  { href: '/admin/suppliers', icon: Box, label: 'Suppliers', permission: 'suppliers:view' },
  { href: '/admin/products', icon: Package, label: 'Products', permission: 'products:view' },
  { href: '/admin/inventory', icon: AlertTriangle, label: 'Inventory', permission: 'inventory:view' },
  { href: '/admin/deliveries', icon: Truck, label: 'Deliveries', permission: 'deliveries:view' },
  { href: '/admin/payments', icon: DollarSign, label: 'Payments', permission: 'payments:view' },
  { href: '/admin/disputes', icon: MessageSquare, label: 'Disputes', permission: 'disputes:view' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews', permission: 'reviews:view' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics:view' },
  { href: '/admin/security', icon: Shield, label: 'Security', permission: 'system:audit' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', permission: 'system:manage' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { admin, hasPermission, logout } = useAdmin();
  const [alertCount, setAlertCount] = useState(0);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className="font-bold text-lg">Nirmaan</span>
          </Link>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-800 transition">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && admin && (
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-xs text-gray-400 truncate">{admin.full_name}</p>
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-400 uppercase">
            {admin.admin_role.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {NAV_ITEMS.map(item => {
          if (!hasPermission(item.permission)) return null;
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${active
                  ? 'bg-orange-600/20 text-orange-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-700">
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition
            ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Top Bar ──────────────────────────────────────────────

function TopBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { admin } = useAdmin();
  const pathname = usePathname();

  // Derive page title from pathname
  const segments = pathname.split('/').filter(Boolean);
  const title = segments.length > 1
    ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Dashboard';

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 transition-all duration-300
        ${sidebarCollapsed ? 'left-16' : 'left-64'}`}
    >
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
            {admin?.full_name?.charAt(0) || 'A'}
          </div>
          {admin && (
            <span className="text-sm font-medium text-gray-700 hidden md:block">{admin.full_name}</span>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Layout Shell ────────────────────────────────────────

function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { admin, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [loading, admin, pathname, router]);

  // Login page — no shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar sidebarCollapsed={collapsed} />
      <main
        className={`pt-20 pb-8 px-6 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}
      >
        {children}
      </main>
    </div>
  );
}

// ── Root Layout ─────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
