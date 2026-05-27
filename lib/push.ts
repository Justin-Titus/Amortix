import { prisma } from './prisma';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'general',
  link: string | null = null,
  data?: object
) {
  // 1. Save in-app notification to the database
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      link,
    },
  });

  // 2. Fetch User's Push Token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { expoPushToken: true },
  });

  if (!user?.expoPushToken) {
    console.log(`No push token found for user ${userId}, skipped sending push notification.`);
    return notification;
  }

  // 3. Send Push Notification via Expo Push Service
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: user.expoPushToken,
        title,
        body,
        data: { link, ...data },
        sound: 'default',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to send push notification via Expo:', errText);
    } else {
      const resData = await response.json();
      console.log('Push notification sent successfully via Expo:', resData);
    }
  } catch (error) {
    console.error('Error sending push notification via Expo:', error);
  }

  return notification;
}
