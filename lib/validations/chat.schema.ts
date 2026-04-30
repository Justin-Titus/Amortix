import { z } from "zod";

const chatMessageSchema = z
  .object({
    id: z.string().min(1).optional(),
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(8000),
  })
  .passthrough();

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
});
