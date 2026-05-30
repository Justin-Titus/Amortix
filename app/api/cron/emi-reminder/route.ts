import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmiReminderEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Secret for security
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("CRON_SECRET is not configured in environment variables.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Calculate the date window (exactly 3 days from today)
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(
      `Running EMI Reminder CRON. Searching for EMIs due between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`
    );

    // 3. Find all loans with nextEmiDate in that 24-hour window
    const upcomingLoans = await prisma.loan.findMany({
      where: {
        nextEmiDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: true, // We need the user's email and name
      },
    });

    if (upcomingLoans.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No EMIs due in exactly 3 days.",
        sentCount: 0,
      });
    }

    // 4. Send the emails and in-app notifications
    let sentCount = 0;
    const errors: string[] = [];

    for (const loan of upcomingLoans) {
      if (!loan.user.email) continue;

      try {
        // Format the date for the email (e.g. "Oct 15, 2023")
        const formattedDueDate = loan.nextEmiDate!.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // 4a. Send Email Reminder
        await sendEmiReminderEmail(
          loan.user.email,
          loan.name,
          loan.emiAmount,
          formattedDueDate,
          loan.user.name || "there"
        );

        // 4b. Create In-App Notification (and send Mobile Push Notification if token exists)
        const formattedAmount = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
        }).format(loan.emiAmount);
        
        await sendPushNotification(
          loan.user.id,
          "EMI Reminder 🔔",
          `Your ${loan.name} EMI of ${formattedAmount} is due in 3 days on ${formattedDueDate}.`,
          "emi_reminder",
          `/loans/${loan.id}`
        );

        sentCount++;
      } catch (err: any) {
        console.error(`Failed to notify ${loan.user.email}:`, err);
        errors.push(`Failed for ${loan.user.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${upcomingLoans.length} upcoming loans.`,
      sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in EMI Reminder CRON:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
