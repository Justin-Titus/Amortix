"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function OAuthButtons({ callbackUrl }: { callbackUrl?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const supabase = createClient();

  // Generate a cryptographically secure nonce for OAuth flows
  const generateSecureNonce = (length = 16) => {
    const arr = new Uint8Array(length);
    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else {
      // Fallback: use Math.random for non-browser or older environments (very unlikely in client component)
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleOAuth = async (provider: "google") => {
    setLoadingProvider(provider);
    try {
      if (provider === "google") {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
          alert("Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env file.");
          return;
        }

        const redirectUri = `${window.location.origin}/auth/callback/google`;
        const rawNonce = generateSecureNonce(16);
        
        // Hash rawNonce with SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(rawNonce);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        // Use sessionStorage to pass raw nonce and next target URL safely
        if (typeof window !== "undefined") {
          sessionStorage.setItem("google_oauth_nonce", rawNonce);
          sessionStorage.setItem("google_oauth_next", callbackUrl || "/dashboard");
        }

        const state = callbackUrl ? encodeURIComponent(callbackUrl) : "";

        // Standard Google OAuth 2.0 endpoint for client-side ID Token Implicit Flow
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${hashedNonce}${
          state ? `&state=${state}` : ""
        }`;

        if (process.env.NODE_ENV !== "production") {
          console.debug("Constructed Redirect URI:", redirectUri);
          console.debug("Full Google Auth URL:", googleAuthUrl);
        }

        window.location.href = googleAuthUrl;
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback${callbackUrl ? `?next=${encodeURIComponent(callbackUrl)}` : ''}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("OAuth sign-in failed:", error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        onClick={() => handleOAuth("google")}
        disabled={!!loadingProvider}
        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        id="oauth-google-btn"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loadingProvider === "google" ? "..." : "Google"}
      </button>
    </div>
  );
}
