import { z } from "zod";

const optionalText = z.union([z.string().trim().min(1), z.literal("")]).transform((value) => {
  return value === "" ? undefined : value;
});

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required."),
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().min(1, "NEXT_PUBLIC_SUPABASE_URL is required."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required."),
  GMAIL_USER: optionalText.optional(),
  GMAIL_APP_PASSWORD: optionalText.optional(),
  NEXT_PUBLIC_APP_URL: optionalText.optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  DATABASE_URL: parsedEnv.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: parsedEnv.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: parsedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GMAIL_USER: parsedEnv.GMAIL_USER,
  GMAIL_APP_PASSWORD: parsedEnv.GMAIL_APP_PASSWORD,
  NEXT_PUBLIC_APP_URL: parsedEnv.NEXT_PUBLIC_APP_URL,
  APP_URL:
    parsedEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;