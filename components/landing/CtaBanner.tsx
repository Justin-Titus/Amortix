"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function CtaBanner() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="relative overflow-hidden rounded-4xl bg-amortix-navy px-6 py-12 text-white shadow-[0_24px_80px_rgba(15,27,45,0.24)] sm:px-10 sm:py-14 lg:px-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <p className="section-label text-white/50">Ready when you are</p>
            <h2 className="section-heading mt-2.5 text-white md:text-5xl">Build a calmer loan workflow in minutes.</h2>
            <p className="body-text mt-4 max-w-2xl text-white/70">
              Add your loans, compare the payoff math, and use the AI advisor when you want a second opinion. The platform is built to feel precise instead of noisy.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {user ? (
                <Link href="/dashboard" className="btn-primary">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary">
                    Create your account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
