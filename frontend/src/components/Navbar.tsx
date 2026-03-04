"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, Building2 } from "lucide-react";

const NAV_LINKS = [
  { label: "Materials", href: "/products" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Track Order", href: "/orders" },
  { label: "For Suppliers", href: "/suppliers/register" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-brand-500" />
          <span className="text-xl font-bold text-gray-900">
            Nirmaan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              0
            </span>
          </Link>

          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 md:flex"
          >
            <User className="h-4 w-4" />
            Login
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-gray-600 md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t pt-3">
              <Link href="/login" className="btn-primary w-full text-center">
                Login / Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
