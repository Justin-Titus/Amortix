import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const publicRoutes = ["", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = env.APP_URL.replace(/\/+$/g, "");

  return publicRoutes.map((route) => ({
    url: route === "" ? `${base}/` : `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
