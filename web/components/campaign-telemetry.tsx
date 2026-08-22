"use client";

import { useEffect } from "react";
import { trackValidationEvent } from "@/lib/validation-client";

export interface CampaignTelemetryItem {
  missionId: string;
  path: string;
  position: number;
  campaignRole: string;
}

export function CampaignTelemetry({ items, campaignVersion }: { items: CampaignTelemetryItem[]; campaignVersion: string }) {
  useEffect(() => {
    const byPath = new Map(items.map((item) => [item.path, item]));
    const seen = new Set<string>();
    const campaignRoot = document.getElementById("campaign");

    const itemForAnchor = (anchor: HTMLAnchorElement) => {
      try {
        return byPath.get(new URL(anchor.href, window.location.href).pathname);
      } catch {
        return undefined;
      }
    };

    const campaignAnchors = campaignRoot
      ? Array.from(campaignRoot.querySelectorAll<HTMLAnchorElement>("a[href]")).filter((anchor) => itemForAnchor(anchor))
      : [];

    const impression = (anchor: HTMLAnchorElement) => {
      const item = itemForAnchor(anchor);
      if (!item || seen.has(item.missionId)) return;
      seen.add(item.missionId);
      trackValidationEvent("homepage_flagship_impression", {
        missionId: item.missionId,
        position: item.position,
        campaignRole: item.campaignRole,
        campaignVersion,
      });
    };

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            impression(entry.target as HTMLAnchorElement);
            observer?.unobserve(entry.target);
          }
        }
      }, { threshold: [0.45] });
      campaignAnchors.forEach((anchor) => observer?.observe(anchor));
    } else {
      campaignAnchors.forEach(impression);
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target) return;
      const item = itemForAnchor(target);
      if (!item) return;
      const source = target.closest("#campaign")
        ? item.position === items.length ? "final-boss" : "campaign"
        : target.closest(".hero-section") ? "hero" : "other";
      trackValidationEvent("homepage_flagship_click", {
        missionId: item.missionId,
        position: item.position,
        source,
        campaignVersion,
      });
    };

    document.addEventListener("click", onClick);
    return () => {
      observer?.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, [campaignVersion, items]);

  return null;
}
