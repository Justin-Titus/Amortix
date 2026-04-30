import { convertToModelMessages, type UIMessage } from "ai";
import { streamAIChat } from "@/lib/ai";
import { formatCurrency } from "@/lib/calculations/emi";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logWarn, reportError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatRequestSchema } from "@/lib/validations/chat.schema";

type ChatLoan = {
  name: string;
  loanType: string;
  outstandingBalance: number;
  emiAmount: number;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
};

async function buildFinancialContext(userId: string) {
  const [loansResult, financialProfile] = await Promise.all([
    prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.financialProfile.findUnique({
      where: { userId },
    }),
  ]);
  const loans = loansResult as ChatLoan[];

  const contextParts: string[] = [];

  if (!loans.length) {
    contextParts.push("Loans: The user has no active loans registered in the system.");
  } else {
    const totalOutstanding = loans.reduce((sum: number, loan: ChatLoan) => sum + loan.outstandingBalance, 0);
    const totalEMI = loans.reduce((sum: number, loan: ChatLoan) => sum + loan.emiAmount, 0);

    const loansText = loans
      .map(
        (loan: ChatLoan) =>
          `- ${loan.name} (${loan.loanType}): Balance ${formatCurrency(
            loan.outstandingBalance
          )}, EMI ${formatCurrency(loan.emiAmount)}, Interest ${loan.interestRate}% (${loan.rateType})`
      )
      .join("\n");

    contextParts.push(
      `Loans: ${loans.length} active loans. Total Outstanding Debt ${formatCurrency(
        totalOutstanding
      )}. Total Monthly EMI ${formatCurrency(totalEMI)}.`,
      `Loan Details:\n${loansText}`
    );
  }

  if (!financialProfile) {
    contextParts.push("Financial Profile: No financial profile found for this user.");
  } else {
    const monthlySurplus = financialProfile.monthlyIncome - financialProfile.monthlyExpenses;
    contextParts.push(
      `Financial Profile: Monthly Income ${formatCurrency(
        financialProfile.monthlyIncome
      )}, Monthly Expenses ${formatCurrency(
        financialProfile.monthlyExpenses
      )}, Monthly Surplus ${formatCurrency(monthlySurplus)}, Employment ${
        financialProfile.employmentType
      }, Credit Score Range ${financialProfile.creditScoreRange}, Emergency Fund ${
        financialProfile.hasEmergencyFund ? "Yes" : "No"
      } (${financialProfile.emergencyFundMonths} months).`
    );
  }

  return contextParts.join("\n\n");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rateLimit = await checkRateLimit(session.user.id, "chat");
    if (!rateLimit.allowed) {
      logWarn("rate_limit_exceeded", {
        userId: session.user.id,
        endpoint: "chat",
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return new Response("Too many chat requests. Please try again later.", { status: 429 });
    }

    const body = (await req.json()) as { messages?: UIMessage[] };
    const validated = chatRequestSchema.safeParse(body);
    if (!validated.success) {
      return new Response("No chat messages were provided.", { status: 400 });
    }

    const financialContext = await buildFinancialContext(session.user.id);

    const uiMessagesWithoutIds = validated.data.messages.map((message) => {
      const { id, ...messageWithoutId } = message;
      return messageWithoutId;
    });
    const modelMessages = await convertToModelMessages(
      uiMessagesWithoutIds as unknown as Omit<UIMessage, "id">[]
    );

    const systemPrompt = `
You are Amortix, an advanced AI financial advisor specializing in debt management and repayment strategies.
You must be professional, empathetic, and highly analytical.

Here is the current financial context of the user:
${financialContext}

Instructions:
1. Provide actionable advice based on their current loans.
2. Explain the benefits of Avalanche, Snowball, or Hybrid strategies if asked.
3. If they ask about saving money, refer to their specific loan balances and interest rates.
4. Keep your responses concise, structured (use bullet points or bold text), and easy to read.
5. If the user has no loans, encourage them to add loans in the dashboard to get personalized advice.
6. Under no circumstances should you provide investment advice (like stocks or crypto) or legal advice. Stick to debt management.
`;

    return await streamAIChat(modelMessages, systemPrompt);
  } catch (error) {
    reportError(error, { route: "/api/chat", flow: "chat_completion" });
    return new Response("An error occurred while processing your request.", { status: 500 });
  }
}
