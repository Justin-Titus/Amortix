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

  let user = null;

  // Only perform network auth check if accessing protected or auth routes
  if (isProtected || isAuthPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
            try {
              return await fetch(url, {
                ...options,
                headers: {
                  ...options?.headers,
                  Connection: 'close',
                },
              });
            } catch {
              return new Response(JSON.stringify({ error: 'network_timeout' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
              });
            }
          },
        },
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
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {
      user = null;
    }
  }

  return { response: supabaseResponse, user }
}

