import Image from "next/image";
import Link from "next/link";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
};

export default function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-amortix-emerald/14 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-amortix-amber/14 blur-3xl" />

      <aside className="relative hidden p-6 lg:flex lg:items-stretch">
        <div className="dark-panel relative flex w-full flex-col justify-between overflow-hidden p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,159,58,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(77,224,179,0.18),transparent_34%)]" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 overflow-hidden">
                <Image src="/Amortix.png" alt="Amortix logo" width={48} height={48} className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="block font-heading text-2xl font-medium">Amortix</span>
                <span className="block text-xs uppercase tracking-[0.24em] text-slate-200">Financial operating system</span>
              </div>
            </Link>

            <div className="mt-18 max-w-lg space-y-8">
              <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-100">
                Designed for focused repayment
              </div>
              <div className="space-y-5">
                <h2 className="font-heading text-[42px] leading-[1.05] text-white">
                  A calmer, more
                  <span className="block text-amortix-emerald-light">intentional debt workspace.</span>
                </h2>
                <p className="max-w-md text-base leading-8 text-slate-200">
                  Track balances, model strategy, and get guided next moves inside a dashboard that feels more like a cockpit than a calculator.
                </p>
              </div>

              <div className="grid gap-4 text-sm text-slate-200">
                {[
                  "Live payoff simulations with instant visual feedback",
                  "AI guidance grounded in your current loan profile",
                  "Affordability signals before you overextend",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amortix-emerald shadow-[0_0_16px_rgba(77,224,179,0.6)]" />
                    <span className="leading-6">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <p className="font-heading text-7xl leading-none text-white/8">Amortix</p>
            <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-right text-xs text-slate-200">
              <p className="uppercase tracking-[0.2em]">Promise</p>
              <p className="mt-1 text-sm text-white">Less noise. Better decisions.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-[520px]">{children}</div>
      </main>
    </div>
  );
}
