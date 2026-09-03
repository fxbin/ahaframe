"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  GUIDE_PRODUCT_PROGRESS_EVENT,
  GUIDE_PRODUCT_PROGRESS_KEY,
  parseGuideProductProgress,
} from "@/lib/learning-progress";

function subscribe(callback: () => void) {
  window.addEventListener(GUIDE_PRODUCT_PROGRESS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(GUIDE_PRODUCT_PROGRESS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function snapshot() {
  return window.localStorage.getItem(GUIDE_PRODUCT_PROGRESS_KEY) ?? "";
}

function serverSnapshot() {
  return "";
}

export function useGuideProductProgress() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => parseGuideProductProgress(raw), [raw]);
}
