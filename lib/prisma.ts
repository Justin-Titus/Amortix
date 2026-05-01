import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      max: 1, // Restrict connection pool to exactly 1 connection per serverless function instance to prevent exhaustion on Supabase
      connectionTimeoutMillis: 10000, // Timeout after 10 seconds of trying to connect
      idleTimeoutMillis: 10000, // Close idle connections after 10 seconds to free them up
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
