import { prisma } from './prisma';

/** Remove in-app notifications tied to a deleted loan. */
export async function deleteLoanNotifications(loanId: string) {
  return prisma.notification.deleteMany({
    where: { link: `/loans/${loanId}` },
  });
}

export async function createInAppNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'general',
  link: string | null = null
) {
  return prisma.notification.create({
    data: { userId, title, body, type, link },
  });
}
