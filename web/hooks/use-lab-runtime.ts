"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadRuntimeScripts, type LabFrame, type LabRuntime, type RuntimeRecord } from "@/lib/runtime-client";
import { runtimeExperience, type RuntimeExperienceKey } from "@/lib/runtime-manifest";

export type RuntimeStatus = "loading" | "ready" | "error";

type LabRuntimeState = {
  key: RuntimeExperienceKey;
  status: RuntimeStatus;
  frame: LabFrame | null;
  error: string | null;
};

export function useLabRuntime(experienceKey: RuntimeExperienceKey) {
  const definition = runtimeExperience(experienceKey);
  const runtimeRef = useRef<LabRuntime | null>(null);
  const [runtimeState, setRuntimeState] = useState<LabRuntimeState>({ key: experienceKey, status: "loading", frame: null, error: null });

  useEffect(() => {
    if (definition.kind !== "lab") return;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    loadRuntimeScripts(definition.scripts)
      .then((api) => {
        if (cancelled) return;
        const runtime = api.createLab(definition.runtimeId, { track: false });
        runtimeRef.current = runtime;
        unsubscribe = runtime.subscribe((nextFrame) => {
          if (!cancelled) setRuntimeState({ key: experienceKey, status: "ready", frame: nextFrame, error: null });
        });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        runtimeRef.current = null;
        setRuntimeState({ key: experienceKey, status: "error", frame: null, error: reason instanceof Error ? reason.message : String(reason) });
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
      runtimeRef.current = null;
    };
  }, [definition.kind, definition.runtimeId, definition.scripts, experienceKey]);

  const requireRuntime = useCallback(() => {
    if (!runtimeRef.current) throw new Error(`Lab runtime ${experienceKey} is not ready.`);
    return runtimeRef.current;
  }, [experienceKey]);

  const kindError = definition.kind === "lab" ? null : `${experienceKey} is not a Lab runtime experience.`;
  const visibleState = runtimeState.key === experienceKey ? runtimeState : { key: experienceKey, status: "loading" as const, frame: null, error: null };

  return {
    status: kindError ? "error" as const : visibleState.status,
    error: kindError ?? visibleState.error,
    frame: kindError ? null : visibleState.frame,
    dispatch: useCallback((typeOrAction: string | RuntimeRecord, payload?: RuntimeRecord) => requireRuntime().dispatch(typeOrAction, payload), [requireRuntime]),
    reset: useCallback(() => requireRuntime().reset(), [requireRuntime]),
    checkpoint: useCallback((name?: string) => requireRuntime().checkpoint(name), [requireRuntime]),
    compare: useCallback((left: unknown, right?: unknown) => requireRuntime().compare(left, right), [requireRuntime]),
    replay: useCallback((actions: RuntimeRecord[], options?: RuntimeRecord) => requireRuntime().replay(actions, options), [requireRuntime]),
    getHistory: useCallback(() => requireRuntime().getHistory(), [requireRuntime]),
  };
}
