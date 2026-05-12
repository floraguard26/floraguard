"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Leaf, User, LogOut, History, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: string;
}

export function Navbar({ isLoggedIn = false, userRole }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Self-correct session state client-side — handles pages that render Navbar
  // without a server-side session check (e.g. the marketing home page).
  const [liveLoggedIn, setLiveLoggedIn] = useState(isLoggedIn);
  const [liveRole, setLiveRole] = useState(userRole);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setLiveLoggedIn(!!data.session);
        setLiveRole(data.session?.role ?? undefined);
      })
      .catch(() => {});
  }, [pathname]); // re-check on every navigation

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setLiveLoggedIn(false);
    setLiveRole(undefined);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-flora-700 text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-600 rounded-lg"
          aria-label="FloraGuard home"
        >
          <Leaf className="h-6 w-6 text-flora-600" aria-hidden="true" />
          FloraGuard
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-flora-600",
                  pathname === link.href ? "text-flora-700" : "text-gray-600"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {liveLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-flora-100 text-flora-700 hover:bg-flora-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-600"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-lg py-1 z-50">
                  {liveRole === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-flora-50 hover:text-flora-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <ScanLine className="h-4 w-4" aria-hidden="true" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/try"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-flora-50 hover:text-flora-700"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ScanLine className="h-4 w-4" aria-hidden="true" />
                    Scan Plant
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-flora-50 hover:text-flora-700"
                    onClick={() => setProfileOpen(false)}
                  >
                    <History className="h-4 w-4" aria-hidden="true" />
                    Scan History
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-flora-50 hover:text-flora-700"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    {liveRole !== "admin" && (
                      <Link
                        href="/admin/login"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                        Admin Login
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/try">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-2" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-flora-50 text-flora-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
            {liveLoggedIn ? (
              <>
                <Link
                  href="/try"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <ScanLine className="h-4 w-4" />Scan Plant
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <History className="h-4 w-4" />Scan History
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4" />Profile
                </Link>
                {liveRole !== "admin" && (
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <ScanLine className="h-4 w-4" />Admin Login
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </>
            ) : (
              <>
                <Button variant="outline" size="md" asChild>
                  <Link href="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
                </Button>
                <Button variant="primary" size="md" asChild>
                  <Link href="/try" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
