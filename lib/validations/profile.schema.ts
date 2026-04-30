import { z } from "zod";

export const financialProfileSchema = z.object({
  monthlyIncome: z
    .number()
    .positive("Monthly income must be a positive number")
    .max(100000000, "Amount seems too large"),
  monthlyExpenses: z
    .number()
    .min(0, "Monthly expenses cannot be negative")
    .max(100000000, "Amount seems too large"),
  creditScoreRange: z.enum([
    "below 650",
    "650-700",
    "700-750",
    "750-800",
    "800+",
  ]),
  employmentType: z.enum([
    "SALARIED",
    "SELF_EMPLOYED",
    "STUDENT",
    "BUSINESS_OWNER",
    "OTHER",
  ]),
  hasEmergencyFund: z.boolean(),
  emergencyFundMonths: z.number().int().min(0).max(120).default(0),
});

export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
