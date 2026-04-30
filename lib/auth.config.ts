import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/lib/env";

export const authConfig = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/analysis") ||
        nextUrl.pathname.startsWith("/glossary") ||
        nextUrl.pathname.startsWith("/insights") ||
        nextUrl.pathname.startsWith("/loans") ||
        nextUrl.pathname.startsWith("/strategy") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/advisor") ||
        nextUrl.pathname.startsWith("/chat") ||
        nextUrl.pathname.startsWith("/reports") ||
        nextUrl.pathname.startsWith("/profile");

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
