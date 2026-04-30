import { z } from "zod";

const optionalText = z.union([z.string().trim().min(1), z.literal("")]).transform((value) => {
  return value === "" ? undefined : value;
});

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required."),
  AUTH_SECRET: optionalText.optional(),
  NEXTAUTH_SECRET: optionalText.optional(),
  AUTH_GOOGLE_ID: z.string().trim().min(1, "AUTH_GOOGLE_ID is required."),
  AUTH_GOOGLE_SECRET: z.string().trim().min(1, "AUTH_GOOGLE_SECRET is required."),
  GMAIL_USER: optionalText.optional(),
  GMAIL_APP_PASSWORD: optionalText.optional(),
  AUTH_URL: optionalText.optional(),
  NEXTAUTH_URL: optionalText.optional(),
  NEXT_PUBLIC_APP_URL: optionalText.optional(),
});

const parsedEnv = envSchema.parse(process.env);

const nextAuthSecret = parsedEnv.NEXTAUTH_SECRET ?? parsedEnv.AUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET or AUTH_SECRET is required to initialize authentication.");
}

export const env = {
  DATABASE_URL: parsedEnv.DATABASE_URL,
  NEXTAUTH_SECRET: nextAuthSecret,
  AUTH_GOOGLE_ID: parsedEnv.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: parsedEnv.AUTH_GOOGLE_SECRET,
  GMAIL_USER: parsedEnv.GMAIL_USER,
  GMAIL_APP_PASSWORD: parsedEnv.GMAIL_APP_PASSWORD,
  AUTH_URL: parsedEnv.AUTH_URL,
  NEXTAUTH_URL: parsedEnv.NEXTAUTH_URL,
  NEXT_PUBLIC_APP_URL: parsedEnv.NEXT_PUBLIC_APP_URL,
  APP_URL:
    parsedEnv.NEXT_PUBLIC_APP_URL ?? parsedEnv.AUTH_URL ?? parsedEnv.NEXTAUTH_URL ?? "http://localhost:3000",
} as const;