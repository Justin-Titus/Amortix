"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { withServerAction } from "@/lib/server-action-wrapper";

const dataRightsSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  requestType: z.enum(["ACCESS", "CORRECTION", "ERASURE", "WITHDRAW", "PORTABILITY"]),
  details: z.string().max(2000).optional(),
  hp_field: z.string().optional(),
});

export async function submitDataRightsRequest(data: z.infer<typeof dataRightsSchema>) {
  return await withServerAction("submitDataRightsRequest", async () => {
    const validated = dataRightsSchema.safeParse(data);
    if (!validated.success) {
      throw new Error("Invalid request data: " + validated.error.issues[0].message);
    }

    // Anti-bot honeypot check
    if (validated.data.hp_field) {
      return {
        success: true,
        message: "Your data rights request has been submitted. Our Grievance Officer will review and respond within 30 days as required under DPDP Act §13.",
      };
    }

    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const request = await prisma.dataRightsRequest.create({
      data: {
        userId: supabaseUser?.id || null,
        name: validated.data.name,
        email: validated.data.email,
        requestType: validated.data.requestType,
        details: validated.data.details || null,
        status: "PENDING",
      },
    });

    return { 
      success: true, 
      requestId: request.id,
      message: "Your data rights request has been submitted. Our Grievance Officer will review and respond within 30 days as required under DPDP Act §13."
    };
  });
}
