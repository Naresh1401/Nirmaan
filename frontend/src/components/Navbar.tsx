"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, LogOut, CreditCard, LayoutDashboard, ChevronDown, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/hooks/useCart";
import NirmaanLogo from "@/components/NirmaanLogo";

const NAV_LINKS = [
  { label: "Materials", href: "/products" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "AI Estimator", href: "/estimator" },
  { label: "Orders", href: "/orders" },
  { label: "Credit", href: "/credit" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white text-[11px] sm:text-xs text-center py-1.5 font-medium tracking-wide">
        <span className="inline-flex items-center gap-2">
          <span className="hidden sm:inline">🏗️</span>
          <span>Telangana&apos;s Trusted Construction Materials Platform</span>
          <span className="mx-1 opacity-50">•</span>
          <span className="font-semibold">🚚 FREE Delivery on orders above ₹10,000</span>
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <NirmaanLogo className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 transition hover:text-orange-600 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link
              href="/cart"
              className="relative rounded-xl p-2.5 text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(user?.full_name || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user?.full_name || 'User'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || user?.phone}</p>
                    </div>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <ShoppingCart className="w-4 h-4 text-gray-400" /> My Orders
                    </Link>
                    <Link href="/credit" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <CreditCard className="w-4 h-4 text-gray-400" /> Business Credit
                    </Link>
                    {user?.role === 'supplier' && (
                      <Link href="/supplier/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4 text-gray-400" /> Supplier Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4 text-gray-400" /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-bold text-white transition hover:from-orange-600 hover:to-red-600 shadow-md"
              >
                Sign Up Free
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-gray-600 lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {(user?.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user?.full_name}</p>
                      <p className="text-xs text-gray-400">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-bold text-white">Sign Up Free</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
