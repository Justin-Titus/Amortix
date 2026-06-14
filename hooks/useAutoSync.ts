"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAutoSync(intervalMs = 5000) {
  const router = useRouter();
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingToast, setPendingToast] = useState<{message: string, description: string} | null>(null);

  useEffect(() => {
    if (!isPending && pendingToast) {
      toast.success(pendingToast.message, {
        description: pendingToast.description,
        duration: 3000,
      });
      setPendingToast(null);
    }
  }, [isPending, pendingToast]);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Don't poll if document is hidden to save resources
      if (document.hidden) return;

      try {
        const res = await fetch("/api/sync-state");
        if (res.ok) {
          const data = await res.json();
          const serverTime = new Date(data.lastUpdated).getTime();
          const updateType = data.type;
          
          if (lastSync === null) {
            // First load: establish baseline
            setLastSync(serverTime);
          } else if (serverTime > lastSync) {
            setLastSync(serverTime);
            
            let message = "Data synced automatically";
            let description = "The dashboard has been updated with the latest changes.";
            
            if (updateType === 'payment') {
              message = "Payment recorded";
              description = "A new payment has been synced to your dashboard.";
            } else if (updateType === 'loan') {
              message = "Loan details updated";
              description = "Your loan information has been updated.";
            } else if (updateType === 'profile') {
              message = "Profile updated";
              description = "Your profile settings have been synced.";
            }
            
            setPendingToast({ message, description });
            
            startTransition(() => {
              router.refresh();
            });
          }
        }
      } catch (e) {
        console.error("AutoSync error:", e);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [lastSync, router, intervalMs]);
}
