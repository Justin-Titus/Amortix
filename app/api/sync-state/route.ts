import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the latest updatedAt from User, Loan, and Payment
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { updatedAt: true },
    });

    const lastLoan = await prisma.loan.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const lastPayment = await prisma.payment.findFirst({
      where: { loan: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const dates = [
      { type: 'profile', date: userRecord?.updatedAt },
      { type: 'loan', date: lastLoan?.updatedAt },
      { type: 'payment', date: lastPayment?.createdAt },
    ].filter((item) => item.date) as { type: string; date: Date }[];

    if (!dates.length) {
      return NextResponse.json({ lastUpdated: new Date().toISOString(), type: 'system' });
    }

    const latest = dates.reduce((max, current) => 
      current.date.getTime() > max.date.getTime() ? current : max
    );

    return NextResponse.json({ 
      lastUpdated: latest.date.toISOString(),
      type: latest.type
    });
  } catch (error) {
    console.error("Error fetching sync state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
