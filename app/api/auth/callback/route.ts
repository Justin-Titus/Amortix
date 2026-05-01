import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const user = data.user
      
      // Sync user with Prisma for OAuth/Email sign-ins
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
              image: user.user_metadata?.avatar_url ?? null,
              emailVerified: new Date(),
            },
          })
        }
      } catch (prismaError) {
        console.error("Failed to sync OAuth user with Prisma:", prismaError)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
