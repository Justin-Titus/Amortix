import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { logInfo, logWarn, reportError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      logWarn("email_verification_invalid", { reason: "missing_token" });
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
    }

    const hashedToken = hashToken(token);
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!tokenRecord || tokenRecord.type !== "EMAIL_VERIFICATION") {
      logWarn("email_verification_invalid", { token: hashedToken });
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
      logWarn("email_verification_expired", { token: hashedToken, userId: tokenRecord.userId });
      return NextResponse.redirect(new URL("/login?error=token-expired", request.url));
    }

    const redirectUrl = new URL("/login", request.url);

    if (tokenRecord.userId) {
      await prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: new Date() },
      });
      await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
      logInfo("email_verified", { userId: tokenRecord.userId });
      redirectUrl.searchParams.set("verified", "true");
    } else {
      await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
      redirectUrl.searchParams.set("verified", "false");
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    reportError(error, { route: "/api/auth/verify" });
    return NextResponse.redirect(new URL("/login?error=verification-failed", request.url));
  }
}
