import DashboardShell from "@/components/layout/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { captureMonthlySnapshot } from "@/app/actions/snapshot";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user?.id) {
    void captureMonthlySnapshot(user.id).catch((error) => {
      console.error("Failed to capture monthly snapshot:", error);
    });
  }

  return <DashboardShell>{children}</DashboardShell>;
}
