import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsBand from "@/components/landing/StatsBand";
import DeferredCalculator from "@/components/landing/DeferredCalculator";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustSection from "@/components/landing/TrustSection";
import GetTheAppBanner from "@/components/landing/GetTheAppBanner";
import LandingFooter from "@/components/landing/LandingFooter";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-amortix-frost text-amortix-text-primary">
      <LandingNav />
      <main>
        <HeroSection />
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
