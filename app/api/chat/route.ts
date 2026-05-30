import { convertToModelMessages, type UIMessage } from "ai";
import { streamAIChat } from "@/lib/ai";
import { formatCurrency } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { logInfo, logWarn, reportError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatRequestSchema } from "@/lib/validations/chat.schema";

type ChatLoan = {
  name: string;
  loanType: string;
  outstandingBalance: number;
  emiAmount: number;
  interestRate: number;
  rateType: "FIXED" | "FLOATING";
  currency: string;
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
  const currencyCode = financialProfile?.currency ?? "INR";

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
            loan.outstandingBalance,
            loan.currency ?? currencyCode
          )}, EMI ${formatCurrency(loan.emiAmount, loan.currency ?? currencyCode)}, Interest ${loan.interestRate}% (${loan.rateType})`
      )
      .join("\n");

    contextParts.push(
      `Loans: ${loans.length} active loans. Total Outstanding Debt ${formatCurrency(
        totalOutstanding,
        currencyCode
      )}. Total Monthly EMI ${formatCurrency(totalEMI, currencyCode)}.`,
      `Loan Details:\n${loansText}`
    );
  }

  if (!financialProfile) {
    contextParts.push("Financial Profile: No financial profile found for this user.");
  } else {
    const monthlySurplus = financialProfile.monthlyIncome - financialProfile.monthlyExpenses;
    contextParts.push(
      `Financial Profile: Monthly Income ${formatCurrency(
        financialProfile.monthlyIncome,
        currencyCode
      )}, Monthly Expenses ${formatCurrency(
        financialProfile.monthlyExpenses,
        currencyCode
      )}, Monthly Surplus ${formatCurrency(monthlySurplus, currencyCode)}, Employment ${
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    const rateLimit = await checkRateLimit(userId, "chat");
    if (!rateLimit.allowed) {
      logWarn("rate_limit_exceeded", {
        userId: userId,
        endpoint: "chat",
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return new Response("Too many chat requests. Please try again later.", { status: 429 });
    }

    const rawBody: unknown = await req.json();

    // Redact or summarize incoming payload for safe logging (never log user message content)
    const redactChatPayload = (body: unknown) => {
      try {
        if (Array.isArray(body)) {
          return { messages: body.map((m) => ({ role: (m as any).role, hasContent: !!(m as any).content })) };
        }
        if (body && typeof body === "object") {
          const b: any = body as any;
          return { messages: b.messages ? b.messages.map((m: any) => ({ role: m.role, hasContent: !!m.content })) : undefined };
        }
        return {};
      } catch (e) {
        return {};
      }
    };

    // Log non-sensitive metadata about the request
    logInfo("incoming_chat_payload", { userId, meta: redactChatPayload(rawBody) });

    // Use safeParse to avoid Zod throwing and returning a 500
    const safeParseResult = Array.isArray(rawBody)
      ? chatRequestSchema.safeParse({ messages: rawBody })
      : chatRequestSchema.safeParse(rawBody);

    if (!safeParseResult.success) {
      // Return 400 Bad Request with validation errors
      return new Response(JSON.stringify({ errors: safeParseResult.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsedBody = safeParseResult.data;
    const messages = parsedBody.messages;

    const financialContext = await buildFinancialContext(userId);

    const uiMessagesWithoutIds = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
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
