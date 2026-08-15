"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { withServerAction } from "@/lib/server-action-wrapper";
import crypto from "crypto";
import { headers } from "next/headers";

const recordConsentSchema = z.object({
  purpose: z.string().min(1).max(50),
  granted: z.boolean(),
});

/**
 * Persists a user consent record in the database for DPDP compliance audit trails.
 */
export async function recordUserConsent(data: z.infer<typeof recordConsentSchema>) {
  return await withServerAction("recordUserConsent", async () => {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      // Unauthenticated consent (e.g. guest visiting landing page) is managed client-side in localStorage.
      return { success: true, guest: true };
    }

    const validated = recordConsentSchema.safeParse(data);
    if (!validated.success) {
      throw new Error("Invalid request data");
    }

    const reqHeaders = await headers();
    const rawIp = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || undefined;
    
    // Hash IP address for privacy-friendly audit trail
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

    const record = await prisma.consentRecord.create({
      data: {
        userId: supabaseUser.id,
        purpose: validated.data.purpose,
        granted: validated.data.granted,
        ipHash,
        userAgent,
      },
    });

    return { success: true, recordId: record.id };
  });
}
