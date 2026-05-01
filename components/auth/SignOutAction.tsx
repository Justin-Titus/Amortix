"use client";

import { createClient } from "@/lib/supabase/client";
import { Power } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOutAction() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-amortix-emerald px-6 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98]"
    >
      <Power className="h-4 w-4" />
      Sign out now
    </button>
  );
}
