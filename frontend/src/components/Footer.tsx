import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-brand-400" />
              <span className="text-lg font-bold text-white">Nirmaan</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Digital infrastructure for construction material supply.
              Building India, one delivery at a time.
            </p>
          </div>

          {/* Materials */}
          <div>
            <h3 className="text-sm font-semibold text-white">Materials</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["Cement", "Sand & Gravel", "Steel & TMT", "Bricks", "Tiles", "Paint"].map(
                (item) => (
                  <li key={item}>
                    <Link href="/products" className="transition hover:text-white">
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["About Us", "Careers", "Blog", "Contact", "Partner with Us"].map(
                (item) => (
                  <li key={item}>
                    <Link href="/" className="transition hover:text-white">
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2 text-gray-400">
                📞 +91 9876 543 210
              </li>
              <li className="text-gray-400">
                ✉️ support@nirmaan.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Nirmaan. All rights reserved. Made with ❤️ in Telangana.
        </div>
      </div>
    </footer>
  );
}
