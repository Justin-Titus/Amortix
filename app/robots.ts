import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.APP_URL.replace(/\/+$/g, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/chat", "/analysis", "/calendar", "/loans", "/profile", "/strategy", "/api", "/signout"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: env.APP_URL,
  };
}
