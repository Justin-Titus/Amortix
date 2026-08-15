import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.loan.aggregate({
      _sum: {
        outstandingBalance: true,
      },
    });

    const totalActiveLoans = result._sum.outstandingBalance || 24000000;

    return NextResponse.json(
      { totalActiveLoans },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.warn("Failed to fetch aggregate active loans stats API:", error);
    return NextResponse.json({ totalActiveLoans: 24000000 });
  }
}
