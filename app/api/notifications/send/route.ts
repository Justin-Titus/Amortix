import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, notificationBody, type, link } = body;

    if (!userId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, notificationBody' },
        { status: 400 }
      );
    }

    const notification = await sendPushNotification(
      userId,
      title,
      notificationBody,
      type || 'general',
      link || null
    );

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error in send notification API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
