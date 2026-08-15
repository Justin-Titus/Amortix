import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { env } from "@/lib/env";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { PostHogPageView } from "@/components/analytics/PostHogPageView";
import { ConsentBanner } from "@/components/ui/ConsentBanner";
import { ConsentWrapper } from "@/components/ui/ConsentWrapper";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading-font",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body-font",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-font",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});


export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: {
    default: "Amortix — Turn Debt Into a Deadline",
    template: "%s | Amortix",
  },
  description:
    "Amortix is an AI-powered loan management platform that helps you make smarter decisions about loans. Compare repayment strategies, track your debt, and save thousands in interest.",
  keywords: [
    "loan calculator",
    "EMI calculator",
    "debt repayment",
    "amortization",
    "loan comparison",
    "financial planning",
    "avalanche strategy",
    "snowball strategy",
    "financial freedom",
  ],
  icons: {
    icon: "/Amortix.png",
  },
  openGraph: {
    title: "Amortix — Turn Debt Into a Deadline",
    description:
      "AI-powered loan management. Compare strategies, track debt, save on interest.",
    type: "website",
    locale: "en_IN",
    siteName: "Amortix",
    images: ["/Amortix.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "vHuZEzo-WWZ_EvtN9QbIC18FZpbpv398in2TkEjSp8I",
  },
  appleWebApp: {
    title: "Amortix",
    statusBarStyle: "default",
  },
  metadataBase: new URL(env.APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${spaceGrotesk.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster richColors position="top-right" />
        {/* DPDP-compliant consent banner — shown on first visit */}
        <ConsentBanner />
        {/* Non-essential trackers — gated behind analytics consent */}
        <ConsentWrapper>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </ConsentWrapper>
      </body>
    </html>
  );
}

