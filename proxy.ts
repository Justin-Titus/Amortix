import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const protectedPaths = [
  "/dashboard",
  "/analysis",
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

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/settings")) {
    const profileUrl = req.nextUrl.clone();
    profileUrl.pathname = "/profile";
    profileUrl.hash = "";
    return NextResponse.redirect(profileUrl);
  }

  if (pathname.startsWith("/loans/leaks")) {
    const insightsUrl = req.nextUrl.clone();
    insightsUrl.pathname = "/insights";
    insightsUrl.hash = "";
    return NextResponse.redirect(insightsUrl);
  }

  const isLoggedIn = !!req.auth;
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
