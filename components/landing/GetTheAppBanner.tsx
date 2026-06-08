"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, Star, Shield } from "lucide-react";

const GITHUB_RELEASE_URL =
  "https://github.com/Justin-Titus/AmortixMobile/releases/latest/download/Amortix.apk";

export default function GetTheAppBanner() {
  return (
    <section
      id="get-app"
      aria-labelledby="get-app-heading"
      className="bg-white py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-4xl bg-amortix-navy px-6 py-12 sm:px-10 sm:py-14 lg:px-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background glows */}
          <div className="pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amortix-emerald/5 blur-2xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Text */}
            <div className="max-w-xl">
              <p className="section-label text-white/50">
                Available on Android
              </p>
              <h2
                id="get-app-heading"
                className="section-heading mt-2.5 text-white"
              >
                Manage your loans,
                <br />
                anywhere you go.
              </h2>
              <p className="body-text mt-4 text-white/65">
                The Amortix mobile app puts your full debt dashboard in your
                pocket. Track EMIs, get AI insights, and view your payoff
                trajectory — all offline-ready.
              </p>

              {/* Trust chips */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: Shield, label: "Secure local storage" },
                  { icon: Star, label: "AI advisor on-the-go" },
                  { icon: Smartphone, label: "Works offline" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/70"
                  >
                    <Icon className="h-3.5 w-3.5 text-amortix-emerald-light" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  id="landing-download-apk"
                  href={GITHUB_RELEASE_URL}
                  className="inline-flex items-center gap-2.5 rounded-[var(--radius-button)] bg-amortix-emerald px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(17,140,118,0.3)] transition-all hover:shadow-[0_20px_40px_rgba(17,140,118,0.4)] active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Download for Android
                </a>
                <a
                  href="https://github.com/Justin-Titus/AmortixMobile/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 underline underline-offset-4 hover:text-white/60 transition-colors"
                >
                  View all releases on GitHub
                </a>
              </div>

              <p className="mt-3.5 text-[11px] text-white/30">
                Android only · Free to download · No Play Store required
              </p>
            </div>

            {/* Right: Phone mockup card */}
            <motion.div
              className="shrink-0 lg:w-[260px]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amortix-emerald/20">
                    <Smartphone className="h-5 w-5 text-amortix-emerald-light" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Amortix</p>
                    <p className="text-[11px] text-white/40">v1.0.0 · Android APK</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Size", value: "~82 MB" },
                    { label: "Requires", value: "Android 6.0+" },
                    { label: "License", value: "Free" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-white/40">{label}</span>
                      <span className="text-xs font-medium text-white/80">{value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={GITHUB_RELEASE_URL}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amortix-emerald/20 py-2.5 text-xs font-semibold text-amortix-emerald-light transition hover:bg-amortix-emerald/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .apk
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
