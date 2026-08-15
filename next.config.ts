import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://us.i.posthog.com https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.pwnedpasswords.com https://challenges.cloudflare.com https://us.i.posthog.com https://*.ingest.sentry.io; frame-src 'self' https://challenges.cloudflare.com;",
          },
        ],
      },
    ];
  },
};

const configWithPWA = withPWA(nextConfig);

export default withSentryConfig(configWithPWA, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silent in CI unless SENTRY_AUTH_TOKEN is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps only in production
  widenClientFileUpload: true,
  disableLogger: true,

  // Don't block builds if Sentry is misconfigured
  errorHandler(err: Error) {
    console.warn("[Sentry] Build plugin warning:", err.message);
  },
});
