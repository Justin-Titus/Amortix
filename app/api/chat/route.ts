import { type ModelMessage, type UIMessage } from "ai";
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

    const sortedByInterest = [...loans].sort((a, b) => b.interestRate - a.interestRate);
    const sortedByBalance = [...loans].sort((a, b) => a.outstandingBalance - b.outstandingBalance);

    const loansText = loans
      .map(
        (loan: ChatLoan) =>
          `- "${loan.name}" (${loan.loanType}): Balance ${formatCurrency(
            loan.outstandingBalance,
            loan.currency ?? currencyCode
          )}, Monthly EMI ${formatCurrency(loan.emiAmount, loan.currency ?? currencyCode)}, Interest ${loan.interestRate}% (${loan.rateType})`
      )
      .join("\n");

    contextParts.push(
      `Loans Overview: ${loans.length} active loans. Total Outstanding Debt ${formatCurrency(
        totalOutstanding,
        currencyCode
      )}. Total Monthly EMI ${formatCurrency(totalEMI, currencyCode)}.`,
      `Loan Details:\n${loansText}`,
      `Highest Interest Rate Target (Avalanche Priority): "${sortedByInterest[0].name}" at ${sortedByInterest[0].interestRate}% interest.`,
      `Smallest Principal Target (Snowball Priority): "${sortedByBalance[0].name}" balance ${formatCurrency(sortedByBalance[0].outstandingBalance, currencyCode)}.`
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
      )}, Monthly Surplus ${formatCurrency(monthlySurplus, currencyCode)}, Employment ${financialProfile.employmentType
      }, Credit Score Range ${financialProfile.creditScoreRange}, Emergency Fund ${financialProfile.hasEmergencyFund ? "Yes" : "No"
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
      console.error("Parse failed! rawBody was:", JSON.stringify(rawBody, null, 2));
      // Return 400 Bad Request with validation errors
      return new Response(JSON.stringify({ errors: safeParseResult.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsedBody = safeParseResult.data;
    const rawMessages = parsedBody.messages;

    // Keep only the last 6 messages to prevent hitting LLM token limits (Request Entity Too Large)
    let messages = rawMessages.length > 6 ? rawMessages.slice(-6) : rawMessages;

    // Further protect against huge payloads by truncating content
    messages = messages.map((m: any, index: number) => {
      let contentStr = "";
      if (typeof m.content === "string" && m.content.trim()) {
        contentStr = m.content;
      } else if (Array.isArray(m.parts)) {
        contentStr = m.parts
          .filter((p: any) => p && (p.type === "text" || typeof p.text === "string"))
          .map((p: any) => p.text || "")
          .join("");
      } else if (typeof m.text === "string") {
        contentStr = m.text;
      }

      // Strip any internal thinking blocks from historical messages so the LLM doesn't mimic them
      contentStr = contentStr.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

      const isLatest = index === messages.length - 1;
      const maxLength = isLatest ? 6000 : 1000; // Allow 6000 chars for newest prompt, 1000 for history

      if (contentStr.length > maxLength) {
        contentStr = contentStr.substring(0, maxLength) + "... [truncated]";
      }
      
      return { 
        role: m.role, 
        content: contentStr 
      };
    });

    const financialContext = await buildFinancialContext(userId);

    const modelMessages: ModelMessage[] = messages.map((message: any) => ({
      role: message.role as "user" | "assistant",
      content: String(message.content ?? ""),
    }));

    const systemPrompt = `You are Amortix, a professional AI financial advisor built into the Amortix debt management platform. Your ONLY purpose is to help users understand and accelerate their debt repayment.

The user's verified financial data is provided below. Use it to give specific, personalized advice.

<user_financial_data>
${financialContext}
</user_financial_data>

CRITICAL RULES YOU MUST FOLLOW:
1. DIRECT ANSWER & NO THINKING TAGS: Answer immediately. Never output internal thinking steps, chain-of-thought reasoning, or <think> tags. Output ONLY the final response. Never start with a generic greeting or introduction.
2. FACTUAL ACCURACY: Only reference loans, balances, and rates from the <user_financial_data> block. Never invent data.
3. USE EXACT LOAN NAMES in quotes as they appear in the data.
4. HELPFUL CALCULATIONS: When asked about extra payments, interest savings, or payoff timelines, provide clear numerical estimates first, then link to the [Debt Strategy Planner](/strategy) for exact schedules.
5. DEBT FOCUS ONLY: No investment advice (stocks, crypto). No legal advice.
6. LINK TO TOOLS when relevant:
   - [Debt Strategy Planner](/strategy)
   - [Debt Analysis](/analysis)
   - [My Loans](/loans)
   - [Financial Insights](/insights)
7. RESPONSE FORMAT: Use bullet points and short sections. Be informative and helpful — avoid repeating the user's full loan table unless explicitly asked.
8. APP & OFF-TOPIC QUERIES: If asked about Amortix itself (e.g., "what is Amortix?", "amortix means"), explain that Amortix is an AI-powered debt management platform designed to help users structure repayment strategies, calculate interest savings, and become debt-free faster. For completely unrelated topics (politics, sports, general trivia like "cm of tamilnadu"), reply only: "I'm your Amortix financial advisor — I can only help with debt management and repayment strategies."`;

    return await streamAIChat(modelMessages, systemPrompt);
  } catch (error) {
    reportError(error, { route: "/api/chat", flow: "chat_completion" });
    return new Response("An error occurred while processing your request.", { status: 500 });
  }
}
