import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV === "production",

  // Server-side: capture all errors, low transaction sampling
  tracesSampleRate: 0.05,

  // Tag every error with the deployment environment
  environment: process.env.VERCEL_ENV ?? "development",

  beforeSend(event) {
    // Never send DATABASE_URL or secret keys in error context
    if (event.extra) {
      delete event.extra["DATABASE_URL"];
      delete event.extra["GROQ_API_KEY"];
    }
    return event;
  },
});
