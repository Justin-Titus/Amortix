import { Suspense } from "react";
import ChatAssistant from "@/components/ai/ChatAssistant";
import { getLoans } from "@/app/actions/loan";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "AI Advisor",
  description: "Chat with Amortix AI to get personalized repayment advice.",
};

type ChatSearchParams = {
  prompt?: string | string[];
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<ChatSearchParams>;
}) {
  const [params, loans] = await Promise.all([searchParams, getLoans()]);
  const selectedPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;
  const activeLoans = loans.filter((loan) => loan.outstandingBalance > 0);

  // Build dynamic context-aware quick prompts on first paint
  const quickPrompts: string[] = [];
  if (activeLoans.length > 0) {
    const sortedByInterest = [...activeLoans].sort((a, b) => b.interestRate - a.interestRate);
    const sortedByBalance = [...activeLoans].sort((a, b) => a.outstandingBalance - b.outstandingBalance);

    quickPrompts.push(
      `Should I target my ${sortedByInterest[0].name} (${sortedByInterest[0].interestRate}% interest) first?`
    );

    if (activeLoans.length > 1) {
      quickPrompts.push(
        `Compare Avalanche vs Snowball strategy for my ${activeLoans.length} active loans.`
      );
    }

    if (sortedByBalance[0] && sortedByBalance[0].name !== sortedByInterest[0]?.name) {
      quickPrompts.push(
        `What happens if I pay off my ${sortedByBalance[0].name} loan first for a quick win?`
      );
    }

    quickPrompts.push("How much interest will I save if I pay an extra ₹5000 per month?");
  } else {
    quickPrompts.push(
      "What repayment strategy should I use right now?",
      "What is the difference between Debt Avalanche and Debt Snowball?",
      "How does extra payment speed up loan repayment?"
    );
  }

  return (
    <div className="animate-fade-up mx-auto max-w-5xl h-full flex flex-col space-y-4">
      {activeLoans.length === 0 && (
        <div className="rounded-2xl border border-amortix-border-light bg-white">
          <EmptyState
            variant="compact"
            title="Add a loan before asking strategy questions"
            description="The AI advisor uses your active loan data for personalized recommendations. Add your first loan to get context-aware guidance."
            action={{ label: "Add your first loan", href: "/loans/add" }}
          />
        </div>
      )}
      <ChatAssistant initialInput={selectedPrompt} contextPrompts={quickPrompts} />
    </div>
  );
}
