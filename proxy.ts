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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Update session and get supabase response
  let response = await updateSession(request);

  // Check auth state for route protection
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (error) {
    // Session is invalid or refresh token is expired.
    // Proceed as unauthenticated.
  }

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
