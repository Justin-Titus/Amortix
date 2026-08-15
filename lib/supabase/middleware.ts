import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  secure?: boolean;
};

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));

  let user = null;

  // Only perform network auth check if user has session cookies or is accessing protected/auth routes
  if (hasAuthCookie || isProtected || isAuthPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null;
    } catch (error) {
      console.error('Middleware AuthError:', error)
    }
  }

  return { response: supabaseResponse, user }
}

