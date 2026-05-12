import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-flora-700 text-lg"
              aria-label="FloraGuard home"
            >
              <Leaf className="h-5 w-5 text-flora-600" aria-hidden="true" />
              FloraGuard
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              AI-powered plant disease detection for farmers, agronomists, and plant enthusiasts.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Product
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { href: "/product", label: "Features" },
                { href: "/pricing", label: "Pricing" },
                { href: "/try", label: "Try Free" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-flora-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Company
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-flora-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Legal
            </h3>
            <ul className="space-y-2" role="list">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-flora-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {year} FloraGuard. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            AI suggestions are not a substitute for professional agronomic advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
