"use client";

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
            <p className="font-semibold text-amortix-navy">Amortix</p>
            <p className="text-xs text-amortix-slate">Debt management with cleaner structure.</p>
          </div>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-xs tracking-[0.18em] text-amortix-slate">
          <Link href="#features" className="hover:text-amortix-navy">
            Loan comparison
          </Link>
          <Link href="#calculator" className="hover:text-amortix-navy">
            See your savings
          </Link>
          <Link href="/register" className="hover:text-amortix-navy">
            Get started free
          </Link>
        </nav>

        <p className="text-xs text-amortix-text-muted">© {new Date().getFullYear()} Amortix. All rights reserved.</p>
      </div>
    </footer>
  );
}
