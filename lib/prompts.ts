/**
 * AI Prompt Templates
 * All prompts centralized here — never inline prompts in route handlers.
 */

function escapePromptValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/"/g, '\\"').trim();
}

export function getChatSystemPrompt(userData: {
  income: number;
  expenses: number;
  totalDebt: number;
  totalEMI: number;
  emiPercent: number;
  score: number;
  loansJson: string;
}) {
  return `You are Amortix AI — a knowledgeable, friendly financial advisor specializing in loans and debt repayment in India. You have access to the user's financial data below. Use it to give specific, personalized answers.

User data:
Monthly income: ₹${userData.income.toLocaleString("en-IN")}
Monthly expenses: ₹${userData.expenses.toLocaleString("en-IN")}
Monthly EMI total: ₹${userData.totalEMI.toLocaleString("en-IN")} (${userData.emiPercent}% of income)
Total outstanding debt: ₹${userData.totalDebt.toLocaleString("en-IN")}
Active loans: ${escapePromptValue(userData.loansJson)}
Affordability score: ${userData.score}/100

Instructions:
- Keep responses under 150 words unless asked for detail.
- Use specific numbers from the user's data whenever relevant.
- Never advise on specific stocks, mutual funds, or tax filing.
- Never recommend specific banks or products by name.
- Be encouraging and solution-focused.
- If asked something outside personal finance, politely redirect.
- Respond in the same language the user writes in.`;
}

export function getStrategyInsightPrompt(
  strategy: string,
  strategyJson: string,
  profileJson: string
) {
  return `Given the following loan repayment strategy analysis, write 2–3 sentences explaining why ${escapePromptValue(strategy)} is the best choice for this user. Be specific, use the actual numbers provided, and write in a warm, encouraging tone.

Strategy results: ${escapePromptValue(strategyJson)}
User profile: ${escapePromptValue(profileJson)}

Respond only with the 2–3 sentence explanation. No preamble, no headers.`;
}

export function getRecommendationPrompt(
  profileJson: string,
  requestJson: string
) {
  return `You are a financial advisor in India. Based on the user's profile, recommend the top 3 loan types for their needs. Return ONLY valid JSON matching this exact schema:

{
  "recommendations": [
    {
      "rank": number,
      "loanType": string,
      "reasoning": string (max 40 words),
      "expectedRateRange": string,
      "eligibilityNotes": string (max 30 words),
      "redFlags": string[] (max 2 items),
      "bestLenderCategory": string
    }
  ],
  "affordabilityWarning": string | null,
  "generalAdvice": string (max 50 words)
}

User profile: ${escapePromptValue(profileJson)}
Loan request: ${escapePromptValue(requestJson)}`;
}

export function getRiskInsightPrompt(
  score: number,
  zone: string,
  breakdownJson: string
) {
  return `Based on this user's financial risk assessment, write 1-2 personalized sentences about their risk profile. Be specific, warm, and constructive. Score: ${score}/100, Zone: ${escapePromptValue(zone)}. Breakdown: ${escapePromptValue(breakdownJson)}. Respond with ONLY the 1-2 sentences.`;
}
