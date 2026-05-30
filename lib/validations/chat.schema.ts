import { z } from "zod";

const chatMessageSchema = z
  .object({
    id: z.string().min(1).optional(),
    role: z.string().min(1),
    content: z.string().trim().min(1).optional(),
    parts: z.array(z.any()).optional(),
  })
  .passthrough()
  .refine(
    (data) => !!data.content || (data.parts && data.parts.length > 0),
    { message: "Message must have either content or parts" }
  );

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100),
});

