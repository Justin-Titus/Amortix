"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncUserWithPrisma } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

// Create a stable supabase client reference at module scope for the client component
const supabase = createClient();

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing your login...");

  useEffect(() => {
    async function handleAuth() {
      try {
        // Read the hash parameters (Google returns these client-side)
        const hash = window.location.hash;
        if (!hash) {
          setStatus("No authentication information found.");
          setTimeout(() => router.push("/login"), 1500);
          return;
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const idToken = params.get("id_token");

        if (!idToken) {
          setStatus("Google authentication token was missing.");
          setTimeout(() => router.push("/login"), 1500);
          return;
        }

        let nonce: string | undefined = undefined;
        let next: string = "/dashboard";

        const isSafeRedirect = (url?: string) => {
          if (!url) return false;
          // Reject protocol-relative URLs
          if (url.startsWith("//")) return false;
          // Allow relative paths (e.g. /dashboard, /loans/123)
          if (url.startsWith("/")) return true;
          try {
            const parsed = new URL(url, window.location.origin);
            return parsed.origin === window.location.origin;
          } catch (_) {
            return false;
          }
        };

        if (typeof window !== "undefined") {
          const storedNonce = sessionStorage.getItem("google_oauth_nonce");
          if (storedNonce) nonce = storedNonce;
          sessionStorage.removeItem("google_oauth_nonce");

          const storedNext = sessionStorage.getItem("google_oauth_next");
          if (storedNext && isSafeRedirect(storedNext)) {
            next = storedNext;
          }
          sessionStorage.removeItem("google_oauth_next");
        }

        setStatus("Authenticating session with Supabase...");
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
          nonce: nonce,
        });

        if (error) {
          console.error("Supabase ID Token auth failed:", error);
          setStatus(`Authentication failed: ${error.message}`);
          setTimeout(() => router.push("/login?error=auth_failed"), 2000);
          return;
        }

        if (data?.user) {
          // Ensure we have an email before proceeding
          const email = data.user.email;
          if (!email) {
            console.error("Google OAuth: provider did not return an email for user", { userId: data.user.id });
            setStatus("Authentication succeeded but no email was provided by Google.");
            setTimeout(() => router.push("/login?error=no_email"), 2000);
            return;
          }

          setStatus("Syncing user with our system...");
          try {
            await syncUserWithPrisma({
              id: data.user.id,
              email: email,
              name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? undefined,
            });
          } catch (syncErr) {
            console.error("Failed to sync user with Prisma:", syncErr);
            // Allow user to proceed even if sync fails; surface a friendly message
            setStatus("Signed in, but we encountered a temporary issue finalizing your account.");
          }

          setStatus("Sign-in complete. Redirecting...");
          router.push(next);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error during Google callback handling:", err);
        setStatus("An unexpected error occurred during sign-in.");
        setTimeout(() => router.push("/login"), 2000);
      }
    }

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white antialiased select-none">
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md p-8 border border-white/10 rounded-3xl bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute animate-ping h-full w-full rounded-full bg-blue-500/20 opacity-75"></div>
          <div className="relative rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 animate-spin"></div>
        </div>
        
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text">
            Amortix Authentication
          </h1>
          <p className="text-sm font-medium text-slate-400">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
