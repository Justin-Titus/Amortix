import { prisma } from './prisma';
import { createInAppNotification } from './notifications';

export async function sendExpoPush(
  userId: string,
  title: string,
  body: string,
  link: string | null = null,
  data?: object
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { expoPushToken: true, pushNotifications: true },
  });

  if (!user?.pushNotifications) {
    return false;
  }

  if (!user.expoPushToken) {
    console.log(`No push token found for user ${userId}, skipped sending push notification.`);
    return false;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: user.expoPushToken,
        title,
        body,
        data: { link, ...data },
        sound: 'default',
        priority: 'high',
        channelId: 'default',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to send push notification via Expo:', errText);
      return false;
    }

    const resData = await response.json();
    // Expo returns HTTP 200 even when individual tickets fail
    const tickets = Array.isArray(resData?.data) ? resData.data : [resData?.data];
    for (const ticket of tickets) {
      if (ticket?.status === 'error') {
        console.error('Expo push ticket error:', ticket.message, ticket.details);
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: null },
          });
          console.log(`Cleared invalid push token for user ${userId}`);
        }
        return false;
      }
    }
    console.log('Push notification sent successfully via Expo:', resData);
    return true;
  } catch (error) {
    console.error('Error sending push notification via Expo:', error);
    return false;
  }
}

/** Creates an in-app notification and optionally sends a mobile push. */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'general',
  link: string | null = null,
  data?: object
) {
  const notification = await createInAppNotification(userId, title, body, type, link);
  await sendExpoPush(userId, title, body, link, data);
  return notification;
}
