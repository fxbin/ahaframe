import type { Metadata, MetadataRoute } from "next";
import { INDEXING_ENABLED } from "@/.generated/build-mode";

export function indexingEnabled(): boolean {
  return INDEXING_ENABLED;
}

export function indexingMetadata(): Metadata["robots"] {
  return {
    index: INDEXING_ENABLED,
    follow: INDEXING_ENABLED,
  };
}

export function indexingRobotsRules(): MetadataRoute.Robots["rules"] {
  return INDEXING_ENABLED
    ? { userAgent: "*", allow: "/" }
    : { userAgent: "*", disallow: "/" };
}
