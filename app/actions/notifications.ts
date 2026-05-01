"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withServerAction } from "@/lib/server-action-wrapper";
import { enforceRateLimit } from "@/lib/with-rate-limit";

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export async function getUserNotifications(limit = 8): Promise<NotificationRecord[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 20)),
  });

  return notifications.map((item: {
    id: string;
    title: string;
    body: string;
    type: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
  }) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    type: item.type,
    link: item.link,
    isRead: item.isRead,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function markNotificationAsRead(notificationId: string) {
  return await withServerAction("markNotificationAsRead", async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const rl = await enforceRateLimit(user.id, "mark-notification");
    if (!rl.allowed) return { error: "Too many requests. Please try again later." };

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  });
}

export async function markAllNotificationsAsRead() {
  return await withServerAction("markAllNotificationsAsRead", async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const rl = await enforceRateLimit(user.id, "mark-all-notifications");
    if (!rl.allowed) return { error: "Too many requests. Please try again later." };

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  });
}
