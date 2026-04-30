import DashboardShell from "@/components/layout/DashboardShell";
import { auth } from "@/lib/auth";
import { captureMonthlySnapshot } from "@/app/actions/snapshot";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.id) {
    void captureMonthlySnapshot(session.user.id).catch((error) => {
      console.error("Failed to capture monthly snapshot:", error);
    });
  }

  return <DashboardShell>{children}</DashboardShell>;
}
