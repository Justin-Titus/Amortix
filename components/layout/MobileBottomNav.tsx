"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBottomItems } from "@/components/layout/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-3 sm:pb-3 lg:hidden">
      <ul className="mobile-dock grid h-16 grid-cols-5 gap-1 px-1.5 py-1.5 sm:h-18 sm:px-2 sm:py-2">
        {mobileBottomItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                className={`flex h-full min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium leading-none sm:gap-1 sm:rounded-2xl ${
                  isActive ? "bg-amortix-navy text-white shadow-[0_14px_24px_rgba(13,27,47,0.2)]" : "text-amortix-slate"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
