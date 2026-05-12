import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ── Routes that require authentication ──────────────────────
const USER_ROUTES = ["/try", "/history", "/profile"];
const ADMIN_ROUTES = ["/admin/dashboard", "/admin/users", "/admin/scans", "/admin/sales", "/admin/settings"];

// ── Security headers applied to every response ───────────────
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine route type
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (isUserRoute || isAdminRoute) {
    const token = request.cookies.get("fg_token")?.value;

    if (!token) {
      const loginUrl = isAdminRoute
        ? new URL("/admin/login", request.url)
        : new URL("/auth", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-dev-secret");
      const { payload } = await jwtVerify(token, secret);

      // Enforce admin role for admin routes
      if (isAdminRoute && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Attach user context to headers so server components can read it
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", String(payload.sub));
      requestHeaders.set("x-user-role", String(payload.role ?? "user"));

      const response = NextResponse.next({ request: { headers: requestHeaders } });
      return applySecurityHeaders(response);
    } catch {
      // Invalid / expired token — clear cookie and redirect
      const loginUrl = isAdminRoute
        ? new URL("/admin/login", request.url)
        : new URL("/auth", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("fg_token");
      return response;
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === "/auth" || pathname === "/admin/login") {
    const token = request.cookies.get("fg_token")?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-dev-secret");
        const { payload } = await jwtVerify(token, secret);
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/try", request.url));
      } catch {
        // Expired token — let them through to login
      }
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
