"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BotMessageSquare } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAutoSync } from "@/hooks/useAutoSync";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useAutoSync(5000); // Poll every 5 seconds

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    if (!mobileOpen) {
      return;
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DashboardSidebar />
      <DashboardHeader onMenuToggle={() => setMobileOpen((prev) => !prev)} isMenuOpen={mobileOpen} />

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          className={`absolute inset-0 bg-amortix-navy-deep/55 transition-opacity ${reduce ? "duration-0" : "duration-150"} ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
        <div
          id="mobile-dashboard-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
          className={`relative h-full w-fit transform-gpu will-change-transform transition-transform ${
            reduce ? "duration-0" : "duration-200"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <DashboardSidebar mobile onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <main className="relative pt-14 lg:pl-60 lg:pt-14">
        <section
          ref={contentRef}
          className={`h-[calc(100vh-56px)] overflow-y-auto ${
            pathname === "/chat"
              ? "p-2 lg:p-4"
              : "px-3 pb-24 pt-5 sm:px-5 sm:pb-24 md:px-6 md:pb-20 lg:px-7 lg:pb-10"
          }`}
        >
          <div className="mx-auto max-w-355 w-full h-full">{children}</div>
        </section>
      </main>

      <div className="hidden lg:block">
        {pathname === "/dashboard" ? (
          <div className="pointer-events-none fixed bottom-6 right-6 z-50">
            <motion.div
              initial={reduce ? false : { scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border border-amortix-emerald"
            />
            <Link
              href="/chat"
              className="group pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-amortix-emerald text-white shadow-[0_20px_36px_rgba(17,140,118,0.3)]"
              aria-label="Open AI chat"
            >
              <span className="pointer-events-none absolute right-full bottom-1/2 mr-3 hidden translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg opacity-0 transition-all duration-200 ease-out group-hover:inline-flex group-hover:opacity-100 group-hover:translate-x-0">
                Amortix AI
              </span>
              <BotMessageSquare className="h-5 w-5" />
            </Link>
          </div>
        ) : null}
      </div>

      <MobileBottomNav />
    </div>
  );
}
