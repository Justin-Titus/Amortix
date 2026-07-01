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
    // 2a. Auto-purge old notifications (older than 30 days)
    const purgeLimit = new Date();
    purgeLimit.setDate(purgeLimit.getDate() - 30);
    const purgeResult = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: purgeLimit,
        },
      },
    });
    console.log(`Auto-purged ${purgeResult.count} notifications older than 30 days.`);

    // 2b. Calculate the date window (from today to 3 days out)
    const today = new Date();
    
    const startOfWindow = new Date(today);
    startOfWindow.setHours(0, 0, 0, 0);

    const threeDaysOut = new Date(today);
    threeDaysOut.setDate(today.getDate() + 3);
    const endOfWindow = new Date(threeDaysOut);
    endOfWindow.setHours(23, 59, 59, 999);

    console.log(
      `Running EMI Reminder CRON. Searching for EMIs due between ${startOfWindow.toISOString()} and ${endOfWindow.toISOString()}`
    );

    // 3. Find all loans with nextEmiDate in that window (today to 3 days out)
    const upcomingLoans = await prisma.loan.findMany({
      where: {
        nextEmiDate: {
          gte: startOfWindow,
          lte: endOfWindow,
        },
      },
      include: {
        user: true, // We need the user's email and name
      },
    });

    if (upcomingLoans.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No EMIs due today or in the next 3 days.",
        sentCount: 0,
      });
    }

    // 4. Send the emails and in-app notifications
    let sentCount = 0;
    const errors: string[] = [];

    for (const loan of upcomingLoans) {
      if (!loan.user.email || !loan.nextEmiDate) continue;

      try {
        // Calculate days left relative to today, ignoring time part
        const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const d2 = new Date(loan.nextEmiDate.getFullYear(), loan.nextEmiDate.getMonth(), loan.nextEmiDate.getDate());
        const diffTime = d2.getTime() - d1.getTime();
        const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Skip if outside 0-3 range (safety check)
        if (daysLeft < 0 || daysLeft > 3) continue;

        // Format the date for the email (e.g. "Oct 15, 2023")
        const formattedDueDate = loan.nextEmiDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // 4a. Send Email Reminder
        if (loan.user.emailNotifications) {
          await sendEmiReminderEmail(
            loan.user.email,
            loan.name,
            loan.emiAmount,
            formattedDueDate,
            daysLeft,
            loan.user.name || "there"
          );
        }

        // 4b. Create In-App Notification (and send Mobile Push Notification if token exists)
        const formattedAmount = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
        }).format(loan.emiAmount);

        const dayWord = daysLeft === 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;
        
        if (loan.user.pushNotifications) {
          await sendPushNotification(
            loan.user.id,
            "EMI Reminder 🔔",
            `Your ${loan.name} EMI of ${formattedAmount} is due ${dayWord} on ${formattedDueDate}.`,
            "emi_reminder",
            `/loans/${loan.id}`
          );
        }

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
