import Link from "next/link";
import { getUserSettings } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FinancialProfileForm } from "@/components/dashboard/FinancialProfileForm";

import { NotificationPreferencesForm } from "@/components/dashboard/NotificationPreferencesForm";
import { DataRightsSection } from "@/components/dashboard/DataRightsSection";

const UNAUTHORIZED_TEXT = "Unauthorized";
const DB_UNAVAILABLE_TEXT = "DatabaseUnavailable";

export const metadata = {
  title: "Profile ",
  description: "Manage your profile, financial details, and preferences.",
};

type ProfileUser = {
  name: string | null;
  email: string | null;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  financialProfile: {
    monthlyIncome?: number | null;
    monthlyExpenses?: number | null;
    creditScoreRange?: string | null;
    employmentType?: string | null;
    hasEmergencyFund?: boolean | null;
    emergencyFundMonths?: number | null;
  } | null;
};

type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "BUSINESS_OWNER" | "STUDENT" | "OTHER";

function normalizeEmploymentType(value: string | null | undefined): EmploymentType {
  if (value === "SALARIED" || value === "SELF_EMPLOYED" || value === "BUSINESS_OWNER" || value === "STUDENT" || value === "OTHER") {
    return value;
  }
  return "SALARIED";
}

function ProfileSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-visible">
      <div className="px-6 py-4 border-b border-slate-100">
        <p className="text-[13px] font-medium text-[#0D1F3C]">{title}</p>
        {description ? <p className="text-[11px] text-slate-400 mt-1">{description}</p> : null}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default async function ProfilePage() {
  let user: ProfileUser | null = null;
  try {
    const userCandidate = await getUserSettings();
    user =
      userCandidate && typeof userCandidate === "object" && "financialProfile" in userCandidate
        ? (userCandidate as ProfileUser)
        : null;
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error);

    if (rawMessage.includes(UNAUTHORIZED_TEXT)) {
      redirect("/login");
    }

    const message = rawMessage.includes(DB_UNAVAILABLE_TEXT)
      ? "Profile is temporarily unavailable because the database connection failed. Check your DATABASE_URL and internet/DNS access, then refresh."
      : "We couldn't load your profile right now. Please refresh the page or try again in a moment.";

    return (
      <div className="animate-fade-up max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            <User className="h-3.5 w-3.5 text-slate-400" />
            Profile controls
          </div>
          <h1 className="mt-4 text-3xl font-heading font-medium text-[#0D1F3C] md:text-4xl">
            Account profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 md:text-[15px]">
            {message}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  const profile = user.financialProfile ?? null;

  const defaultValues = {
    monthlyIncome: profile?.monthlyIncome?.toString() ?? "",
    monthlyExpenses: profile?.monthlyExpenses?.toString() ?? "",
    creditScoreRange: profile?.creditScoreRange ?? "700-749",
    employmentType: normalizeEmploymentType(profile?.employmentType),
    hasEmergencyFund: profile?.hasEmergencyFund ?? false,
    emergencyFundMonths: profile?.emergencyFundMonths?.toString() ?? "0",
  };

  const safeDisplayName = user.name?.trim() || "Unnamed user";
  const userInitial = user.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="animate-fade-up max-w-5xl mx-auto space-y-6">
      <PageHero
        badge={{ icon: User, label: "Profile controls" }}
        title="Account profile"
        description="Update your financial profile to improve risk scoring and AI advisor accuracy."
      />

      <div className="space-y-4">
        <ProfileSection title="Account" description="Your login identity">
          <div className="flex items-center gap-4 py-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white text-[15px] font-medium">
              {userInitial}
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#0D1F3C]">{safeDisplayName}</p>
              <p className="text-[12px] text-slate-400">{user.email}</p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Financial profile" description="Used for risk scoring and AI analysis">
          <FinancialProfileForm defaultValues={defaultValues} />
        </ProfileSection>

        <ProfileSection title="Notification preferences" description="Manage how Amortix contacts you">
          <NotificationPreferencesForm 
            emailNotifications={user.emailNotifications ?? true} 
            pushNotifications={user.pushNotifications ?? true} 
          />
        </ProfileSection>

        <ProfileSection title="Data privacy & rights (DPDP Act, 2023)" description="Export your data or request account erasure">
          <DataRightsSection />
        </ProfileSection>

        <ProfileSection title="Account actions" description="Irreversible operations">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-[#0D1F3C]">Sign out</p>
              <p className="text-[11px] text-slate-400">Confirm sign out on a secure page</p>
            </div>
            <Link href="/signout" className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] text-slate-500 hover:bg-slate-50 transition-colors">
              Sign out
            </Link>
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
