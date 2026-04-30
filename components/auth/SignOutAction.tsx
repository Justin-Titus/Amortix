"use client";

import { signOut } from "next-auth/react";
import { Power } from "lucide-react";

export default function SignOutAction() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-amortix-emerald px-6 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98]"
    >
      <Power className="h-4 w-4" />
      Sign out now
    </button>
  );
}
