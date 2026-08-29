import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = withPWAInit({
  dest: "public",
  // Disable SW in development AND in local production builds (pnpm start).
  // The SW intercepts Supabase auth requests locally and causes hangs.
  // On Vercel, VERCEL=1 is always set so the SW will be active there.
  disable: process.env.NODE_ENV === "development" || (!process.env.VERCEL && !process.env.CI),
  // Prepend NetworkOnly rules for PostHog and Sentry so the service worker
  // never intercepts those requests. Without this, Workbox's cross-origin
  // catch-all route tries to fetch+cache them and gets blocked by CSP.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /^https:\/\/.*\.i\.posthog\.com\/.*/i,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /^https:\/\/.*\.sentry\.io\/.*/i,
        handler: "NetworkOnly",
      },
    ],
  },
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://us.i.posthog.com https://us-assets.i.posthog.com https://*.i.posthog.com https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.pwnedpasswords.com https://challenges.cloudflare.com https://us.i.posthog.com https://us-assets.i.posthog.com https://*.i.posthog.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://*.sentry.io; worker-src 'self' blob: https://us.i.posthog.com https://us-assets.i.posthog.com https://*.i.posthog.com; child-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com;",
          },
        ],
      },
    ];
  },
};

const configWithPWA = withPWA(nextConfig);

// Exclude Sentry in local builds to speed up the process and avoid errors
// Local builds won't have VERCEL or CI env variables set.
const isLocal = !process.env.VERCEL && !process.env.CI;

export default isLocal ? configWithPWA : withSentryConfig(configWithPWA, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silent in CI unless SENTRY_AUTH_TOKEN is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps only in production
  widenClientFileUpload: true,

  // Don't block builds if Sentry is misconfigured
  errorHandler(err: Error) {
    console.warn("[Sentry] Build plugin warning:", err.message);
  },
});
