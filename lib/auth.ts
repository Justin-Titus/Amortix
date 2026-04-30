import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

const authCallbacks = authConfig.callbacks as Partial<NextAuthConfig["callbacks"]> | undefined;

export const nextAuthOptions: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    ...authConfig.providers.filter((p) => p.id !== "credentials"),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password || !user.emailVerified) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt(props: any) {
      const originalJwt = authCallbacks?.jwt
        ? await authCallbacks.jwt(props)
        : props.token;

      const token = originalJwt ?? props.token;

      if (props.user) {
        token.id = props.user.id;
      }

      return token;
    },
    async session(props: any) {
      const originalSession = authCallbacks?.session
        ? await authCallbacks.session(props)
        : props.session;

      const session = originalSession ?? props.session;

      if (props.token?.id) {
        session.user.id = props.token.id as string;
      }

      return session;
    },
  },
};

const nextAuth = NextAuth(nextAuthOptions);

export const {
  auth,
  signIn,
  signOut,
} = nextAuth;

export const GET = nextAuth.handlers.GET;
export const POST = nextAuth.handlers.POST;
export const handlers = nextAuth.handlers;
