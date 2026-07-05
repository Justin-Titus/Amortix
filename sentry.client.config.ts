import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production — no noise in dev
  enabled: process.env.NODE_ENV === "production",

  // Free tier friendly: capture 10% of transactions for performance
  tracesSampleRate: 0.1,

  // Replay session on errors only (free tier limit awareness)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all input values — important for financial app privacy
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],

  // Never send PII in error messages
  beforeSend(event) {
    // Strip any email-like strings from error messages
    if (event.message) {
      event.message = event.message.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "[email]"
      );
    }
    return event;
  },
});
