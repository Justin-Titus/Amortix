import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import SignOutAction from "@/components/auth/SignOutAction";

export const metadata = {
  title: "Sign out ",
  description: "Confirm sign out and safely end your Amortix session.",
};

export default function SignOutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.85fr]">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Secure sign out
            </div>

            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-12 w-12"
                  style={{
                    backgroundColor: "#00bc7d",
                    maskImage: "url(/Amortix.png)",
                    WebkitMaskImage: "url(/Amortix.png)",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
              </div>
              <div className="max-w-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Amortix</p>
                <h1 className="mt-3 text-4xl font-heading font-semibold text-white">Ready to leave your workspace?</h1>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Signing out ends your current session on this device. Your loan data, strategies, and profile remain securely saved in your account.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-4xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-white">What happens next</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-400">
                  <li>• You will be redirected to the login page.</li>
                  <li>• Your loans and preferences stay stored securely.</li>
                  <li>• You can resume from any device later.</li>
                </ul>
              </div>
              <div className="rounded-4xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-white">Need to stay signed in?</p>
                <p className="mt-3 text-sm text-slate-400">
                  Keep working with your financial dashboard, view loan models, and continue your repayment planning.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-amortix-emerald/30 bg-amortix-emerald/10 px-5 py-3 text-sm font-semibold text-amortix-emerald transition hover:bg-amortix-emerald/20"
                >
                  Return to dashboard
                </Link>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sign out action</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Finish securely</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                <ArrowLeft className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <p className="text-sm leading-7 text-slate-300">
                Use the button below to confirm your sign-out. This will safely end your current session and bring you back to the login screen.
              </p>

              <SignOutAction />

              <p className="text-[13px] leading-6 text-slate-500">
                If you signed out by mistake, tap “Return to dashboard” and continue reviewing your loans and strategy options.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
