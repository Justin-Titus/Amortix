import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Primary navigation">
        <Link href="/" className="flex items-center gap-3 text-sm font-medium text-amortix-navy">
          <span className="flex h-11 w-11 items-center justify-center" aria-hidden="true">
            <Image src="/Amortix.png" alt="Amortix logo" className="h-full w-full object-cover" width={44} height={44} />
          </span>
          <span>
            <p className="text-base font-semibold">Amortix</p>
            <p className="text-xs text-amortix-slate">Turn debt into a deadline</p>
          </span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex" role="list">
          {[
            { label: "Features", href: "#features" },
            { label: "Calculator", href: "#calculator" },
            { label: "How it works", href: "#how-it-works" },
          ].map((link) => (
            <li key={link.label}>
              <a href={link.href} className="text-sm font-medium text-amortix-slate transition hover:text-amortix-navy">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-amortix-navy transition hover:text-amortix-emerald md:inline-flex">
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-amortix-emerald px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
