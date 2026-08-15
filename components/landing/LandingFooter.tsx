import Image from "next/image";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-amortix-slate lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3 text-amortix-navy">
          <div className="flex h-9 w-9 items-center justify-center">
            <Image src="/Amortix.png" alt="Amortix logo" className="h-full w-full object-cover" width={36} height={36} />
          </div>
          <div>
            <p className="font-semibold text-amortix-navy">Amortix<span className="text-amortix-emerald">.</span></p>
            <p className="text-xs text-amortix-slate">Debt management with cleaner structure.</p>
          </div>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-xs tracking-[0.18em] text-amortix-slate">
          <Link href="/privacy" className="hover:text-amortix-navy">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-amortix-navy">
            Terms of service
          </Link>
          <Link href="/data-rights" className="hover:text-amortix-navy">
            Data rights
          </Link>
        </nav>

        <div className="flex flex-col items-start lg:items-end gap-1">
          <p className="text-xs text-amortix-text-muted">© {new Date().getFullYear()} Amortix<span className="text-amortix-emerald">.</span> All rights reserved.</p>
          <p className="text-[11px] text-slate-400">Grievance Officer: <a href="mailto:amortix.admin@gmail.com" className="hover:underline text-amortix-slate">amortix.admin@gmail.com</a></p>
        </div>
      </div>
    </footer>
  );
}
