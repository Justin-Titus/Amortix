import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  secure?: boolean;
};

export async function createClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
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
    }
  )
}
