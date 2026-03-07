import Link from "next/link";
import NirmaanLogo from "@/components/NirmaanLogo";

export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <NirmaanLogo className="h-9 w-auto" white />
            <p className="mt-3 text-sm text-gray-400">
              Building Peddapalli&apos;s future, one material at a time.
              Delivering construction materials across Peddapalli &amp; surrounding regions.
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
              <li><Link href="/about" className="transition hover:text-white">About Us</Link></li>
              <li><Link href="/careers" className="transition hover:text-white">Careers</Link></li>
              <li><Link href="/blog" className="transition hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
              <li><Link href="/partner" className="transition hover:text-white">Partner with Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/help" className="transition hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2 text-gray-400">
                📞 +91 99898 60375
              </li>
              <li className="text-gray-400">
                ✉️ hello@nirmaan.co
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-8 pb-2 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Nirmaan Construction Materials Pvt. Ltd.</span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Proudly built in</span>
            <span className="font-semibold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Peddapalli, Telangana</span>
            <span className="text-red-500 animate-pulse text-sm">♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
