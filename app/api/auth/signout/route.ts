import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const redirectUrl = new URL("/signout", req.url);
  return NextResponse.redirect(redirectUrl);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}
