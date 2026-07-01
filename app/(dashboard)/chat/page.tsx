import ChatAssistant from "@/components/ai/ChatAssistant";
import { BrainCircuit, MessageSquareText, Sparkles, ShieldCheck } from "lucide-react";
import { PageBadge } from "@/components/ui/PageBadge";
import { getLoans } from "@/app/actions/loan";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export const metadata = {
  title: "AI Advisor ",
  description: "Chat with Amortix AI to get personalized repayment advice.",
};

type ChatSearchParams = {
  prompt?: string | string[];
};

export default async function ChatPage({ searchParams }: { searchParams: Promise<ChatSearchParams> }) {
  const params = await searchParams;
  const loans = await getLoans();
  const activeLoans = loans.filter((loan) => loan.outstandingBalance > 0);
  const selectedPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;

  const quickPrompts = [
    "What repayment strategy should I use right now?",
    "How much interest can I save with an extra monthly payment?",
    "Which of my loans is most urgent to target?",
  ];

  return (
    <div className="animate-fade-up grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="glass-panel space-y-4 p-5">
          <PageBadge icon={Sparkles} label="AI advisor" />
          <div>
            <h1 className="text-[24px] font-heading font-medium text-(--color-navy) leading-tight">
              AI Financial Advisor
            </h1>
            <p className="mt-2 text-sm leading-7 text-(--color-slate)">
              Ask questions about debt, strategy, extra payments, or payoff timing. The advisor reads your current loan profile first.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex h-full flex-col gap-2 rounded-card border border-(--color-border) bg-(--color-frost) p-3">
              <div className="flex items-center gap-2 text-(--color-navy)">
                <BrainCircuit className="h-4 w-4 text-(--color-emerald)" />
                Context aware
              </div>
              <p className="text-xs text-(--color-slate)">Uses your live loans and balances.</p>
            </div>
            <div className="flex h-full flex-col gap-2 rounded-card border border-(--color-border) bg-(--color-frost) p-3">
              <div className="flex items-center gap-2 text-(--color-navy)">
                <ShieldCheck className="h-4 w-4 text-(--color-amber)" />
                Guardrails
              </div>
              <p className="text-xs text-(--color-slate)">Advice stays focused on debt management.</p>
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-(--color-navy)">
            <MessageSquareText className="h-4 w-4 text-(--color-emerald)" />
            Quick prompts
          </div>
          <div className="space-y-2">
            {quickPrompts.map((prompt) => (
              <Link
                key={prompt}
                href={`/chat?prompt=${encodeURIComponent(prompt)}`}
                className="block rounded-card border border-(--color-border) bg-white p-3 text-xs leading-relaxed text-(--color-slate) transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <div>
        {activeLoans.length === 0 ? (
          <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white">
            <EmptyState
              variant="compact"
              title="Add a loan before asking strategy questions"
              description="The AI advisor uses your active loan data for personalized recommendations. Add your first loan to get context-aware guidance."
              action={{ label: "Add your first loan", href: "/loans/add" }}
            />
          </div>
        ) : null}
        <div className="glass-panel mb-4 hidden items-center justify-between px-4 py-3 text-xs text-(--color-slate) lg:flex">
          <span>Composer stays pinned below while messages scroll independently.</span>
          <span className="flex items-center gap-2 text-(--color-emerald)">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-(--color-emerald)" aria-hidden="true" />
              <span className="text-[11px] font-medium text-(--color-emerald)">Online</span>
            </span>
          </span>
        </div>
        <ChatAssistant key={selectedPrompt ?? "default"} initialInput={selectedPrompt} />
      </div>
    </div>
  );
}
