import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsBand from "@/components/landing/StatsBand";
import DeferredCalculator from "@/components/landing/DeferredCalculator";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustSection from "@/components/landing/TrustSection";
import GetTheAppBanner from "@/components/landing/GetTheAppBanner";
import LandingFooter from "@/components/landing/LandingFooter";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const result = await prisma.loan.aggregate({
    _sum: {
      outstandingBalance: true,
    },
  });
  
  const totalActiveLoans = result._sum.outstandingBalance || 24000000; // Fallback to 2.4Cr if 0

  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />
      <main>
        <HeroSection totalActiveLoans={totalActiveLoans} />
        <StatsBand />
        <DeferredCalculator />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <GetTheAppBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
