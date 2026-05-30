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
      connectionTimeoutMillis: 30000, // Timeout after 30 seconds of trying to connect (allows free databases to wake up)
      idleTimeoutMillis: 10000, // Close idle connections after 10 seconds to free them up
      ssl: { rejectUnauthorized: false }, // Prevent 'self-signed certificate in certificate chain' error
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
