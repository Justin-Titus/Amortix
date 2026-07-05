import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.number().positive("Payment amount must be a positive number"),
  paymentDate: z.coerce.date(),
  type: z.enum(["EMI", "PREPAYMENT"]),
  notes: z.string().trim().max(500, "Notes must be less than 500 characters").optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
