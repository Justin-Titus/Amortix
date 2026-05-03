import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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
    google: "EtdRG0e9kp5wZrHm4h6mIYQgMwDhaF-_9JuRRIujFxw",
  },
  metadataBase: new URL(env.APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
