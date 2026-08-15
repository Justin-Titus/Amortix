"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Smartphone } from "lucide-react";
import { mainNavItems, toolsNavItems, type NavItem } from "@/components/layout/navigation";

import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

type DashboardSidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

function SidebarNavItem({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group relative mx-2 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-150 ${
        active
          ? "bg-[#1E3A5F] font-medium text-slate-200"
          : "text-slate-400 hover:bg-[#1E3A5F]/60 hover:text-slate-300"
      }`}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-emerald-500" />
      ) : null}
      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${active ? "text-emerald-300" : "text-slate-400 group-hover:text-emerald-300"}`}>
        <item.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.label}</span>
      </div>
      {item.showDot ? <span className="h-2 w-2 rounded-full bg-amortix-emerald shadow-[0_0_14px_rgba(77,224,179,0.7)]" /> : null}
    </Link>
  );
}

export default function DashboardSidebar({ mobile = false, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  const containerClass = mobile
    ? "h-full w-[min(86vw,260px)]"
    : "fixed left-0 top-0 hidden h-screen w-[240px] lg:flex";

  return (
    <aside className={`${containerClass} z-50 p-2.5 lg:p-3`}>
      <div className="sidebar-surface flex h-full flex-col overflow-hidden px-3 py-3">
        <div className="flex items-center gap-3 border-b border-white/8 pb-4">
          <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <div
                className="h-full w-full"
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
            <div>
              <span className="block font-heading text-lg font-medium text-slate-100">Amortix<span className="text-amortix-emerald-light">.</span></span>
              <span className="block text-[11px] tracking-[0.04em] text-slate-400">Debt operations</span>
            </div>
          </Link>
        </div>

        <WorkspaceSwitcher />

        <div className="flex-1 overflow-y-auto py-5">
          <p className="mb-2 px-3 text-[11px] tracking-[0.04em] text-slate-500">Main</p>
          <nav className="space-y-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return <SidebarNavItem key={`${item.label}-${item.href}`} item={item} active={isActive} onNavigate={onNavigate} />;
            })}
          </nav>

          <div className="my-5 h-px bg-white/8" />

          <p className="mb-2 px-3 text-[11px] tracking-[0.04em] text-slate-500">Tools</p>
          <nav className="space-y-2">
            {toolsNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return <SidebarNavItem key={`${item.label}-${item.href}`} item={item} active={isActive} onNavigate={onNavigate} />;
            })}
          </nav>
        </div>

        <div className="mt-auto pt-4 pb-2">
          <div className="mx-4 h-px bg-white/8 mb-4" />
          <a
            id="sidebar-download-apk"
            href="https://github.com/Justin-Titus/AmortixMobile/releases/latest/download/Amortix.apk"
            className="group relative mx-2 flex min-h-11 items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-[13px] text-slate-300 transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
            title="Download Amortix for Android"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-400/80 group-hover:text-emerald-300">
              <Download className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate font-medium">Android App</span>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
}
