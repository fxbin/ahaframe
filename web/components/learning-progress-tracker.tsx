"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/content";
import type { LearningProgressEntry } from "@/lib/learning-progress";
import { LEARNING_STATE_EVENT, setLearningState } from "@/lib/learning-progress";

interface TrackableNode {
  id: string;
  route: string;
}

interface LearningProgressTrackerProps {
  locale: Locale;
  nodes: TrackableNode[];
}

interface LearningStateEventDetail {
  contentId?: string;
  state?: LearningProgressEntry["state"];
}

export function LearningProgressTracker({ locale, nodes }: LearningProgressTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    const validIds = new Set(nodes.map((node) => node.id));
    const segment = locale === "zh-CN" ? "zh-cn" : "en";
    const current = nodes.find((node) => pathname === `/${segment}${node.route}` || pathname === `/${segment}${node.route.replace(/\/$/, "")}`);
    if (current) setLearningState(current.id, "SEEN", validIds);

    function onState(event: Event) {
      const detail = (event as CustomEvent<LearningStateEventDetail>).detail;
      if (!detail?.contentId || !detail.state) return;
      setLearningState(detail.contentId, detail.state, validIds);
    }

    window.addEventListener(LEARNING_STATE_EVENT, onState);
    return () => window.removeEventListener(LEARNING_STATE_EVENT, onState);
  }, [locale, nodes, pathname]);

  return null;
}
