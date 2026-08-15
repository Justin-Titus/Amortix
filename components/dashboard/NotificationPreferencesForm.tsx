"use client";

import { useTransition, useState, useEffect } from "react";
import { updateUserSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { recordLocalUpdate } from "@/hooks/useAutoSync";

export function NotificationPreferencesForm({
  emailNotifications,
  pushNotifications,
}: {
  emailNotifications: boolean;
  pushNotifications: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [localEmail, setLocalEmail] = useState(emailNotifications);
  const [localPush, setLocalPush] = useState(pushNotifications);

  // Sync with server state if it updates externally
  useEffect(() => setLocalEmail(emailNotifications), [emailNotifications]);
  useEffect(() => setLocalPush(pushNotifications), [pushNotifications]);

  const handleToggle = (type: "email" | "push", checked: boolean) => {
    recordLocalUpdate();
    // Optimistic UI update
    if (type === "email") setLocalEmail(checked);
    if (type === "push") setLocalPush(checked);

    startTransition(async () => {
      try {
        const payload = type === "email" 
          ? { emailNotifications: checked }
          : { pushNotifications: checked };
          
        const result = await updateUserSettings(payload);
        if (result.error) {
          toast.error(result.error);
          // Revert optimistic update on error
          if (type === "email") setLocalEmail(emailNotifications);
          if (type === "push") setLocalPush(pushNotifications);
        } else {
          toast.success("Preferences updated.");
        }
      } catch (error: any) {
        toast.error(error.message);
        // Revert optimistic update on error
        if (type === "email") setLocalEmail(emailNotifications);
        if (type === "push") setLocalPush(pushNotifications);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#0D1F3C]">Email Notifications</p>
          <p className="text-[11px] text-slate-400">Receive EMI reminders and alerts via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={localEmail}
            onChange={(e) => handleToggle("email", e.target.checked)}
            disabled={isPending}
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-50"></div>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#0D1F3C]">Push Notifications</p>
          <p className="text-[11px] text-slate-400">Receive mobile and in-app push notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={localPush}
            onChange={(e) => handleToggle("push", e.target.checked)}
            disabled={isPending}
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 disabled:opacity-50"></div>
        </label>
      </div>
    </div>
  );
}
