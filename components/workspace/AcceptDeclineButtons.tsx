"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvite, declineInvite } from "@/app/actions/workspace";

interface AcceptDeclineButtonsProps {
  inviteId: string;
}

export default function AcceptDeclineButtons({ inviteId }: AcceptDeclineButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      const res = await acceptInvite(inviteId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.workspaceId) {
        toast.success("Joined workspace successfully!");
        router.push(`/workspace/${res.workspaceId}`);
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      const res = await declineInvite(inviteId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Invitation declined.");
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
      <button
        onClick={handleDecline}
        disabled={isPending}
        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
      >
        Decline
      </button>
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer"
      >
        {isPending ? "Accepting..." : "Accept Invitation"}
      </button>
    </div>
  );
}
