import type { MetadataRoute } from "next";
import { indexingRobotsRules } from "@/lib/indexing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ahaframe.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingRobotsRules(),
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
