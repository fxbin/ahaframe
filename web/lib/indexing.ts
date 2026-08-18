import type { Metadata } from "next";
import type { MetadataRoute } from "next";

export function indexingEnabled(): boolean {
  return process.env.AHAFRAME_BUILD_INDEXING_ENABLED === "1";
}

export function indexingMetadata(): Metadata["robots"] {
  const enabled = indexingEnabled();
  return {
    index: enabled,
    follow: enabled,
  };
}

export function indexingRobotsRules(): MetadataRoute.Robots["rules"] {
  return indexingEnabled()
    ? { userAgent: "*", allow: "/" }
    : { userAgent: "*", disallow: "/" };
}
