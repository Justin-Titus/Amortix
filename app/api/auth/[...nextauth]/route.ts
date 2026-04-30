import NextAuth from "next-auth";
import { nextAuthOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { handlers } = NextAuth(nextAuthOptions);
export const GET = handlers.GET;
export const POST = handlers.POST;
