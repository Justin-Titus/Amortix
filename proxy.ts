import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const protectedPaths = [
  "/dashboard",
  "/analysis",
  "/calendar",
  "/glossary",
  "/insights",
  "/loans",
  "/strategy",
  "/settings",
  "/advisor",
  "/chat",
  "/reports",
  "/profile",
];

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

// Basic in-memory rate limiting map
// Key: IP Address, Value: { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 60; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown-ip';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      if (now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      } else {
        if (record.count >= MAX_REQUESTS) {
          return new NextResponse('Too Many Requests', { status: 429 });
        }
        record.count++;
      }
    }
  }

  // Handle redirects from proxy.ts
  if (pathname.startsWith("/settings")) {
    const profileUrl = request.nextUrl.clone();
    profileUrl.pathname = "/profile";
    profileUrl.hash = "";
    return NextResponse.redirect(profileUrl);
  }

  if (pathname.startsWith("/loans/leaks")) {
    const insightsUrl = request.nextUrl.clone();
    insightsUrl.pathname = "/insights";
    insightsUrl.hash = "";
    return NextResponse.redirect(insightsUrl);
  }

  // Update session and check auth user in single pass
  const { response, user } = await updateSession(request);

  const isLoggedIn = !!user;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
