import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsBand from "@/components/landing/StatsBand";
import CalculatorSection from "@/components/landing/CalculatorSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustSection from "@/components/landing/TrustSection";
import CtaBanner from "@/components/landing/CtaBanner";
import LandingFooter from "@/components/landing/LandingFooter";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsBand />
        <CalculatorSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
